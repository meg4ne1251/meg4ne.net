# 第6章: レイアウトとルーティング

## この章で学ぶこと

- Layout コンポーネントの設計と実装
- `<head>` 要素の適切な設定（SEO 対応）
- ナビゲーションの実装
- ページ間の遷移とアクティブ状態の表示
- 404 ページの作成

---

## 6.1 Layout コンポーネントとは

ほぼ全てのページに共通する要素（`<html>`, `<head>`, ヘッダー、フッターなど）を**レイアウトコンポーネント**にまとめます。各ページは「変わる部分」だけを書けばよくなります。

```
┌──────────────────────── Layout.astro ─────────────────────────┐
│  <html>                                                        │
│  <head> ... メタタグ、CSS読み込み ... </head>                    │
│  <body>                                                        │
│    ┌─────────────── Header.astro ──────────────┐              │
│    │  ロゴ  |  About  |  Works  |  Server  | 🌙 │              │
│    └───────────────────────────────────────────┘              │
│                                                                │
│    ┌─────────────── <slot /> ─────────────────┐              │
│    │                                           │              │
│    │   ← ここに各ページの内容が入る              │              │
│    │                                           │              │
│    └───────────────────────────────────────────┘              │
│                                                                │
│    ┌─────────────── Footer.astro ──────────────┐              │
│    │  © 2026 megane  |  Privacy Policy          │              │
│    └───────────────────────────────────────────┘              │
│  </body>                                                       │
│  </html>                                                       │
└────────────────────────────────────────────────────────────────┘
```

---

## 6.2 Layout コンポーネントの実装

```astro
---
// src/layouts/Layout.astro

interface Props {
  title: string;           // ページタイトル（必須）
  description?: string;    // ページの説明（SEO用、オプショナル）
  ogImage?: string;        // OGP画像のパス（SNSシェア用）
}

const {
  title,
  description = "meganeの個人ページ。ポートフォリオ、サーバー情報、活動記録を掲載。",
  ogImage = "/assets/images/og-default.png",
} = Astro.props;

// 現在のページのURLを取得（canonical URLやOGPに使用）
const canonicalURL = new URL(Astro.url.pathname, Astro.site);

// コンポーネントのインポート
import Header from "../components/common/Header.astro";
import Footer from "../components/common/Footer.astro";

// グローバルCSSのインポート
import "../styles/global.css";
---

<!doctype html>
<html lang="ja">
  <head>
    <!-- 文字エンコーディング（必ず最初に書く） -->
    <meta charset="UTF-8" />

    <!-- ビューポート設定（レスポンシブ対応に必須） -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- ページタイトル -->
    <!-- サイト名を統一フォーマットで付与する -->
    <title>{title} | meg4ne.net</title>

    <!-- SEO: ページの説明文（検索結果に表示される） -->
    <meta name="description" content={description} />

    <!-- SEO: カノニカルURL（重複コンテンツ防止） -->
    <link rel="canonical" href={canonicalURL} />

    <!-- ファビコン -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <!-- OGP (Open Graph Protocol): SNSシェア時の表示設定 -->
    <meta property="og:title" content={`${title} | meg4ne.net`} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site)} />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="meg4ne.net" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />

    <!-- テーマカラー（ブラウザのアドレスバーの色） -->
    <meta name="theme-color" content="#0a0a0a" />

    <!-- テーマ初期化スクリプト（FOUC防止） -->
    <script is:inline>
      // ページが表示される前にテーマを適用（チラつき防止）
      // is:inline を付けると Astro のバンドルを通さず、そのまま HTML に埋め込まれる
      const theme = localStorage.getItem("theme") || "standard";
      document.documentElement.setAttribute("data-theme", theme);
    </script>
  </head>
  <body>
    <Header />

    <main>
      <!-- slot: 各ページの内容がここに挿入される -->
      <slot />
    </main>

    <Footer />
  </body>
</html>
```

### `<head>` 要素の詳細解説

| 要素 | 役割 | なぜ必要か |
|---|---|---|
| `charset` | 文字エンコーディング | 日本語を正しく表示するため |
| `viewport` | 表示領域の設定 | スマホでの表示に必要（レスポンシブ対応） |
| `title` | ページタイトル | ブラウザのタブとGoogle検索結果に表示される |
| `description` | 説明文 | Google検索結果の説明文として表示される |
| `canonical` | 正規URL | 同じ内容のページが複数URLで存在する場合にどれが「本物」か伝える |
| OGP (`og:*`) | SNSシェア情報 | Twitter/XなどでURLをシェアした時のプレビュー表示 |
| `theme-color` | テーマカラー | モバイルブラウザのアドレスバーの色 |

> **FOUC（Flash of Unstyled Content）とは？**: ページ読み込み時に一瞬デフォルトスタイルが表示される現象。テーマ切り替えがある場合、JavaScript で適用する前にデフォルトテーマが見えてしまう。`is:inline` スクリプトでこれを防ぎます。

---

## 6.3 ページでレイアウトを使う

```astro
---
// src/pages/index.astro
import Layout from "../layouts/Layout.astro";
---

<Layout title="ホーム" description="meganeの個人ページ">
  <section class="hero">
    <h1>Welcome to meg4ne.net</h1>
    <p>電気通信大学の学生。自宅サーバーとモデル制作が趣味。</p>
  </section>
</Layout>
```

```astro
---
// src/pages/about.astro
import Layout from "../layouts/Layout.astro";
---

<Layout title="自己紹介" description="meganeのプロフィール">
  <h1>About Me</h1>
  <p>ここに自己紹介を書く...</p>
</Layout>
```

レイアウトを使うことで、`<head>` やヘッダー・フッターを毎ページ書く必要がなくなりました。

---

## 6.4 Header コンポーネントとナビゲーション

```astro
---
// src/components/common/Header.astro

// ナビゲーション項目の定義
const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Computer", href: "/computer" },
  { label: "Server", href: "/server" },
  { label: "Works", href: "/works" },
  { label: "Activities", href: "/activities" },
  { label: "Blog", href: "/blog" },
  { label: "Links", href: "/links" },
];

// 現在のパスを取得（アクティブ状態の判定に使用）
const currentPath = Astro.url.pathname;
---

<header class="site-header">
  <nav class="nav-container">
    <!-- ロゴ / サイト名 -->
    <a href="/" class="site-logo">
      meg4ne.net
    </a>

    <!-- ナビゲーション -->
    <ul class="nav-list">
      {navItems.map((item) => {
        // 現在のページかどうか判定
        // "/" は完全一致、それ以外は前方一致（/server/monitor も /server としてアクティブ）
        const isActive = item.href === "/"
          ? currentPath === "/"
          : currentPath.startsWith(item.href);

        return (
          <li>
            <a
              href={item.href}
              class:list={["nav-link", { active: isActive }]}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>

    <!-- テーマ切り替えボタン（React コンポーネント） -->
    <!-- 第7章で実装する -->
  </nav>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--color-bg-header);
    border-bottom: 1px solid var(--color-border);
    backdrop-filter: blur(8px);
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
  }

  .site-logo {
    font-family: monospace;
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--color-primary);
    text-decoration: none;
  }

  .nav-list {
    display: flex;
    list-style: none;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
  }

  .nav-link {
    padding: 0.5rem 0.8rem;
    color: var(--color-text);
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .nav-link:hover {
    background: var(--color-bg-hover);
  }

  .nav-link.active {
    color: var(--color-primary);
    background: var(--color-bg-active);
  }
</style>
```

### class:list ディレクティブ

`class:list` は Astro 独自の機能で、動的にクラスを付与できます：

```astro
<!-- 条件に応じてクラスを追加 -->
<a class:list={["nav-link", { active: isActive, "font-bold": isBold }]}>
  <!-- isActive が true なら "nav-link active" -->
  <!-- isActive が false なら "nav-link" -->
</a>
```

### aria-current 属性

```html
<!-- アクセシビリティのための属性 -->
<a href="/about" aria-current="page">About</a>
```

スクリーンリーダー（目の不自由な方が使う読み上げソフト）に「このリンクは現在のページ」と伝えるための属性です。SEO にも好影響があります。

---

## 6.5 Footer コンポーネント

```astro
---
// src/components/common/Footer.astro
const currentYear = new Date().getFullYear();
---

<footer class="site-footer">
  <div class="footer-content">
    <p class="copyright">© {currentYear} megane</p>
    <nav class="footer-nav">
      <a href="/privacy">プライバシーポリシー</a>
      <a href="https://github.com/あなたのGitHubユーザー名/meg4ne-net" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
    </nav>
  </div>
</footer>

<style>
  .site-footer {
    margin-top: auto;  /* flexbox でフッターを最下部に固定するために必要 */
    border-top: 1px solid var(--color-border);
    padding: 2rem 1rem;
    text-align: center;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .copyright {
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  .footer-nav {
    margin-top: 0.5rem;
    display: flex;
    justify-content: center;
    gap: 1.5rem;
  }

  .footer-nav a {
    color: var(--color-text-muted);
    text-decoration: none;
    font-size: 0.85rem;
  }

  .footer-nav a:hover {
    color: var(--color-primary);
  }
</style>
```

### `rel="noopener noreferrer"` とは

```html
<a href="https://外部サイト" target="_blank" rel="noopener noreferrer">
```

| 属性 | 役割 |
|---|---|
| `target="_blank"` | 新しいタブで開く |
| `noopener` | 新しいタブから元のページを操作できなくする（セキュリティ） |
| `noreferrer` | リファラー（どこから来たか）を送信しない（プライバシー） |

`target="_blank"` を使う場合は、セキュリティのために `rel="noopener noreferrer"` を**必ず**付けてください。

---

## 6.6 フッターを常に最下部に配置する

コンテンツが少ないページでも、フッターが画面最下部に来るようにする「Sticky Footer」パターン：

```css
/* src/styles/global.css に追加 */
body {
  min-height: 100vh;         /* ビューポートの高さ以上に */
  display: flex;
  flex-direction: column;    /* 縦方向に並べる */
}

main {
  flex: 1;                   /* main が残りのスペースを埋める */
}

/* footer の margin-top: auto; と合わせて、
   コンテンツが少なくてもフッターが最下部に配置される */
```

---

## 6.7 404 ページの作成

存在しない URL にアクセスした時に表示されるページです：

```astro
---
// src/pages/404.astro
import Layout from "../layouts/Layout.astro";
---

<Layout title="404 - ページが見つかりません">
  <div class="not-found">
    <h1>404</h1>
    <p>お探しのページは見つかりませんでした。</p>
    <p>URLが正しいか確認してください。</p>
    <a href="/">トップページに戻る</a>
  </div>
</Layout>

<style>
  .not-found {
    text-align: center;
    padding: 4rem 1rem;
  }

  .not-found h1 {
    font-size: 6rem;
    font-family: monospace;
    color: var(--color-primary);
    margin: 0;
  }

  .not-found a {
    display: inline-block;
    margin-top: 2rem;
    padding: 0.8rem 1.5rem;
    background: var(--color-primary);
    color: var(--color-bg);
    text-decoration: none;
    border-radius: 4px;
  }
</style>
```

> **Astro が `404.astro` を特別扱いする理由**: Astro は `src/pages/404.astro` を見つけると、自動的に `dist/404.html` として出力します。多くの Web サーバー（Nginx 含む）は、存在しないページへのアクセス時に `404.html` を表示するよう設定できます。

---

## 6.8 ページ間のリンク設計

### ナビゲーションの階層構造

```
Home (/)
├── About (/about)
├── Computer (/computer)
│   ├── Network (/computer/network)
│   └── Naming (/computer/naming)
├── Server (/server)
│   ├── Monitor (/server/monitor)
│   └── Services (/server/services)
├── Works (/works)
├── Activities (/activities)
│   └── Gallery (/activities/gallery)
├── Blog (/blog)
│   └── [slug] (/blog/記事のスラッグ)
├── Links (/links)
└── Privacy (/privacy)
```

### パンくずリスト（Breadcrumb）

ユーザーが現在のページの階層を把握しやすくするためのコンポーネント：

```astro
---
// src/components/common/Breadcrumb.astro

interface BreadcrumbItem {
  label: string;
  href?: string;  // 最後の項目（現在のページ）はリンクなし
}

interface Props {
  items: BreadcrumbItem[];
}

const { items } = Astro.props;
---

<nav aria-label="パンくずリスト" class="breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    {items.map((item, index) => (
      <li>
        <span class="separator" aria-hidden="true">/</span>
        {item.href ? (
          <a href={item.href}>{item.label}</a>
        ) : (
          <span aria-current="page">{item.label}</span>
        )}
      </li>
    ))}
  </ol>
</nav>

<style>
  .breadcrumb ol {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  .separator {
    margin: 0 0.5rem;
  }

  .breadcrumb a {
    color: var(--color-text-muted);
    text-decoration: none;
  }

  .breadcrumb a:hover {
    color: var(--color-primary);
  }
</style>
```

**使い方：**

```astro
---
// src/pages/server/monitor.astro
import Layout from "../../layouts/Layout.astro";
import Breadcrumb from "../../components/common/Breadcrumb.astro";
---

<Layout title="サーバーモニター">
  <Breadcrumb items={[
    { label: "Server", href: "/server" },
    { label: "Monitor" },
  ]} />
  <h1>リアルタイムサーバーモニター</h1>
</Layout>

<!-- 表示結果: Home / Server / Monitor -->
```

---

## 6.9 この章のまとめと確認項目

### 理解度チェック

1. Layout コンポーネントの `<slot />` は何をする？
   → 各ページの内容が挿入される場所を示す

2. OGP タグはなぜ必要？
   → SNS でURLをシェアした時のプレビュー表示に使われる

3. `is:inline` スクリプトと通常のスクリプトの違いは？
   → `is:inline` はバンドルされず HTML に直接埋め込まれる。ページ表示前に実行できる

4. `rel="noopener noreferrer"` はいつ必要？
   → `target="_blank"` で外部リンクを開く時（セキュリティとプライバシー保護）

5. Sticky Footer を実現する CSS テクニックは？
   → `body` に `display: flex; flex-direction: column; min-height: 100vh;`、`main` に `flex: 1;`

### 重要なポイントの復習

1. **Layout で共通要素をまとめる** → DRY原則（Don't Repeat Yourself）
2. **`<head>` を正しく設定する** → SEO と SNS シェアに影響
3. **FOUC を防ぐ** → テーマの `is:inline` スクリプトで初期化する
4. **アクセシビリティを意識** → `aria-current`, `aria-label` を適切に使う
5. **404 ページも用意する** → ユーザー体験の向上

---

次の章: [第7章: スタイリングとテーマ切り替え](./07-styling-themes.md)
