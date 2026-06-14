# 第20章: セキュリティとベストプラクティス

## この章で学ぶこと

- Public リポジトリにおけるセキュリティ意識
- ネットワーク分離（DMZ / VLAN）の設計
- 最小権限の原則の実践
- 環境変数と Secrets の管理
- 運用時のセキュリティチェックリスト

---

## 20.1 Public リポジトリのリスク

要件定義書の記載:
> **本プロジェクトはGitHubのPublicリポジトリとして公開される。**
> APIキーや個人情報（非公開にすべきもの）の管理に注意する

Public リポジトリは**世界中の誰でもソースコードを閲覧できる**状態です。
一度でも機密情報をコミットすると、**Git の履歴に残り続ける**ため、`git revert` しても取り消せません。

### 絶対に含めてはいけない情報

| 情報 | 危険度 | 対策 |
|---|---|---|
| API トークン / シークレット | ★★★★★ | `.env` + `.gitignore` |
| IP アドレス（内部） | ★★★★☆ | BFF でサニタイズ |
| MAC アドレス | ★★★☆☆ | BFF でサニタイズ |
| ユーザー名 / パスワード | ★★★★★ | `.env` + `.gitignore` |
| 内部ネットワーク構成図（IP入り） | ★★★★☆ | IP を伏せた概念図のみ公開 |
| SSH 鍵 | ★★★★★ | 絶対にコミットしない |
| `.pem` / `.key` ファイル | ★★★★★ | `.gitignore` で除外 |

---

## 20.2 `.gitignore` のセキュリティ設計

```gitignore
# .gitignore

# ── 環境変数（最重要） ──
.env
.env.*
!.env.example

# ── 認証情報 ──
*.pem
*.key
*.cert
*.p12

# ── Cloudflare 認証 ──
.cloudflared/

# ── Docker 認証 ──
docker-config.json

# ── ビルド成果物 ──
dist/
node_modules/

# ── OS / エディタ ──
.DS_Store
```

### `.env.example` パターン

`.env` は Git に含めませんが、「どんな環境変数が必要か」は記録しておきます。

```bash
# .env.example（Git に含める / 値は空）
# Proxmox API
PROXMOX_API_URL=
PROXMOX_TOKEN_ID=
PROXMOX_TOKEN_SECRET=
PROXMOX_NODE_NAME=

# API Server
API_PORT=3001

# Cloudflare
PUBLIC_CF_ANALYTICS_TOKEN=
CLOUDFLARE_TUNNEL_TOKEN=

# Frontend
PUBLIC_API_URL=http://localhost:3001
```

新しい開発者（または未来の自分）が `.env.example` を見て `.env` を作成できるようにします。

---

## 20.3 GitHub Secrets

GitHub Actions で使う機密情報は **GitHub Secrets** に保存します。

```
リポジトリ Settings → Secrets and variables → Actions → New repository secret

保存する Secrets:
  GHCR_PAT → GitHub Container Registry 用のパーソナルアクセストークン
  （GITHUB_TOKEN は自動提供されるため不要な場合も多い）
```

ワークフロー内での参照:

```yaml
# .github/workflows/deploy.yml
- name: Login to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}  # 自動提供
```

**`secrets.*` は GitHub Actions のログに自動でマスクされます（`***` と表示）。**

---

## 20.4 ネットワーク分離

要件定義書の記載:
> Web公開用のコンテナ群（Nginx, Astro, API）は、自宅ネットワーク内のDMZ（または専用VLAN）に配置し、内部の重要セグメント（管理LAN）への通信をファイアウォールで厳格に遮断する。

### ネットワーク構成図

```
┌─── インターネット ────────────────────────┐
│                                           │
└───────────────┬───────────────────────────┘
                │
        Cloudflare Tunnel
                │
┌───── DMZ (VLAN 10) ──────────────────────┐
│                                           │
│  ┌─── Web公開VM ────────────────────┐    │
│  │  Nginx + Astro + API + cloudflared│    │
│  └──────────────────────────────────┘    │
│                                           │
│  ファイアウォールルール:                    │
│  ✅ DMZ → Internet (outbound)            │
│  ✅ DMZ → Proxmox API (port 8006 only)   │
│  ❌ DMZ → 管理LAN (DENY ALL)             │
│  ❌ DMZ → 他の内部セグメント (DENY ALL)     │
│                                           │
└───────────────────────────────────────────┘

┌───── 管理LAN (VLAN 20) ──────────────────┐
│                                           │
│  Proxmox ホスト（管理用）                   │
│  バックアップサーバー                        │
│  その他の内部サービス                        │
│                                           │
│  ファイアウォールルール:                    │
│  ❌ Internet → 管理LAN (DENY ALL)         │
│  ❌ DMZ → 管理LAN (DENY ALL)              │
│  ✅ 管理LAN → DMZ (管理目的)               │
│                                           │
└───────────────────────────────────────────┘
```

### なぜ分離するのか

```
万が一 Web 公開 VM が侵害されたとしても:
  ✅ 管理 LAN へのアクセスはファイアウォールで遮断
  ✅ Proxmox 管理画面には到達できない
  ✅ バックアップデータにはアクセスできない
  ✅ 他の VM・サービスは影響を受けない

つまり「被害を Web 公開 VM 1台に封じ込める」設計
```

---

## 20.5 最小権限の原則

要件定義書の記載:
> 監視用APIが使用するProxmoxのAPIトークンには、監視に必要な「読み取り専用権限」のみを付与し、操作権限（再起動、作成、削除等）は持たせない。

### 実践例

| 対象 | 権限 | 理由 |
|---|---|---|
| **Proxmox API トークン** | PVEAuditor（読み取り専用） | VM の再起動・削除を不可能にする |
| **Docker コンテナ** | 非 root ユーザー | ホスト OS へのエスケープを困難にする |
| **GitHub Actions** | `permissions` で必要な権限のみ | 不要な権限を付与しない |
| **Cloudflare Tunnel** | 特定ホスト名のみ | 他のサービスを誤って公開しない |

### GitHub Actions の権限制限

```yaml
# ❌ デフォルト（全権限）
permissions: write-all

# ✅ 必要な権限のみ明示
permissions:
  contents: read    # ソースコードの読み取り
  packages: write   # GHCR への Push
```

---

## 20.6 依存パッケージのセキュリティ

### npm audit

```bash
# 脆弱性のチェック
pnpm audit

# 自動修正可能なものを修正
pnpm audit --fix
```

### Dependabot（第17章で設定済み）

Dependabot が自動でセキュリティアップデートのPRを作成します。

```
Dependabot security alert:
  "axios" のバージョン X.X.X に脆弱性が発見されました
  → 自動で PR を作成
  → CI が通れば安心してマージ可能
```

### GitHub の Security タブ

リポジトリの **Security** タブで以下を確認できます:

- **Dependabot alerts**: 脆弱性のある依存パッケージ
- **Code scanning**: コードの脆弱性（GitHub Advanced Security）
- **Secret scanning**: 誤ってコミットされた API キーの検知

---

## 20.7 コンテンツセキュリティのチェックリスト

### 公開前に確認すること

```
──── コード・設定 ────
[ ] .env が .gitignore に含まれている
[ ] .env.example に値が入っていない
[ ] Git 履歴に機密情報が含まれていない
[ ] API トークンがフロントエンドのコードに含まれていない
[ ] console.log にデバッグ用の機密情報が残っていない

──── ネットワーク ────
[ ] DMZ / VLAN が設定されている
[ ] DMZ → 管理LAN の通信がブロックされている
[ ] Proxmox API トークンが PVEAuditor（読み取り専用）
[ ] Cloudflare Tunnel で meg4ne.net のみ公開されている
[ ] 不要なポートが開いていない

──── アプリケーション ────
[ ] BFF がデータをサニタイズしている（IP, MAC除去）
[ ] エラーメッセージに内部情報が含まれていない
[ ] CORS が適切に設定されている
[ ] セキュリティヘッダーが Nginx で設定されている
[ ] Docker コンテナが非 root で実行されている

──── GitHub ────
[ ] ブランチ保護が設定されている
[ ] Dependabot が有効
[ ] Secret scanning が有効
```

---

## 20.8 万が一、機密情報をコミットしてしまったら

```bash
# 注意: Git の履歴から完全に削除するのは困難

# 1. すぐにトークン/パスワードを無効化・再発行する（最優先）
#    → Proxmox API トークンの再生成
#    → GitHub PAT の再発行
#    → パスワードの変更

# 2. Git 履歴からの削除（git filter-branch または BFG Repo-Cleaner）
#    → Public リポジトリの場合、既にフォーク・クローンされている可能性がある
#    → トークンの無効化が最も確実な対策

# BFG Repo-Cleaner を使う場合:
bfg --replace-text passwords.txt  # ファイル中の機密文字列を置換
git push --force
```

**最も重要なのは「トークンの即時無効化」です。**
Git 履歴の書き換えよりも、認証情報そのものを使えなくすることが先決です。

---

## 20.9 運用セキュリティ

### 定期的に行うべきこと

| 頻度 | タスク |
|---|---|
| **毎週** | Dependabot の PR を確認・マージ |
| **毎月** | `pnpm audit` でパッケージの脆弱性をチェック |
| **毎月** | Docker ベースイメージの更新（Dependabot が PR 作成） |
| **四半期** | API トークンのローテーション（再発行） |
| **随時** | GitHub Security alerts の確認 |

### ログの監視

```bash
# Nginx のアクセスログを確認
docker compose logs -f nginx

# 不審なリクエストがないか確認
# 例: /wp-admin, /phpmyadmin などの攻撃的なパスへのアクセス
docker compose logs nginx | grep -E "wp-admin|phpmyadmin|\.env"
```

---

## 20.10 この章のまとめ

### セキュリティの 5 つの原則

1. **機密情報の分離** → `.env` + `.gitignore`、BFF でサニタイズ
2. **最小権限** → PVEAuditor、非root コンテナ、権限限定の Actions
3. **ネットワーク分離** → DMZ / VLAN、ファイアウォールルール
4. **多層防御** → Cloudflare + Nginx + BFF + VLAN（1つ突破されても次の壁がある）
5. **継続的な更新** → Dependabot、定期的な audit、トークンローテーション

### 本教科書で実装したセキュリティ対策の一覧

| 層 | 対策 | 章 |
|---|---|---|
| **CDN/Edge** | Cloudflare DDoS防御 | 第18章 |
| **トンネル** | Cloudflare Tunnel（ポート開放なし） | 第18章 |
| **Webサーバー** | Nginx セキュリティヘッダー | 第16章 |
| **アプリ** | BFF サニタイズ、CORS | 第13章 |
| **コンテナ** | 非root実行、最小イメージ | 第15章 |
| **ネットワーク** | DMZ/VLAN分離 | 第20章 |
| **認証** | PVEAuditor（読み取り専用） | 第13章 |
| **CI/CD** | ブランチ保護、CI必須 | 第17章 |
| **依存関係** | Dependabot、npm audit | 第17章 |
| **情報管理** | .env、GitHub Secrets | 第20章 |

---

## おわりに

ここまで全20章を通して、あなたのポートフォリオサイト meg4ne.net の構築に必要な知識を学んできました。

### この教科書で扱った範囲

```
Part 1: 基礎知識
  開発環境 → TypeScript → Astro → React

Part 2: サイト構築
  プロジェクト初期化 → レイアウト → スタイリング → コンテンツ
  → Markdown → 画像 → 3Dビューワー → 外部API

Part 3: バックエンド
  BFF API → リアルタイムモニター

Part 4: インフラ & デプロイ
  Docker → Nginx → CI/CD → Cloudflare

Part 5: 品質 & 運用
  パフォーマンス & SEO → セキュリティ
```

### 実装の進め方のアドバイス

1. **Part 1 → Part 2 の順に進める**（基礎 → 実装）
2. **1ページずつ動作確認しながら進める**（一気に全部作らない）
3. **早い段階で Docker 化する**（Ch.15 は Part 2 の途中でもOK）
4. **CI/CD は最初に設定する**（lint エラーを早期に発見）
5. **完璧を求めず、まず動くものを作る**（改善は後からいくらでもできる）

完成を目指して、一歩ずつ進んでいきましょう。

← 前の章: [第19章: パフォーマンスと SEO](./19-performance-seo.md)
| [目次に戻る](./00-index.md)
