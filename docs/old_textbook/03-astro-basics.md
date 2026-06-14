# 第3章: Astro 入門

## この章で学ぶこと

- Astro の設計思想と「Islands Architecture」
- `.astro` ファイルの構文
- ファイルベースルーティング
- コンポーネントの作り方
- Astro と React の共存（なぜ両方使うのか）

---

## 3.1 Astro とは何か

Astro は「**コンテンツ重視の Web サイト**」を構築するためのフレームワークです。

### 従来のフレームワーク（React / Next.js など）との違い

| 特徴 | React (SPA) | Next.js (SSR) | **Astro** |
|---|---|---|---|
| デフォルト出力 | JavaScript が多い | そこそこ | **JavaScript ゼロ** |
| ページ表示速度 | 遅い | 速い | **最速** |
| 動的コンテンツ | 得意 | 得意 | Islands で部分的に対応 |
| 適したサイト | Web アプリ | Web アプリ / Web サイト | **Web サイト / ブログ** |

### なぜ Astro を選ぶのか（このプロジェクトにおける選定理由）

要件定義書の選定理由を噛み砕くと：

1. **静的コンテンツが主体**: 自己紹介、ポートフォリオ、計算機構成など、あまり変わらないコンテンツが多い → JavaScript なしで配信できる Astro が最適
2. **部分的に動的コンテンツがある**: 3Dビューワー、サーバーモニターなど → React コンポーネントを「島（Island）」として必要な箇所だけ使う
3. **Markdown サポートが組み込み**: 運用記を Markdown で書けるのが最初から想定されている

### Islands Architecture（アイランド・アーキテクチャ）

Astro の最大の特徴です。ページのほとんどは静的 HTML として配信し、インタラクティブな部分だけにJavaScriptを「島」のように配置する設計です。

```
┌─────────────────────────────────────────────────┐
│  ページ全体（静的 HTML、JavaScript なし）           │
│                                                   │
│  ┌──────────────┐     ┌──────────────────────┐   │
│  │ 🏝️ 3Dビューワー  │     │ 🏝️ サーバーモニター    │   │
│  │  (React)      │     │  (React)              │   │
│  │  ← JavaScript │     │  ← JavaScript         │   │
│  └──────────────┘     └──────────────────────┘   │
│                                                   │
│  ヘッダー（静的）   フッター（静的）                  │
│  自己紹介（静的）   リンク集（静的）                  │
└─────────────────────────────────────────────────┘
```

**メリット**: ページの大部分が静的 HTML なので読み込みが速く、Lighthouse スコアも高くなりやすい（要件定義書の「90点以上」に直結）。

---

## 3.2 Astro ファイルの構文

`.astro` ファイルは、以下の3つのパートで構成されます：

```astro
---
// 1. フロントマター（Component Script）
// ここは Node.js 上で実行される（ブラウザではない！）
// データの取得、変数の定義、ロジックを書く

const pageTitle = "meg4ne.net";
const skills = ["TypeScript", "Python", "Docker"];

// 他のコンポーネントのインポートもここ
import Header from "../components/Header.astro";
---

<!-- 2. テンプレート（Component Template）-->
<!-- HTML + JSX ライクな構文で UI を書く -->
<html lang="ja">
  <head>
    <title>{pageTitle}</title>
  </head>
  <body>
    <Header />
    <h1>{pageTitle}</h1>
    <ul>
      {skills.map((skill) => (
        <li>{skill}</li>
      ))}
    </ul>
  </body>
</html>

<style>
  /* 3. スタイル（Component Styles）*/
  /* デフォルトでスコープされる（このコンポーネントにしか適用されない） */
  h1 {
    color: #00ff00;
    font-family: monospace;
  }
</style>
```

### フロントマターの重要ポイント

```astro
---
// ⚠️ ここのコードはビルド時（または SSR 時）にサーバー側で実行される
// つまり、ブラウザの API（document, window）は使えない

// ✅ できること
import Layout from "../layouts/Layout.astro";  // コンポーネント読み込み
const data = await fetch("https://api.example.com/data");  // API 呼び出し
import { getCollection } from "astro:content";
const posts = await getCollection("blog");                 // Content Collections で記事を取得

// ❌ できないこと
// document.getElementById("xxx")  → サーバーにはブラウザのDOMがない
// localStorage.getItem("theme")  → サーバーにはブラウザのストレージがない
---
```

### テンプレート内での表現

```astro
---
const isLoggedIn = true;
const items = ["Nginx", "Docker", "Proxmox"];
const status = "online";
---

<!-- 変数の展開 -->
<p>現在のステータス: {status}</p>

<!-- 条件分岐 -->
{isLoggedIn && <p>ログイン中</p>}

{status === "online" 
  ? <span class="badge-online">稼働中</span> 
  : <span class="badge-offline">停止中</span>
}

<!-- ループ -->
<ul>
  {items.map((item) => (
    <li>{item}</li>
  ))}
</ul>

<!-- HTML の属性に変数を使う -->
<div class={`status-${status}`}>
  ステータス表示
</div>
```

---

## 3.3 ファイルベースルーティング

Astro では、 `src/pages/` ディレクトリ内のファイル構造がそのまま URL になります。ルーティングの設定ファイルを書く必要がありません。

```
src/pages/
├── index.astro          →  /              （トップページ）
├── about.astro          →  /about         （自己紹介）
├── works.astro          →  /works         （制作物一覧）
├── links.astro          →  /links         （リンク集）
├── computer/
│   ├── index.astro      →  /computer      （計算機構成トップ）
│   ├── network.astro    →  /computer/network （ネットワーク構成）
│   └── naming.astro     →  /computer/naming   （ネーミングコンベンション）
├── server/
│   ├── index.astro      →  /server        （サーバー情報トップ）
│   ├── monitor.astro    →  /server/monitor    （リソースモニター）
│   └── services.astro   →  /server/services   （サービス一覧）
├── activities/
│   ├── index.astro      →  /activities    （活動記録トップ）
│   └── gallery.astro    →  /activities/gallery （ギャラリー）
└── blog/
    ├── index.astro      →  /blog          （運用記一覧）
    └── [slug].astro     →  /blog/任意の文字列 （個別記事、動的ルーティング）
```

### 動的ルーティング

運用記（ブログ）の個別記事ページのように、URL がコンテンツに応じて変わるページには**動的ルーティング**を使います：

```astro
---
// src/pages/blog/[slug].astro
// [slug] の部分が URL パラメータになる
// 例: /blog/first-post → slug = "first-post"

import { getCollection } from "astro:content";

// 静的ビルド時に全てのページを事前生成するための関数
export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
---

<h1>{post.data.title}</h1>
```

> **`getStaticPaths` はなぜ必要？**: Astro はデフォルトで静的サイト（HTML ファイル）を生成します。動的ルーティングがある場合、「どの URL のページを生成すべきか」を事前に教える必要があるのです。

---

## 3.4 コンポーネントの作り方

### Astro コンポーネント

再利用可能な UI パーツを作ります。`src/components/` に配置するのが慣例です。

```astro
---
// src/components/ServiceCard.astro

// Props（親コンポーネントから受け取る値）の型定義
interface Props {
  name: string;
  description: string;
  role: string;
  tags: string[];
}

// Props を受け取る
const { name, description, role, tags } = Astro.props;
---

<article class="service-card">
  <h3>{name}</h3>
  <p class="role">{role}</p>
  <p>{description}</p>
  <div class="tags">
    {tags.map((tag) => (
      <span class="tag">{tag}</span>
    ))}
  </div>
</article>

<style>
  .service-card {
    border: 1px solid #333;
    border-radius: 8px;
    padding: 1.5rem;
    background: #1a1a1a;
  }

  .role {
    color: #888;
    font-size: 0.9rem;
  }

  .tag {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    margin: 0.2rem;
    background: #333;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #0f0;
  }
</style>
```

**使い方：**

```astro
---
// src/pages/server/services.astro
import ServiceCard from "../../components/ServiceCard.astro";

const services = [
  { name: "Nginx", description: "Webサーバー/リバースプロキシ", role: "防衛", tags: ["web", "proxy"] },
  { name: "Gitea", description: "セルフホストGit", role: "補給", tags: ["git", "devops"] },
];
---

<h2>サービス一覧</h2>
{services.map((service) => (
  <ServiceCard
    name={service.name}
    description={service.description}
    role={service.role}
    tags={service.tags}
  />
))}
```

### スロット（Slot）

コンポーネントの「中身」を外から差し込む仕組みです。レイアウトコンポーネントで特に重要です：

```astro
---
// src/components/Card.astro
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<div class="card">
  <h3>{title}</h3>
  <div class="card-body">
    <slot />  <!-- ここに親から渡された中身が入る -->
  </div>
</div>
```

```astro
<!-- 使い方 -->
<Card title="スペック">
  <p>CPU: Ryzen 7 5800X</p>  <!-- この部分が <slot /> に入る -->
  <p>Memory: 64GB DDR4</p>
</Card>
```

---

## 3.5 Astro と React の共存

### なぜ Astro だけではダメなのか？

Astro コンポーネントは**サーバーサイドでのみ実行**されます。つまり：

- ❌ ボタンクリックの処理ができない
- ❌ フォームの入力管理ができない
- ❌ アニメーションの制御ができない
- ❌ WebSocket によるリアルタイム通信ができない

サーバーモニターや3Dビューワーのような**ブラウザ上でインタラクティブに動く機能**には、React コンポーネントが必要です。

### `client:*` ディレクティブ

React コンポーネントを Astro で使うとき、**いつ JavaScript を読み込むか**を指定できます：

```astro
---
import ServerMonitor from "../components/ServerMonitor";  // .tsx（React）
import ThreeViewer from "../components/ThreeViewer";       // .tsx（React）
import Counter from "../components/Counter";               // .tsx（React）
---

<!-- client:load - ページ読み込み時に即座に JavaScript をロード -->
<!-- 使い所: すぐに動作が必要なコンポーネント -->
<ServerMonitor client:load />

<!-- client:visible - ビューポートに入った時にロード -->
<!-- 使い所: ページ下部にあるコンポーネント（スクロールして見える時に初めてロード） -->
<ThreeViewer client:visible />

<!-- client:idle - ブラウザが暇な時にロード -->
<!-- 使い所: 優先度が低いがインタラクティブなコンポーネント -->
<Counter client:idle />

<!-- client:only="react" - サーバー側ではレンダリングしない（クライアントのみ） -->
<!-- 使い所: window や document に依存するコンポーネント -->
<ThreeViewer client:only="react" />

<!-- ディレクティブなし → JavaScript は一切送信されない（静的HTML） -->
<!-- <StaticComponent /> -->
```

### どのディレクティブを使うかの判断フロー

```
そのコンポーネントにクリックやアニメーションなど、ブラウザでの動作はあるか？
├── NO → ディレクティブなし（静的HTML）
└── YES → ページ読み込み直後に動く必要があるか？
    ├── YES → client:load
    └── NO → ページのスクロールで見えた時に動けばいいか？
        ├── YES → client:visible（推奨: パフォーマンス向上）
        └── NO → client:idle
```

**このプロジェクトでの使い分け：**

| コンポーネント | ディレクティブ | 理由 |
|---|---|---|
| ヘッダー、フッター | なし | 静的HTML |
| テーマ切り替えボタン | `client:load` | ページ読み込み直後に動作が必要 |
| サーバーモニター | `client:load` | リアルタイムデータの即座の表示が必要 |
| 3Dモデルビューワー | `client:visible` | スクロールで見える位置にある、重いので遅延ロード |
| ギャラリーのライトボックス | `client:visible` | ユーザーがスクロールして到達してからで良い |

---

## 3.6 Astro の設定ファイル

`astro.config.mjs` は Astro プロジェクトの設定ファイルです：

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  // React インテグレーション（Astro 内で React コンポーネントを使うために必要）
  integrations: [react()],

  // 出力モード
  // "static": 全ページを HTML ファイルとして事前生成（デフォルト）
  // "server": 基本は SSR。ページごとに prerender: true を指定すれば静的生成も可能
  // ※ Astro v4 以前の "hybrid" は v5 で廃止され、"server" に統合されました
  output: "static",

  // サイトの URL（SEO やサイトマップに使われる）
  site: "https://meg4ne.net",

  // 開発サーバーの設定
  server: {
    port: 4321,
  },
});
```

### output モードの選択

```
"static"（静的生成 = SSG）
├── 全ページがビルド時に HTML 化
├── CDN にそのまま置ける → 高速
├── API 呼び出しはビルド時に1回だけ実行
└── このプロジェクトの大部分はこれで OK

"server"（サーバーサイドレンダリング = SSR）
├── デフォルトではリクエストのたびに HTML を生成
├── Node.js サーバーが必要
├── 個別ページに export const prerender = true を書けば静的生成も可能
└── Astro v5 では旧 "hybrid" モードがこちらに統合された
```

> **推奨**: まずは `"static"` で始めて、サーバーモニターなどリアルタイム性が必要な部分はクライアントサイド（React + fetch）で対応する。必要に応じて後から `"hybrid"` に変更できます。

---

## 3.7 開発サーバーの使い方

```bash
# 開発サーバーの起動
pnpm dev

# ブラウザで http://localhost:4321 を開く
# ファイルを保存すると自動でページが更新される（Hot Module Replacement）
```

```bash
# ビルド（本番用の HTML/CSS/JS を生成）
pnpm build

# ビルド結果のプレビュー
pnpm preview
```

### 開発と本番の違い

| | 開発（`pnpm dev`） | 本番（`pnpm build`） |
|---|---|---|
| 実行場所 | ローカルの開発サーバー | 静的ファイルを出力 |
| 更新方法 | ファイル保存で自動更新 | 再ビルドが必要 |
| パフォーマンス | 最適化なし | 圧縮・最適化済み |
| エラー表示 | 詳細なスタックトレース | 最小限 |

---

## 3.8 この章のまとめと確認項目

### 理解度チェック

1. Astro の「Islands Architecture」とは？
   → ページの大部分は静的 HTML、インタラクティブな部分のみ JavaScript を読み込む設計

2. `.astro` ファイルのフロントマター（`---` の間）で `document.getElementById()` は使えるか？
   → 使えない。フロントマターはサーバー側で実行されるため

3. `client:visible` と `client:load` の違いは？
   → `client:load` は即座にロード、`client:visible` はビューポートに入った時にロード

4. ファイルベースルーティングで `/about` のページを作るにはどうする？
   → `src/pages/about.astro` を作成する

5. なぜ React も使うのか？
   → Astro コンポーネントはサーバー側のみ。ブラウザでのインタラクション（3Dビューワー、モニターなど）には React が必要

### 重要なポイントの復習

1. **Astro はコンテンツ重視のサイトに最適** → 静的 HTML を高速に配信
2. **Islands Architecture** → 必要な場所だけ JavaScript を使う
3. **`client:*` ディレクティブで JavaScript の読み込みタイミングを制御** → パフォーマンス最適化
4. **ファイルベースルーティング** → ディレクトリ構造 = URL 構造
5. **まずは `output: "static"` で始める** → シンプルに保ち、必要に応じて拡張

---

次の章: [第4章: React 入門](./04-react-basics.md)
