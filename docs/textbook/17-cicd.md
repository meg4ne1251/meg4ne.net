# 第17章: CI/CD（GitHub Actions & Watchtower）

## この章で学ぶこと

- CI/CD の概念と必要性
- GitHub Actions のワークフロー構文
- Docker イメージのビルドと GHCR への Push
- Watchtower による Pull 型自動デプロイ
- Dependabot による依存関係の自動更新

---

## 17.1 CI/CD とは

**CI（Continuous Integration: 継続的インテグレーション）**
→ コードの変更を頻繁にメインブランチに統合し、自動テストで品質を保つ

**CD（Continuous Deployment: 継続的デプロイ）**
→ テストをパスしたコードを自動的に本番環境に反映する

```
開発                    CI                      CD
─────────────────    ──────────────────    ──────────────────
PR を作成            → Lint チェック        
                      型チェック            
                      ビルドテスト          
                      ↓ すべて OK          
main にマージ         → Docker ビルド
                      GHCR に Push         → Watchtower が検知
                                             コンテナ自動更新
                                             本番反映完了
```

---

## 17.2 GitHub Actions の基本

GitHub Actions は `.github/workflows/` ディレクトリに YAML ファイルを配置するだけで動きます。

### 基本構文

```yaml
name: ワークフロー名            # GitHub上での表示名

on:                              # トリガー（いつ実行するか）
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:                            # ジョブ（何を実行するか）
  job-name:
    runs-on: ubuntu-latest       # 実行環境
    steps:                       # ステップ（具体的な手順）
      - name: ステップ名
        uses: actions/checkout@v4  # 既存のアクションを使用
      - name: コマンド実行
        run: echo "Hello"          # シェルコマンドを実行
```

---

## 17.3 CI ワークフロー（品質チェック）

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

# 同じPRへの新しいプッシュで古いワークフローをキャンセル
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ──────────────────
  # コード品質チェック
  # ──────────────────
  quality:
    name: Quality Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"     # pnpm のキャッシュを有効化

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # ── チェック並列実行 ──
      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Format check
        run: pnpm format:check

      - name: Build
        run: pnpm build

  # ──────────────────
  # API サーバーのチェック
  # ──────────────────
  api-quality:
    name: API Quality Check
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: server

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
          cache-dependency-path: server/pnpm-lock.yaml

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Build
        run: pnpm build
```

### 解説

**`--frozen-lockfile`**
```
ロックファイル（pnpm-lock.yaml）に厳密に従ってインストール。
CI で「たまたま新しいバージョンが入ってテスト失敗」を防ぐ。
```

**`concurrency` + `cancel-in-progress`**
```
PR に追加のコミットをプッシュすると:
  古い CI ← キャンセル（無駄なリソースを使わない）
  新しい CI ← 実行
```

**`cache: "pnpm"`**
```
node_modules を GitHub にキャッシュ。
2回目以降のインストールが大幅に高速化（数分→数秒）。
```

---

## 17.4 CD ワークフロー（Docker ビルド & Push）

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]  # main にマージされた時のみ

env:
  REGISTRY: ghcr.io
  FRONTEND_IMAGE: ghcr.io/${{ github.repository }}/frontend
  API_IMAGE: ghcr.io/${{ github.repository }}/api

jobs:
  # ──────────────────
  # フロントエンドのビルド & Push
  # ──────────────────
  build-frontend:
    name: Build Frontend
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write    # GHCR への Push に必要

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build & Push Frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/frontend/Dockerfile
          push: true
          tags: |
            ${{ env.FRONTEND_IMAGE }}:latest
            ${{ env.FRONTEND_IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ──────────────────
  # API サーバーのビルド & Push
  # ──────────────────
  build-api:
    name: Build API
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build & Push API
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/api/Dockerfile
          push: true
          tags: |
            ${{ env.API_IMAGE }}:latest
            ${{ env.API_IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### GHCR（GitHub Container Registry）の解説

```
Docker Hub    = パブリックなレジストリ（Docker 公式）
GHCR          = GitHub 提供のレジストリ（リポジトリに紐付く）

GHCR の利点:
  ・リポジトリの権限をそのまま使える
  ・GITHUB_TOKEN で認証可能（別途トークン不要）
  ・Public リポジトリなら無料・容量無制限
```

### タグ戦略

```yaml
tags: |
  ghcr.io/user/repo/frontend:latest       # 常に最新を指す
  ghcr.io/user/repo/frontend:abc123def     # コミットハッシュ

latest → Watchtower が追跡するタグ
sha    → 問題発生時に特定バージョンに戻すため
```

### ビルドキャッシュ

```yaml
cache-from: type=gha    # GitHub Actions のキャッシュからレイヤーを取得
cache-to: type=gha,mode=max  # ビルドレイヤーをキャッシュに保存
```

Docker のレイヤーキャッシュを GitHub Actions のキャッシュに保存することで、2回目以降のビルドが大幅に高速化します。

---

## 17.5 Watchtower（Pull 型自動デプロイ）

### なぜ Pull 型なのか

```
Push 型（Webhook）:
  GitHub → Webhook → 自宅サーバー
  問題: 自宅サーバーが Webhook を受け取るポートを開ける必要がある
       → ファイアウォールに穴を開ける = セキュリティリスク

Pull 型（Watchtower）:
  自宅サーバー → 定期的に GHCR をチェック → 新しいイメージを Pull
  利点: 外向きの通信のみ。ポート開放不要
       → ファイアウォールを堅牢に保てる
```

要件定義書の記載:
> 外部からのWebhookを受け取るためのポート開放が不要であり、自宅サーバーのファイアウォール設定を堅牢に保ったまま自動デプロイを実現できるため。

### Watchtower の設定（docker-compose.yml）

```yaml
# 第15章でも記載済みですが、詳しく解説します
watchtower:
  image: containrrr/watchtower
  container_name: meg4ne-watchtower
  restart: unless-stopped
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    # GHCR の認証情報
    - ~/.docker/config.json:/config.json:ro
  environment:
    # 古いイメージを自動削除（ディスク節約）
    - WATCHTOWER_CLEANUP=true
    # チェック間隔（秒）: 300 = 5分
    - WATCHTOWER_POLL_INTERVAL=300
    # 停止中のコンテナは更新しない
    - WATCHTOWER_INCLUDE_STOPPED=false
    # 更新前に新イメージの Pull を完了させる（ダウンタイム短縮）
    - WATCHTOWER_LIFECYCLE_HOOKS=true
  command: meg4ne-frontend meg4ne-api  # 監視対象のコンテナ名
```

### GHCR への認証

Watchtower が GHCR からイメージを Pull するには認証が必要です。

```bash
# 自宅サーバーで GHCR にログイン
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# 認証情報が ~/.docker/config.json に保存される
# → Watchtower にマウントして使用
```

### デプロイの流れ

```
1. main にマージ
2. GitHub Actions が発火
   → Docker イメージをビルド
   → GHCR に Push（:latest タグ）
3. Watchtower が5分以内に検知
   → GHCR から新しいイメージを Pull
   → 古い新しいイメージでコンテナを再作成
4. 新しいコンテナが起動
5. 古いイメージは自動削除（CLEANUP=true）

所要時間: マージから反映まで約5〜10分
```

---

## 17.6 Dependabot 設定

```yaml
# .github/dependabot.yml
version: 2
updates:
  # フロントエンド（npm）の依存関係
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Tokyo"
    # 自動マージしないPRの最大数
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "frontend"

  # API サーバー（npm）の依存関係
  - package-ecosystem: "npm"
    directory: "/server"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Tokyo"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "api"

  # GitHub Actions のバージョン管理
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "ci"

  # Docker イメージのベースバージョン管理
  - package-ecosystem: "docker"
    directory: "/docker/frontend"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "docker"

  - package-ecosystem: "docker"
    directory: "/docker/api"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "docker"
```

### Dependabot の動作

```
毎週月曜 9:00 (JST):
  → Dependabot が依存関係をチェック
  → 新しいバージョンがあれば自動で PR を作成
  → PR に CI が走る（lint, type-check, build）
  → すべてパスしたら手動で確認してマージ

例:
  PR: "Bump astro from 4.5.0 to 4.6.0"
  CI: ✅ Lint  ✅ Type-check  ✅ Build
  → レビューしてマージ → 自動デプロイ
```

---

## 17.7 PR の保護ルール

GitHub リポジトリの Settings → Branches で設定します。

```
Branch protection rule for "main":
  ✅ Require a pull request before merging
     ✅ Require approvals: 1
  ✅ Require status checks to pass before merging
     ✅ quality (CI のジョブ名)
     ✅ api-quality
  ✅ Do not allow bypassing the above settings
```

これにより：
- `main` ブランチへの直接 push が禁止される
- CI が失敗した PR はマージできない
- 最低1人の承認（Approve）が必要

> 注意: 個人開発で承認者が自分だけの場合、自分で Approve する運用になります。
> それでも「CI をパスしないとマージできない」保護があるだけで価値があります。

---

## 17.8 ディレクトリ構成

```
.github/
├── dependabot.yml
└── workflows/
    ├── ci.yml              # PR 時の品質チェック
    ├── deploy.yml          # main マージ時のビルド&デプロイ
    └── scheduled-build.yml # 定期ビルド（RSS更新用）
```

---

## 17.9 この章のまとめ

### CI/CD パイプライン全体像

```
PR 作成 → CI（lint, type-check, build）→ レビュー → main マージ
  → CD（Docker build → GHCR Push）→ Watchtower 検知 → 自動更新
```

### 各ツールの役割

| ツール | 役割 | タイミング |
|---|---|---|
| **GitHub Actions（CI）** | コードの品質チェック | PR 作成時 |
| **GitHub Actions（CD）** | Docker ビルド & Push | main マージ時 |
| **GHCR** | Docker イメージの保管 | Push 時 |
| **Watchtower** | コンテナの自動更新 | 5分ごとのポーリング |
| **Dependabot** | 依存関係の更新PR作成 | 毎週月曜 |

### セキュリティのポイント

- **`GITHUB_TOKEN`** は自動で提供される（Secrets に登録不要）
- **Pull 型デプロイ** でポート開放が不要
- **ブランチ保護** で CI 未通過コードのマージを防止

---

次の章: [第18章: Cloudflare Tunnel & Web Analytics](./18-cloudflare.md)
