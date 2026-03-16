# 第15章: Docker & Docker Compose

## この章で学ぶこと

- Docker の基本概念（イメージ、コンテナ、レイヤー）
- Dockerfile の書き方と最適化（マルチステージビルド）
- Docker Compose による複数コンテナの管理
- 本プロジェクトのコンテナ構成

---

## 15.1 Docker とは何か

Docker は「アプリケーションとその動作に必要な環境をまとめてパッケージ化する」ツールです。

### なぜ Docker を使うのか

```
問題: 「自分の PC では動いたのに、サーバーでは動かない」
原因: Node.js のバージョン違い、OS の違い、依存パッケージの差異

解決: Docker でアプリと環境をまとめて「コンテナ」として配布
     → どの環境でも同じように動作する
```

### 基本用語

| 用語 | 意味 | 例え |
|---|---|---|
| **イメージ** | アプリの設計図 | クラスの定義 |
| **コンテナ** | イメージから作られた実体 | クラスのインスタンス |
| **Dockerfile** | イメージの作り方の手順書 | レシピ |
| **レジストリ** | イメージの保管場所 | Docker Hub, GHCR |
| **ボリューム** | データの永続化領域 | コンテナが消えても残る |

---

## 15.2 プロジェクトのコンテナ構成

要件定義書の記載:
> 1つのVM内に Nginx（リバースプロキシ）コンテナ、Astro（フロントエンド）コンテナ、APIコンテナを同居させる（Docker Compose構成）

```
┌──── Docker Compose ──────────────────────────────┐
│                                                   │
│  ┌──────────┐    ┌──────────┐    ┌────────────┐  │
│  │  Nginx   │    │  Astro   │    │  API       │  │
│  │  :80     │───▶│  :4321   │    │  (Hono)    │  │
│  │  :443    │    │          │    │  :3001     │  │
│  │          │────────────────────▶│            │  │
│  └──────────┘    └──────────┘    └────────────┘  │
│       │                               │          │
│       │                               ▼          │
│       ▼                          Proxmox API     │
│   Cloudflare                     (内部ネット)      │
│   Tunnel                                         │
└──────────────────────────────────────────────────┘
```

---

## 15.3 フロントエンド（Astro）の Dockerfile

```dockerfile
# docker/frontend/Dockerfile

# ========================================
# Stage 1: 依存関係のインストール
# ========================================
FROM node:20-alpine AS deps

# corepack を有効化して pnpm を使えるようにする
RUN corepack enable

WORKDIR /app

# package.json と pnpm-lock.yaml だけ先にコピー
# → 依存関係が変わらない限りキャッシュが効く
COPY package.json pnpm-lock.yaml ./

# 本番用の依存関係のみインストール
RUN pnpm install --frozen-lockfile

# ========================================
# Stage 2: ビルド
# ========================================
FROM node:20-alpine AS builder

RUN corepack enable

WORKDIR /app

# deps ステージからnode_modulesをコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Astro のビルド（静的ファイルを生成）
RUN pnpm build

# ========================================
# Stage 3: 本番用イメージ
# ========================================
FROM nginx:alpine AS production

# ビルド結果だけを Nginx に配置
COPY --from=builder /app/dist /usr/share/nginx/html

# カスタム Nginx 設定（次の章で詳しく解説）
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### マルチステージビルドの解説

```
ステージ1 (deps)        ステージ2 (builder)      ステージ3 (production)
node_modules を          ソースコードを            ビルド結果の dist/ だけ
インストール             ビルド                    Nginx に配置

├── node_modules/       ├── node_modules/         ├── dist/
├── package.json        ├── src/                  │   ├── index.html
└── pnpm-lock.yaml      ├── dist/  ← 生成物       │   ├── assets/
                        └── ...                   └── nginx.conf

サイズ: ~500MB           サイズ: ~800MB             サイズ: ~30MB ✨
```

**なぜ分けるのか？**

最終イメージに `node_modules`（数百MB）やソースコードを含める必要はありません。ビルド済みの HTML/CSS/JS ファイルだけがあれば十分です。マルチステージビルドで最終イメージを劇的に小さくできます。

### Docker レイヤーキャッシュ

```dockerfile
# ❌ キャッシュが効きにくい（ソースの変更で全部やり直し）
COPY . .
RUN pnpm install

# ✅ キャッシュが効く（依存が変わらなければ install をスキップ）
COPY package.json pnpm-lock.yaml ./  # まず定義ファイルだけ
RUN pnpm install                      # → キャッシュヒット!
COPY . .                               # ソースは後から
```

Docker はレイヤー（命令）ごとにキャッシュを持ちます。変更がないレイヤーはスキップされるため、`package.json` を先にコピーすることでビルド時間を短縮できます。

---

## 15.4 API サーバーの Dockerfile

```dockerfile
# docker/api/Dockerfile

# ========================================
# Stage 1: 依存関係のインストール
# ========================================
FROM node:20-alpine AS deps

RUN corepack enable

WORKDIR /app

COPY server/package.json server/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# ========================================
# Stage 2: ビルド
# ========================================
FROM node:20-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY server/ .

# TypeScript → JavaScript にコンパイル
RUN pnpm build

# ========================================
# Stage 3: 本番用イメージ
# ========================================
FROM node:20-alpine AS production

RUN corepack enable

WORKDIR /app

# 本番用の依存関係のみ再インストール
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY server/package.json ./

# セキュリティ: root ユーザーで実行しない
RUN addgroup -g 1001 -S nodejs && \
    adduser -S hono -u 1001 -G nodejs
USER hono

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### 非 root ユーザーでの実行

```dockerfile
# ❌ デフォルトは root で実行される
# コンテナが侵害されると root 権限で何でもできる

# ✅ 専用ユーザーで実行（最小権限の原則）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S hono -u 1001 -G nodejs
USER hono
```

---

## 15.5 Docker Compose

```yaml
# docker-compose.yml（本番用 — GHCR のイメージを使用）
# Watchtower がイメージの更新を検知するには image: 指定が必要
# ローカルビルドの場合は docker-compose.build.yml を使う
services:
  # ──────────────────
  # フロントエンド
  # ──────────────────
  frontend:
    image: ghcr.io/あなたのユーザー名/meg4ne-net/frontend:latest
    container_name: meg4ne-frontend
    restart: unless-stopped
    networks:
      - web

  # ──────────────────
  # API サーバー
  # ──────────────────
  api:
    image: ghcr.io/あなたのユーザー名/meg4ne-net/api:latest
    container_name: meg4ne-api
    restart: unless-stopped
    env_file:
      - ./server/.env
    networks:
      - web

  # ──────────────────
  # Nginx リバースプロキシ
  # ──────────────────
  nginx:
    image: nginx:alpine
    container_name: meg4ne-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/conf.d:/etc/nginx/conf.d:ro
    depends_on:
      - frontend
      - api
    networks:
      - web

  # ──────────────────
  # Watchtower（自動更新）
  # ──────────────────
  watchtower:
    image: containrrr/watchtower
    container_name: meg4ne-watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true          # 古いイメージを自動削除
      - WATCHTOWER_POLL_INTERVAL=300     # 5分ごとにチェック
      - WATCHTOWER_INCLUDE_STOPPED=false # 停止中のコンテナは更新しない
    networks:
      - web

networks:
  web:
    driver: bridge
```

### 各設定の解説

**`restart: unless-stopped`**
```
コンテナが停止した場合に自動再起動する。
ただし、手動で `docker stop` した場合は再起動しない。
サーバーの再起動時にもコンテナが自動で立ち上がる。
```

**`depends_on`**
```
Nginx は frontend と api が先に起動してから起動する。
ただし「起動完了を待つ」のではなく「起動開始する」だけ。
アプリケーションの準備完了はヘルスチェックで確認する。
```

**`networks: web`**
```
全コンテナが同一ネットワーク（web）に参加。
コンテナ間はサービス名（frontend, api）で通信可能。
外部からはポートマッピングした Nginx のみアクセス可能。
```

**`volumes: /var/run/docker.sock`（Watchtower用）**
```
Watchtower が他のコンテナを管理するために Docker ソケットを共有。
これにより Watchtower は新しいイメージの存在を検知し、
自動的にコンテナを更新できる。
```

---

## 15.6 開発用 Docker Compose

本番用とは別に、開発用の設定を用意すると便利です。

```yaml
# docker-compose.dev.yml
services:
  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile
      target: deps  # deps ステージで止める
    container_name: meg4ne-frontend-dev
    volumes:
      - .:/app           # ソースコードをマウント（ホットリロード）
      - /app/node_modules # node_modules はコンテナ内のものを使う
    command: pnpm dev --host 0.0.0.0
    ports:
      - "4321:4321"
    networks:
      - web

  api:
    build:
      context: .
      dockerfile: docker/api/Dockerfile
      target: deps
    container_name: meg4ne-api-dev
    volumes:
      - ./server:/app
      - /app/node_modules
    command: pnpm dev
    ports:
      - "3001:3001"
    env_file:
      - ./server/.env
    networks:
      - web

networks:
  web:
    driver: bridge
```

```bash
# 開発環境の起動
docker compose -f docker-compose.dev.yml up

# 本番環境の起動
docker compose up -d
```

---

## 15.7 .dockerignore

ビルドコンテキストに含めないファイルを指定します。

```
# .dockerignore
node_modules
dist
.git
.github
.env
.env.*
*.md
docs/
.vscode/
.DS_Store
```

**なぜ `.dockerignore` が必要か？**

`docker build` は指定したディレクトリ全体を「ビルドコンテキスト」として Docker デーモンに送信します。不要なファイルを除外することで、ビルドが高速になります。

---

## 15.8 Docker の基本操作

```bash
# ──── イメージのビルド ────
docker compose build              # 全サービスをビルド
docker compose build frontend     # frontend のみビルド

# ──── 起動と停止 ────
docker compose up -d              # バックグラウンドで起動
docker compose down               # 停止してコンテナ削除
docker compose restart api        # api のみ再起動

# ──── ログの確認 ────
docker compose logs -f            # 全サービスのログをリアルタイム表示
docker compose logs -f api        # api のログだけ

# ──── コンテナの状態確認 ────
docker compose ps                 # サービスの状態一覧
docker stats                      # リソース使用状況

# ──── コンテナ内に入る ────
docker compose exec api sh        # api コンテナのシェル

# ──── イメージサイズ確認 ────
docker images | grep meg4ne       # meg4ne 関連のイメージ
```

---

## 15.9 ディレクトリ構成

```
meg4ne.net/
├── docker/
│   ├── frontend/
│   │   ├── Dockerfile
│   │   └── nginx.conf       # フロントエンド用 Nginx 設定
│   ├── api/
│   │   └── Dockerfile
│   └── nginx/
│       ├── nginx.conf        # メイン Nginx 設定
│       └── conf.d/
│           └── default.conf  # サイト設定
├── docker-compose.yml         # 本番用
├── docker-compose.dev.yml     # 開発用
├── .dockerignore
├── server/
│   └── ...
└── src/
    └── ...
```

---

## 15.10 この章のまとめ

### 重要なポイント

1. **マルチステージビルド** → 最終イメージを小さく（30MB程度）
2. **レイヤーキャッシュ** → `package.json` を先にコピーしてビルド高速化
3. **非rootユーザー** → セキュリティの基本
4. **Docker Compose** → 複数コンテナの一括管理
5. **開発用と本番用を分離** → `docker-compose.dev.yml`

### Docker Compose のサービス構成

| サービス | 役割 | ポート |
|---|---|---|
| **frontend** | Astroの静的ファイル配信 | (Nginx経由) |
| **api** | Hono API サーバー | 3001 |
| **nginx** | リバースプロキシ | 80, 443 |
| **watchtower** | 自動更新 | - |

---

次の章: [第16章: Nginx リバースプロキシ](./16-nginx.md)
