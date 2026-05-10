# meg4ne.net を Astro で作る教科書
## Part 2: デザイントークン・レイアウト

---

> **全体の目次（全5パート）**
>
> 1. [Part 1: 基礎知識・環境構築・プロジェクト作成](./textbook_01_basics.md)（第1〜4章）
> 2. **Part 2（このファイル）**: デザイントークン・レイアウト（第5〜6章）
> 3. [Part 3: ページ実装](./textbook_03_pages.md)（第7〜10章）
> 4. [Part 4: ナビゲーション・データ管理](./textbook_04_nav_data.md)（第11〜12章）
> 5. [Part 5: SEO・デプロイ・次のステップ](./textbook_05_deploy.md)（第13〜15章 + Appendix）

---

# 第5章 デザイントークンを設定する

## 5-1 デザイントークンとは

「デザイントークン」とは、色・フォント・サイズなどを変数として定義したものです。

例えば背景色を直接 `#07090f` と書いてしまうと、  
100箇所に書いた後で色を変えたいとき、100箇所全部変更しなければなりません。  
変数として定義しておけば、一箇所変えるだけで全部変わります。

## 5-2 グローバルCSSを作成する

`src/styles/global.css` を新規作成します：

```css
/* ─────────────────────────────────────────────
   グローバルリセット
   ─────────────────────────────────────────────
   ブラウザはデフォルトでmarginやpaddingを持っています。
   Chrome と Safari で見た目が違う、などの問題を防ぐため
   最初にリセットします。
   ──────────────────────────────────────────── */
*,
*::before,
*::after {
  box-sizing: border-box; /* paddingやborderをwidthに含める */
  margin: 0;
  padding: 0;
}

/* ─────────────────────────────────────────────
   CSS カスタムプロパティ（変数）
   :root はドキュメント全体のルート要素。
   ここで定義した変数はどこからでも var(--変数名) で使える。
   ──────────────────────────────────────────── */
:root {
  /* === 背景色 === */
  --bg:   #07090f;   /* メイン背景（ほぼ黒） */
  --bg2:  #0c1018;   /* 少し明るい背景（カード等） */
  --bg3:  #111724;   /* さらに明るい背景（ホバー等） */

  /* === テキスト色 === */
  --t1:   #dde6f0;   /* メインテキスト（明るいグレー） */
  --t2:   #8098ae;   /* サブテキスト（中間グレー） */
  --t3:   #4a6272;   /* さらにサブ（暗いグレー） */

  /* === ボーダー === */
  --bd:   rgba(255, 255, 255, 0.06);   /* 薄い白のボーダー */
  --bda:  rgba(0, 204, 245, 0.20);     /* アクセントカラーのボーダー */

  /* === アクセントカラー === */
  --cy:    #00ccf5;  /* シアン（メインアクセント） */
  --green: #22c55e;  /* グリーン（サービス状態等） */

  /* === フォント === */
  --font-sans:  'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:  'JetBrains Mono', 'SF Mono', Consolas, monospace;
  --font-title: 'Space Grotesk', var(--font-sans);

  /* === セーフエリア（iPhoneのノッチ対応） ===
     env() はiOSのセーフエリアを参照する特殊な関数。
     ノッチやホームインジケーターと重ならないようにする。 */
  --safe-top:    env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

/* ─────────────────────────────────────────────
   ベーススタイル
   ──────────────────────────────────────────── */
html {
  /* スクロールを滑らかに */
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: var(--t1);
  font-family: var(--font-sans);
  /* アンチエイリアス（フォントを滑らかに表示） */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

/* リンクの初期スタイルをリセット */
a {
  color: inherit;
  text-decoration: none;
}

/* ボタンの初期スタイルをリセット */
button {
  cursor: pointer;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
}

/* 画像がはみ出さないように */
img {
  max-width: 100%;
  display: block;
}

/* ─────────────────────────────────────────────
   ユーティリティクラス
   よく使うスタイルをクラスとして定義。
   ──────────────────────────────────────────── */

/* アニメーション */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
```

## 5-3 Googleフォントを読み込む設定

後で作る `BaseLayout.astro` に追加しますが、今のうちに把握しておきます。

今回使うフォントは3種類です：
- **DM Sans** — 本文用のサンセリフ体（読みやすい）
- **JetBrains Mono** — コード的な表現に使うモノスペースフォント
- **Space Grotesk** — タイトル用の特徴的なフォント

---

# 第6章 レイアウトを作る

## 6-1 レイアウトとは

「レイアウト」は全ページで共通するHTML骨格です。  
`<html>`, `<head>`, `<meta>`, フォント読み込みなどを一箇所に集約します。  
各ページはレイアウトを「ラップ」として使い、中身だけを変えます。

**この仕組みがないと...**  
全ページに同じ `<head>` を書く → `<title>` を変えたいとき全ページ修正が必要になる。

## 6-2 BaseLayout.astroを作成する

`src/layouts/BaseLayout.astro` を作成します：

```astro
---
/**
 * フロントマター：このファイルで使う変数を受け取る
 * Propsとは「プロパティ」の略。外から渡してもらうデータ。
 */
import '../styles/global.css';

interface Props {
  title?: string;       // ページのタイトル（省略可、?がつく）
  description?: string; // SEO用の説明文
}

const {
  title = 'meg4ne.net',
  description = 'megane — 3D / MoCap / Homelab / UEC',
} = Astro.props;
---

<!doctype html>
<html lang="ja">
  <head>
    <!-- 文字コードの宣言。これがないと文字化けする -->
    <meta charset="UTF-8" />

    <!-- レスポンシブデザインの基本設定
         viewport-fit=cover はiPhoneのノッチ対応に必要 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

    <!-- SEO: ページの説明文。検索結果に表示される -->
    <meta name="description" content={description} />

    <!-- OGP (Open Graph Protocol): SNSでシェアしたときに表示されるカード情報 -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />

    <!-- Twitter/X用のカード設定 -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />

    <!-- favicon（ブラウザのタブに表示されるアイコン）
         public/favicon.svg を作成しておくこと -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <!-- Googleフォントの読み込み
         preconnect: フォントサーバーへの接続を事前に確立し、読み込みを高速化 -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;700&display=swap"
      rel="stylesheet"
    />

    <!-- ページタイトル -->
    <title>{title}</title>
  </head>

  <body>
    <!-- slot: ここに各ページの内容が入る
         Reactのchildren prop に相当する概念 -->
    <slot />
  </body>
</html>
```

> **`<slot />`について**  
> Astroのスロットは「ここに子コンテンツが入る」という印です。  
> このレイアウトを使うページが書いた内容が、`<slot />`の位置に挿入されます。

> **CSSのインポートについて**  
> グローバルCSSはフロントマター（`---` の中）で `import '../styles/global.css'` と書きます。  
> `<style is:global>` の中で `@import` を使う方法も動作しますが、Astroの推奨はフロントマターでのimportです。  
> こうすることでViteがCSS全体を確実に処理し、ホットリロードも正しく動きます。

## 6-3 BaseLayoutを使ったページの書き方

`src/pages/index.astro` を編集します：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="meg4ne.net" description="megane のポートフォリオ">
  <!-- ここに書いた内容が <slot /> の位置に入る -->
  <main>
    <h1>Hello, World!</h1>
  </main>
</BaseLayout>
```

---

> **前のパート**: [← Part 1: 基礎知識・環境構築・プロジェクト作成](./textbook_01_basics.md)  
> **次のパート**: [Part 3: ページ実装 →](./textbook_03_pages.md)
