# meg4ne.net 実装教科書 - 目次

## この教科書について

この教科書は、要件定義書（`docs/requirements.md`）に基づき、Astro + React を中心とした個人サイト「meg4ne.net」を**ゼロから自分の手で構築する**ためのガイドです。

各章では「何をするか」だけでなく「**なぜそうするのか**」を丁寧に解説しています。上から順番に読み進めることで、フロントエンドからインフラまで一通りの実装ができるようになります。

---

## Part 1: 基礎知識（Foundations）

| 章 | タイトル | 内容 |
|---|---|---|
| [01](./01-setup.md) | 開発環境のセットアップ | Node.js, pnpm, VS Code 拡張機能, Git の準備 |
| [02](./02-typescript.md) | TypeScript 入門 | 型システムの基礎。このプロジェクトで必要な知識を厳選 |
| [03](./03-astro-basics.md) | Astro 入門 | Astro の思想、Islands Architecture、ファイルベースルーティング |
| [04](./04-react-basics.md) | React 入門 | コンポーネント、Props、State、Hooks の基礎 |

## Part 2: サイト構築（Building the Site）

| 章 | タイトル | 内容 |
|---|---|---|
| [05](./05-project-init.md) | プロジェクト初期化と構成 | Astro プロジェクト作成、ディレクトリ設計、ESLint/Prettier 設定 |
| [06](./06-layout-routing.md) | レイアウトとルーティング | 共通レイアウト、ナビゲーション、ページ遷移 |
| [07](./07-styling-themes.md) | スタイリングとテーマ切り替え | CSS 設計、黒ベーステーマ、ターミナルモード実装 |
| [08](./08-content-pages.md) | コンテンツページの実装 | 自己紹介、計算機構成、制作物、リンク集 |
| [09](./09-markdown-content.md) | Markdown コンテンツ管理 | Content Collections、運用記（Operation Log）の仕組み |
| [10](./10-image-gallery.md) | 画像最適化とギャラリー | Astro Image, WebP 変換, グリッドレイアウト |
| [11](./11-3d-viewer.md) | 3D モデルビューワー | React Three Fiber, .glb, Draco 圧縮, Lazy Load |
| [12](./12-external-api.md) | 外部 API 連携 | Qiita / Note / Zenn の記事集約、RSS フィード解析 |

## Part 3: バックエンド（Backend）

| 章 | タイトル | 内容 |
|---|---|---|
| [13](./13-bff-api.md) | BFF アーキテクチャと API 設計 | Hono による監視 API、データサニタイズ |
| [14](./14-realtime-monitor.md) | リアルタイムサーバーモニター | WebSocket によるリアルタイム通信、CPU/メモリ表示 |

## Part 4: インフラ & デプロイ（Infrastructure & Deployment）

| 章 | タイトル | 内容 |
|---|---|---|
| [15](./15-docker.md) | Docker 構成 | Dockerfile、Docker Compose、マルチステージビルド |
| [16](./16-nginx.md) | Nginx リバースプロキシ | SSL 終端、キャッシュ制御、セキュリティヘッダー |
| [17](./17-cicd.md) | CI/CD 構築 | GitHub Actions、GHCR、Watchtower による自動デプロイ |
| [18](./18-cloudflare.md) | Cloudflare Tunnel & Analytics | トンネル設定、Web Analytics、プライバシーポリシー |

## Part 5: 品質 & 運用（Quality & Operations）

| 章 | タイトル | 内容 |
|---|---|---|
| [19](./19-performance-seo.md) | パフォーマンスと SEO | Lighthouse 90 点以上、Core Web Vitals、メタタグ |
| [20](./20-security.md) | セキュリティ | 最小権限原則、ネットワーク分離、シークレット管理 |

---

## 推奨する進め方

1. **Part 1 を通読**して基礎を固める（知っている内容は飛ばしてOK）
2. **Part 2 を順番に実装**しながら、各章末の確認項目をクリアしていく
3. **Part 3** でバックエンド API を構築する
4. **Part 4** でコンテナ化・デプロイパイプラインを整える
5. **Part 5** で品質を磨き上げる

> **ヒント**: 完璧を目指す前に、まず最小限の機能で動くものを作ること（MVP: Minimum Viable Product）が大切です。各章は独立性が高いので、一旦シンプルなページを作ってから徐々に機能を追加していくアプローチを推奨します。
