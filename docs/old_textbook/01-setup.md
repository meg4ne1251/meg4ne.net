# 第1章: 開発環境のセットアップ

## この章で学ぶこと

- なぜ特定のツールを使うのか
- Node.js と pnpm のインストール
- VS Code の推奨拡張機能
- Git の基本設定
- EditorConfig によるコード統一

---

## 1.1 全体像を理解する

Web 開発を始める前に、「なぜこれらのツールが必要なのか」を理解しましょう。

```
あなたのPC
├── Node.js .............. JavaScript をブラウザの外で動かすための実行環境
│   └── pnpm ............. パッケージマネージャ（ライブラリの管理ツール）
├── VS Code .............. コードエディタ（拡張機能で開発を効率化）
├── Git .................. バージョン管理（変更履歴を記録・共有）
└── Docker ............... コンテナ技術（本番環境と同じ環境を再現）
```

### なぜ Node.js が必要なのか？

Astro や React などのモダン Web フレームワークは、ブラウザ上で動くコードを**ビルド（変換・最適化）**するために Node.js を使います。TypeScript → JavaScript への変換、CSS の最適化、画像の圧縮など、すべて Node.js 上のツールが行います。

### なぜパッケージマネージャが必要なのか？

現代の Web 開発では、何千もの小さなライブラリ（パッケージ）を組み合わせてアプリを作ります。これらのダウンロード、バージョン管理、依存関係の解決を自動でやってくれるのがパッケージマネージャです。

---

## 1.2 Node.js のインストール

### バージョン管理ツールを使う理由

Node.js を公式サイトから直接インストールすることもできますが、**バージョン管理ツール**を使うことを強く推奨します。理由は：

1. **プロジェクトごとに異なる Node.js バージョンを使い分けられる**
2. **アップデートやバージョン切り替えが簡単**
3. **sudo（管理者権限）なしでインストールできる**

### fnm（Fast Node Manager）のインストール

`fnm` は Rust 製の高速な Node.js バージョン管理ツールです。

```bash
# fnm をインストール（Linux）
curl -fsSL https://fnm.vercel.app/install | bash

# シェルを再起動するか、以下を実行
source ~/.bashrc  # bash の場合
# source ~/.zshrc  # zsh の場合

# 動作確認
fnm --version
```

### Node.js のインストール

```bash
# LTS（Long Term Support = 長期サポート版）をインストール
fnm install --lts

# インストールされたバージョンを確認
node --version  # v22.x.x のように表示される
npm --version   # npm も一緒にインストールされる
```

> **LTS とは？**: Node.js には「最新版(Current)」と「安定版(LTS)」があります。LTS は約30ヶ月間セキュリティアップデートが提供される安定版です。本番運用するプロジェクトでは LTS を使うのが定石です。

---

## 1.3 pnpm のインストール

### なぜ npm ではなく pnpm なのか？

Node.js に付属する `npm` でも開発はできますが、`pnpm` を使う理由があります：

| 特徴 | npm | pnpm |
|---|---|---|
| ディスク使用量 | プロジェクトごとにパッケージをコピー | グローバルストアでシンボリックリンク → **省容量** |
| インストール速度 | 普通 | **高速**（キャッシュ効率が高い） |
| 厳格さ | node_modules に全パッケージが平坦に配置 | **宣言した依存のみ**アクセス可能（Phantom Dependency 防止） |

特に3つ目が重要です。pnpm は `package.json` に書いていないパッケージを暗黙的に使えないようにするため、「自分のPCでは動くのにCI（自動テスト環境）では動かない」という問題を防げます。

```bash
# pnpm のインストール（Node.js 16.13 以降）
corepack enable

# 動作確認
pnpm --version
```

> **corepack とは？**: Node.js 16.9 以降に標準搭載されたパッケージマネージャの管理ツールです。npm, pnpm, yarn を統一的にインストール・管理できます。`corepack enable` を実行するだけで、`package.json` の `packageManager` フィールドに基づいて適切なバージョンの pnpm が自動で使われます。
>
> **注意**: 以前は `corepack prepare pnpm@latest --activate` というコマンドが使われていましたが、現在は非推奨です。`corepack enable` だけで十分です。

---

## 1.4 VS Code の推奨拡張機能

VS Code の拡張機能は、コーディング効率とコード品質を大幅に向上させます。以下は本プロジェクトで推奨する拡張機能です。

### 必須拡張機能

| 拡張機能 | ID | 理由 |
|---|---|---|
| **Astro** | `astro-build.astro-vscode` | `.astro` ファイルのシンタックスハイライト、自動補完、エラー検出 |
| **ESLint** | `dbaeumer.vscode-eslint` | コードの問題を自動検出（Linter） |
| **Prettier** | `esbenp.prettier-vscode` | コードの自動整形（Formatter） |
| **TypeScript** | VS Code に標準搭載 | 型チェックと自動補完 |

### 推奨拡張機能

| 拡張機能 | ID | 理由 |
|---|---|---|
| **Error Lens** | `usernamehw.errorlens` | エラーをエディタ行内に直接表示 |
| **GitLens** | `eamodio.gitlens` | Git の変更履歴を視覚的に表示 |
| **Docker** | `ms-azuretools.vscode-docker` | Dockerfile のシンタックスハイライト |
| **Thunder Client** | `rangav.vscode-thunder-client` | API テストツール（Postman の代替） |
| **Japanese Language Pack** | `MS-CEINTL.vscode-language-pack-ja` | VS Code の日本語化 |

### ワークスペース設定

プロジェクトルートに `.vscode/settings.json` を作成し、チーム（と将来の自分）のために設定を統一します：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[astro]": {
    "editor.defaultFormatter": "astro-build.astro-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n"
}
```

**なぜ設定ファイルを共有するのか？**

- `.vscode/settings.json` を Git に含めることで、このリポジトリをクローンした人が同じ設定で開発できます
- `editor.formatOnSave: true` により、保存するたびにコードが自動整形され、スタイルの差異によるコンフリクトを防ぎます

### 推奨拡張機能の共有

`.vscode/extensions.json` を作成すると、VS Code がリポジトリを開いた時に推奨拡張機能のインストールを提案してくれます：

```json
{
  "recommendations": [
    "astro-build.astro-vscode",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "usernamehw.errorlens",
    "eamodio.gitlens",
    "ms-azuretools.vscode-docker"
  ]
}
```

---

## 1.5 Git の設定

あなたは既に Git を使っているようなので、基本的な設定は済んでいるかもしれません。以下は確認・補足事項です。

### グローバル設定の確認

```bash
# 設定確認
git config --global user.name
git config --global user.email

# 未設定の場合
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### .gitignore の設計

このプロジェクトでは、以下のファイルを Git に含めてはいけません。セキュリティ上の理由が主です：

```gitignore
# === 依存関係 ===
# node_modules は pnpm install で再現できるため、Git に含めない
# （容量が大きく、環境依存のバイナリも含むため）
node_modules/

# === ビルド成果物 ===
# ビルドで生成されるファイルはソースコードから再現可能
dist/
.astro/

# === 環境変数（最重要）===
# APIキー、トークンなどの秘密情報は絶対に Git に含めない！
# GitHub は Public リポジトリなので、全世界に公開されてしまう
.env
.env.local
.env.production

# === OS / エディタ生成ファイル ===
.DS_Store
*.swp
*.swo

# === Docker ===
# Docker Compose の環境変数ファイル
docker-compose.override.yml
```

> **⚠️ 重要**: 要件定義書にある通り、このプロジェクトは **GitHub Public リポジトリ** として公開されます。一度 Git に commit してしまった秘密情報は、コミット履歴に残り続けます。`git push` 前に必ず `.env` ファイルが `.gitignore` に含まれていることを確認してください。

### ブランチ戦略

要件定義書に「**PRのマージには承認(Review/Approve)を必須とする**」とあります。一人開発でも PR ベースの運用を行うことで：

1. **変更の記録が残る**（何をなぜ変えたか）
2. **CI（自動テスト）が走る**（壊れていないか確認できる）
3. **ロールバックが容易**（問題があった時に戻しやすい）

```
main ─────────────────────────── 本番ブランチ（常にデプロイ可能）
  └── feature/about-page ────── 機能ブランチ（ここで作業）
  └── feature/server-monitor ── 別の機能ブランチ
  └── fix/header-layout ─────── バグ修正ブランチ
```

ブランチ名の命名規則：
- `feature/xxx` ... 新機能の追加
- `fix/xxx` ... バグの修正
- `docs/xxx` ... ドキュメントの更新
- `refactor/xxx` ... 動作を変えないコードの改善

---

## 1.6 EditorConfig

異なるエディタやOSを使う開発者がいても、基本的なファイルフォーマット（インデント、改行コードなど）を統一するための設定ファイルです。

プロジェクトルートに `.editorconfig` を作成します：

```ini
# EditorConfig: https://editorconfig.org
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

**各設定の意味：**

| 設定 | 値 | 理由 |
|---|---|---|
| `indent_style` | `space` | タブ幅の解釈はエディタにより異なるため、スペースで統一 |
| `indent_size` | `2` | JavaScript/TypeScript のデファクトスタンダード |
| `end_of_line` | `lf` | Linux（本番サーバー）に合わせる。Windows の CRLF は差分ノイズの原因になる |
| `trim_trailing_whitespace` | `true` | 行末の無駄なスペースを除去（ただし Markdown は例外） |
| `insert_final_newline` | `true` | POSIX 準拠。最終行に改行がないと一部ツールで問題が出る |

---

## 1.7 この章のまとめと確認項目

### セットアップが完了したか確認しよう

以下のコマンドがすべて正常に動作すれば、開発環境の準備は完了です：

```bash
# Node.js
node --version    # v22.x.x

# pnpm
pnpm --version    # 9.x.x

# Git
git --version     # git version 2.x.x

# Docker（既にインストール済みのはず）
docker --version  # Docker version 2x.x.x
docker compose version  # Docker Compose version v2.x.x
```

### この章で作成したファイル

```
meg4ne.net/
├── .editorconfig
├── .gitignore
└── .vscode/
    ├── settings.json
    └── extensions.json
```

### 重要なポイントの復習

1. **Node.js はバージョン管理ツール（fnm）経由で入れる** → 複数バージョンの切り替えが楽
2. **pnpm を使う** → ディスク節約 + 厳格な依存管理
3. **VS Code の設定は `.vscode/` に共有する** → 誰が開いても同じ環境
4. **`.gitignore` で秘密情報を守る** → Public リポジトリでは特に重要
5. **PR ベースの運用を行う** → 品質管理と変更追跡

---

次の章: [第2章: TypeScript 入門](./02-typescript.md)
