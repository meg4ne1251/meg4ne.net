# 第7章: スタイリングとテーマ切り替え

## この章で学ぶこと

- CSS カスタムプロパティ（CSS変数）によるテーマ設計
- 通常モード（黒ベース）の実装
- ターミナル風モードの実装
- テーマ切り替え機能（React コンポーネント）
- レスポンシブ対応の基礎

---

## 7.1 CSS 設計の方針

### なぜ CSS カスタムプロパティ（CSS変数）を使うのか

要件定義書では **2つのテーマ**（通常モードとターミナル風モード）が求められています。テーマ切り替えを実現するには、色やフォントなどのデザイントークンを**変数化**する必要があります。

```css
/* ❌ ハードコーディング → テーマ変更が困難 */
.card {
  background: #1a1a2e;
  color: #e0e0e0;
  border: 1px solid #333;
}

/* ✅ CSS変数 → テーマごとに値を切り替えるだけ */
.card {
  background: var(--color-bg-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
```

---

## 7.2 CSS カスタムプロパティの定義

```css
/* src/styles/variables.css */

/* ============================
   デザイントークン
   テーマに依存しない基盤値を定義
   ============================ */

:root {
  /* --- タイポグラフィ --- */
  --font-sans: "Inter", "Noto Sans JP", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", "Source Code Pro", monospace;

  /* --- スペーシング --- */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */

  /* --- レイアウト --- */
  --max-width: 1200px;
  --header-height: 60px;

  /* --- ボーダー --- */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* --- トランジション --- */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
}

/* ============================
   通常テーマ (Standard) — 黒ベース
   ============================ */

[data-theme="standard"] {
  /* プライマリカラー */
  --color-primary: #6c9bff;
  --color-primary-hover: #8ab4ff;

  /* 背景色 */
  --color-bg: #0a0a0f;
  --color-bg-card: #12121a;
  --color-bg-header: rgba(10, 10, 15, 0.85);
  --color-bg-hover: rgba(108, 155, 255, 0.1);
  --color-bg-active: rgba(108, 155, 255, 0.15);
  --color-bg-code: #1a1a2e;

  /* テキスト */
  --color-text: #e0e0e8;
  --color-text-muted: #888898;
  --color-text-heading: #f0f0f8;

  /* ボーダー・区切り */
  --color-border: #2a2a3a;

  /* サーフェス（カードより少し明るい背景） */
  --color-surface: #16161e;

  /* ステータス */
  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #f87171;

  /* フォント */
  --font-body: var(--font-sans);
  --font-code: var(--font-mono);
}

/* ============================
   ターミナル風テーマ (Terminal Mode)
   CUI（コマンドライン）ライクな見た目
   ============================ */

[data-theme="terminal"] {
  /* プライマリカラー — ターミナルの緑 */
  --color-primary: #00ff41;
  --color-primary-hover: #33ff6b;

  /* 背景色 — 真っ黒 */
  --color-bg: #000000;
  --color-bg-card: #0a0a0a;
  --color-bg-header: rgba(0, 0, 0, 0.9);
  --color-bg-hover: rgba(0, 255, 65, 0.08);
  --color-bg-active: rgba(0, 255, 65, 0.12);
  --color-bg-code: #0a0a0a;

  /* テキスト — ターミナルグリーン */
  --color-text: #00ff41;
  --color-text-muted: #00aa2a;
  --color-text-heading: #00ff41;

  /* ボーダー */
  --color-border: #003300;

  /* サーフェス */
  --color-surface: #050505;

  /* ステータス */
  --color-success: #00ff41;
  --color-warning: #ffff00;
  --color-error: #ff0000;

  /* フォント — 全て等幅（monospace） */
  --font-body: var(--font-mono);
  --font-code: var(--font-mono);
}
```

### `data-theme` 属性方式の仕組み

```html
<!-- HTML のルート要素にテーマを示す属性を付ける -->
<html data-theme="standard">  <!-- または "terminal" -->
```

CSS の `[data-theme="standard"]` は**属性セレクタ**です。`data-theme` 属性の値に応じて異なる CSS 変数が適用されます。JavaScript でこの属性を切り替えるだけでテーマが変わります。

---

## 7.3 グローバルスタイル

```css
/* src/styles/global.css */

/* CSS変数の読み込み */
@import "./variables.css";

/* ============================
   リセット & ベーススタイル
   ============================ */

/* Box-sizing を border-box に統一 */
/* padding や border を width に含めるようにする（直感的なサイズ計算のため） */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* ブラウザのデフォルトマージンをリセット */
body, h1, h2, h3, h4, h5, h6, p, ul, ol {
  margin: 0;
}

/* ============================
   ベース要素
   ============================ */

html {
  /* スムーズスクロール（ページ内リンクで使用） */
  scroll-behavior: smooth;
  /* テーマ切り替え時のトランジション */
  color-scheme: dark;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.7;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* テーマ切り替え時のスムーズな色変化 */
  transition: background-color var(--transition-normal),
              color var(--transition-normal);
}

main {
  flex: 1;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--space-xl) var(--space-md);
  width: 100%;
}

/* ============================
   タイポグラフィ
   ============================ */

h1, h2, h3, h4, h5, h6 {
  color: var(--color-text-heading);
  line-height: 1.3;
  margin-bottom: var(--space-md);
}

h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }

p {
  margin-bottom: var(--space-md);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-hover);
}

/* ============================
   コード
   ============================ */

code {
  font-family: var(--font-code);
  background: var(--color-bg-code);
  padding: 0.15em 0.4em;
  border-radius: var(--radius-sm);
  font-size: 0.9em;
}

pre {
  background: var(--color-bg-code);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  overflow-x: auto;
  border: 1px solid var(--color-border);
}

pre code {
  background: none;
  padding: 0;
}

/* ============================
   ターミナルテーマ固有のスタイル
   ============================ */

/* ターミナルテーマではカーソル点滅エフェクトを追加 */
[data-theme="terminal"] h1::after {
  content: "█";
  animation: blink 1s step-end infinite;
  margin-left: 0.1em;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ターミナルテーマではプロンプト風のプレフィックスを追加 */
[data-theme="terminal"] h2::before {
  content: "> ";
  color: var(--color-text-muted);
}

/* ターミナルテーマではリストをより CUI ライクに */
[data-theme="terminal"] ul {
  list-style: none;
  padding-left: var(--space-md);
}

[data-theme="terminal"] ul li::before {
  content: "├── ";
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

[data-theme="terminal"] ul li:last-child::before {
  content: "└── ";
}
```

### `box-sizing: border-box` の重要性

```
content-box（デフォルト）:
┌─── width: 200px ────┐
│     content          │ + padding + border = 実際の幅は 200px より大きくなる
└─────────────────────┘

border-box:
┌──── width: 200px ───────────────┐
│ border │ padding │ content │ ... │ = 実際の幅もきっちり 200px
└─────────────────────────────────┘
```

`border-box` が無いと、padding や border を追加するたびに要素のサイズが変わり、レイアウトが崩れやすくなります。現代の CSS では**必ず** `border-box` に設定します。

---

## 7.4 テーマ切り替えコンポーネント

テーマの切り替えはユーザーのクリック操作が必要なので、React コンポーネントで実装します。

```tsx
// src/components/common/ThemeToggle.tsx
import { useState, useEffect } from "react";

type Theme = "standard" | "terminal";

export default function ThemeToggle() {
  // localStorage からテーマを取得（初回はnull）
  const [theme, setTheme] = useState<Theme>("standard");
  const [mounted, setMounted] = useState(false);

  // コンポーネントがマウントされた後にlocalStorageを読む
  // （サーバーサイドレンダリング時にlocalStorageは存在しないため）
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme === "standard" || savedTheme === "terminal") {
      setTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === "standard" ? "terminal" : "standard";
    setTheme(newTheme);

    // HTML 要素の data-theme 属性を更新
    document.documentElement.setAttribute("data-theme", newTheme);

    // localStorage に保存（次回アクセス時に復元するため）
    localStorage.setItem("theme", newTheme);
  };

  // マウント前はプレースホルダーを表示（ハイドレーションミスマッチ防止）
  if (!mounted) {
    return <button className="theme-toggle" aria-label="テーマ切り替え">⬜</button>;
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`テーマを${theme === "standard" ? "ターミナルモード" : "通常モード"}に切り替え`}
      title={theme === "standard" ? "ターミナルモードに切り替え" : "通常モードに切り替え"}
    >
      {theme === "standard" ? "🖥️" : ">_"}
    </button>
  );
}
```

### Header に組み込む

```astro
---
// src/components/common/Header.astro（更新版）
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "Home", href: "/" },
  // ... 省略
];
const currentPath = Astro.url.pathname;
---

<header class="site-header">
  <nav class="nav-container">
    <a href="/" class="site-logo">meg4ne.net</a>
    <ul class="nav-list">
      {/* ナビゲーション項目 */}
    </ul>
    <!-- client:load で即座にロード（テーマ切り替えは即応答が必要） -->
    <ThemeToggle client:load />
  </nav>
</header>
```

### localStorage によるテーマの永続化

```
ユーザーがテーマを「terminal」に切り替える
    ↓
1. document.documentElement.setAttribute("data-theme", "terminal")
   → 即座に CSS 変数が切り替わり、テーマが変わる
    ↓
2. localStorage.setItem("theme", "terminal")
   → ブラウザのストレージに保存
    ↓
--- 次にサイトを訪問した時 ---
    ↓
3. Layout.astro の is:inline スクリプトが localStorage を読む
   → ページ表示前に data-theme を設定（チラつき防止）
```

---

## 7.5 レスポンシブ対応

要件定義書では「PC画面のデザイン・実装を優先」しつつ「スマホでも閲覧可能にする」とあります。

### メディアクエリの基本

```css
/* モバイルファーストではなく、デスクトップファーストのアプローチ */
/* PC 用のスタイルをベースに、画面が狭い時にスタイルを上書き */

.nav-list {
  display: flex;
  gap: 0.5rem;
}

/* 768px 以下（タブレット・スマホ） */
@media (max-width: 768px) {
  .nav-list {
    display: none;  /* モバイルではハンバーガーメニューに切り替え */
  }

  main {
    padding: var(--space-md);
  }

  h1 {
    font-size: 1.5rem;
  }
}

/* 480px 以下（スマホ） */
@media (max-width: 480px) {
  .nav-container {
    padding: 0 var(--space-sm);
  }
}
```

### ブレイクポイントの設計

```css
/* よく使われるブレイクポイント */
/* 
  1200px以上  : デスクトップ（大画面）
  768-1199px  : タブレット・小型デスクトップ
  480-767px   : タブレット（縦向き）
  ~479px      : スマートフォン
*/
```

### モバイルナビゲーション（ハンバーガーメニュー）

モバイル画面ではナビゲーションリンクを隠し、ハンバーガーボタンで表示/非表示を切り替えます。これは React で実装するか、CSS + `<details>` 要素で実装できます：

```astro
---
// src/components/common/MobileMenu.astro
// CSS 純正のアプローチ（JavaScript なし）

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  // ...
];
---

<div class="mobile-menu">
  <details>
    <summary class="hamburger" aria-label="メニューを開く">
      <span class="hamburger-icon">☰</span>
    </summary>
    <ul class="mobile-nav-list">
      {navItems.map((item) => (
        <li>
          <a href={item.href}>{item.label}</a>
        </li>
      ))}
    </ul>
  </details>
</div>

<style>
  .mobile-menu {
    display: none;  /* PC では非表示 */
  }

  @media (max-width: 768px) {
    .mobile-menu {
      display: block;  /* モバイルで表示 */
    }
  }

  .hamburger {
    cursor: pointer;
    font-size: 1.5rem;
    list-style: none;  /* details のデフォルトの三角を消す */
    padding: var(--space-sm);
  }

  .hamburger::-webkit-details-marker {
    display: none;  /* Chrome でデフォルトの三角を消す */
  }

  .mobile-nav-list {
    position: absolute;
    top: var(--header-height);
    right: 0;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-sm) 0;
    min-width: 200px;
    list-style: none;
  }

  .mobile-nav-list a {
    display: block;
    padding: var(--space-sm) var(--space-lg);
    color: var(--color-text);
    text-decoration: none;
  }

  .mobile-nav-list a:hover {
    background: var(--color-bg-hover);
  }
</style>
```

---

## 7.6 ユーティリティクラス

頻繁に使うスタイルパターンをユーティリティクラスとして用意すると便利です：

```css
/* src/styles/utilities.css */

/* テキスト配置 */
.text-center { text-align: center; }
.text-right { text-align: right; }

/* フレックスボックス */
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }
.gap-lg { gap: var(--space-lg); }

/* グリッド */
.grid { display: grid; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }

@media (max-width: 768px) {
  .grid-2, .grid-3 {
    grid-template-columns: 1fr;  /* モバイルでは1列 */
  }
}

/* マージン・パディング */
.mt-md { margin-top: var(--space-md); }
.mt-lg { margin-top: var(--space-lg); }
.mt-xl { margin-top: var(--space-xl); }
.mb-md { margin-bottom: var(--space-md); }
.mb-lg { margin-bottom: var(--space-lg); }
.p-md { padding: var(--space-md); }
.p-lg { padding: var(--space-lg); }

/* 可視性 */
.sr-only {
  /* スクリーンリーダー専用（画面には見えないけど読み上げられる） */
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

> **Tailwind CSS を使わない理由**: このプロジェクトでは学習目的のため、CSS を直接書いて仕組みを理解します。Tailwind CSS は非常に便利ですが、CSS の基礎を理解してから導入する方が効果的です。

---

## 7.7 この章のまとめと確認項目

### 理解度チェック

1. CSS カスタムプロパティ（CSS変数）のメリットは？
   → テーマ切り替えが変数の値を変えるだけで実現できる

2. `data-theme` 属性方式でテーマを切り替える仕組みは？
   → HTML のルート要素の属性を JavaScript で切り替え、CSS の属性セレクタで異なる変数を適用

3. FOUC を防ぐためにどうしている？
   → `is:inline` スクリプトで localStorage からテーマを読み、ページ表示前に `data-theme` を設定

4. `box-sizing: border-box` にする理由は？
   → padding と border を width に含めるため、レイアウト計算が直感的になる

5. レスポンシブ対応でこのプロジェクトが採用するアプローチは？
   → デスクトップファースト（PC 用をベースに、メディアクエリでモバイル対応）

### 作成したファイル

```
src/styles/
├── variables.css    # CSS 変数（テーマカラー、スペーシング等）
├── global.css       # ベーススタイル、リセット
└── utilities.css    # ユーティリティクラス

src/components/common/
└── ThemeToggle.tsx   # テーマ切り替えボタン（React）
```

---

次の章: [第8章: コンテンツページの実装](./08-content-pages.md)
