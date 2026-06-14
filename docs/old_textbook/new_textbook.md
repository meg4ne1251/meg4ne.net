# meg4ne.net を Astro で作る教科書
## 完全初心者のためのステップバイステップガイド

---

> **この教科書の目標**
> デザインプロトタイプ（`meg4ne_net_Mobile_standalone.html`）と同じ見た目・構成のサイトを、  
> Astro + React + TypeScript で、ベストプラクティスに従って作る。
>
> **前提知識**: ターミナルを開いたことがある、ファイルを作ったり編集したりできる。  
> それだけで大丈夫です。

---

## 目次

1. [基礎知識：Webサイトはどう動くのか](#第1章-基礎知識webサイトはどう動くのか)
2. [開発環境を整える](#第2章-開発環境を整える)
3. [Astroプロジェクトを作る](#第3章-astroプロジェクトを作る)
4. [プロジェクト構成を理解する](#第4章-プロジェクト構成を理解する)
5. [デザイントークン（色・フォント）を設定する](#第5章-デザイントークンを設定する)
6. [レイアウトを作る](#第6章-レイアウトを作る)
7. [Heroセクション](#第7章-heroセクション)
8. [Aboutセクション](#第8章-aboutセクション)
9. [Serverページ](#第9章-serverページ)
10. [Writingページ](#第10章-writingページ)
11. [ナビゲーションとフッター](#第11章-ナビゲーションとフッター)
12. [コンテンツデータを管理する](#第12章-コンテンツデータを管理する)
13. [SEOとアクセシビリティ](#第13章-seoとアクセシビリティ)
14. [デプロイする](#第14章-デプロイする)
15. [次のステップ](#第15章-次のステップ)

---

# 第1章 基礎知識：Webサイトはどう動くのか

## 1-1 Webサイトの三大言語

Webサイトは3種類のファイルで構成されています。

| 言語 | 役割 | 例 |
|------|------|-----|
| **HTML** | 構造（骨格） | 「ここに見出しがある、ここにリストがある」 |
| **CSS** | 見た目（装飾） | 「見出しは青色で、フォントサイズは32px」 |
| **JavaScript** | 動き（インタラクション） | 「ボタンを押したらメニューが開く」 |

ブラウザ（ChromeやSafari）がこの3種類のファイルを読んで、画面に表示します。

## 1-2 「静的サイト」と「動的サイト」

**動的サイト（例：SNS、ECサイト）**  
ユーザーがアクセスするたびに、サーバーがHTMLをその場で生成して返します。  
毎回データベースを参照する必要があるので、複雑です。

**静的サイト（今回作るもの）**  
あらかじめHTMLファイルを生成しておいて、それをそのまま返します。  
シンプル・高速・安価。個人ポートフォリオサイトに最適です。

## 1-3 Astroとは何か

**Astro**は「静的サイトジェネレーター」のひとつです。

```
あなたが書くコード（.astro, .tsx ファイル）
    ↓ Astroがビルド
HTML + CSS + JS ファイル（ブラウザが読めるもの）
    ↓
インターネットに公開
```

Astroの特徴は**「デフォルトでJavaScriptを送らない」**ことです。  
普通のサイトはJSファイルを大量にブラウザに送って重くなりますが、  
Astroは必要な部分だけJSを送るので、**非常に速いサイトが作れます**。

## 1-4 なぜReactとTypeScriptも使うのか

今回のデザインには「タイピングアニメーション」「ページ切り替え」などの  
動的な部分があります。これを作るために **React** を使います。

**React**は「コンポーネント（部品）」という単位でUIを作るライブラリです。  
「ナビゲーション」「ヒーロー」「カード」などを独立した部品として作り、組み合わせます。

**TypeScript**はJavaScriptに「型」という概念を追加したものです。  
たとえば「この変数は文字列だ」「この関数はここで数値を返す」と明示できます。  
間違いをコードを書く段階で教えてくれるので、バグが減ります。

---

# 第2章 開発環境を整える

## 2-1 必要なものを確認する

ターミナルで以下を実行して、インストール済みか確認します。

```bash
node --version   # v18以上が必要
npm --version    # 9以上が必要
```

> **ターミナルの開き方（Mac）**: `Cmd + Space` → 「ターミナル」と入力 → Enter

もし `command not found` と表示されたら、Node.jsをインストールします。

## 2-2 Node.jsのインストール（nvmを使う方法・推奨）

**なぜnvmを使うのか？**  
Node.jsには複数のバージョンがあり、プロジェクトによって必要なバージョンが違います。  
`nvm`（Node Version Manager）を使うと、バージョンを簡単に切り替えられます。

```bash
# nvmをインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# ターミナルを再起動後
nvm install 20        # Node.js 20をインストール
nvm use 20            # Node.js 20を使用
node --version        # v20.x.x と表示されればOK
```

## 2-3 エディタのインストール

**VS Code**（Visual Studio Code）を使います。無料で最も広く使われているエディタです。

1. https://code.visualstudio.com からダウンロード
2. インストールして起動

**おすすめ拡張機能（VS Code内でインストール）**

- `Astro` — Astroファイルのシンタックスハイライト
- `ESLint` — コードの問題を検出
- `Prettier - Code formatter` — コードを自動整形
- `Tailwind CSS IntelliSense` — 後で使うかも（今回は不要）

拡張機能のインストール方法：VS Code左側のブロックアイコン（Extensions）→ 検索 → Install

---

# 第3章 Astroプロジェクトを作る

## 3-1 プロジェクトを作成する

ターミナルで作業ディレクトリに移動して、Astroの初期化コマンドを実行します。

```bash
# ホームディレクトリに「projects」フォルダを作って移動（なければ）
mkdir -p ~/projects
cd ~/projects

# Astroプロジェクトを作成
npm create astro@latest meg4ne-net
```

対話形式で質問されます。以下のように答えます：

```
Where should we create your new project?
→ そのままEnter（./meg4ne-net）

How would you like to start your new project?
→ "Empty" を選択（矢印キーで選んでEnter）

Do you plan to write TypeScript?
→ Yes

How strict should TypeScript be?
→ "Strict" を選択

Install dependencies?
→ Yes

Initialize a new git repository?
→ Yes（Gitを使う場合。使わないならNo）
```

## 3-2 Reactを追加する

Astroには公式のインテグレーション（連携機能）があります。  
Reactを追加するのは一行のコマンドだけです。

```bash
cd meg4ne-net
npx astro add react
```

「y」を入力してEnterで確認します。  
これで Astro が React のコンポーネントを認識できるようになります。

## 3-3 開発サーバーを起動する

```bash
npm run dev
```

ターミナルに `http://localhost:4321` と表示されます。  
ブラウザでそのURLを開くと、空のサイトが表示されます。

> **開発サーバーとは？**  
> ファイルを編集するたびに自動的にブラウザが更新される、  
> 開発用の一時的なWebサーバーです。本番公開には使いません。

ターミナルで `Ctrl + C` を押すと停止します。

---

# 第4章 プロジェクト構成を理解する

## 4-1 ファイル構成を確認する

VS Codeでフォルダを開きます（`File → Open Folder → meg4ne-net`）。

生成されたファイル構成はこうなっています：

```
meg4ne-net/
├── public/           ← そのまま公開するファイル（画像、favicon等）
├── src/              ← ソースコード（ここを主に編集する）
│   ├── pages/        ← URLに対応するページファイル
│   │   └── index.astro
│   └── env.d.ts      ← TypeScriptの型定義
├── astro.config.mjs  ← Astroの設定ファイル
├── package.json      ← プロジェクトの設定・依存関係
└── tsconfig.json     ← TypeScriptの設定
```

## 4-2 このプロジェクトで作る構成

今回のサイトは以下の構成で作ります：

```
src/
├── components/           ← 再利用可能な部品
│   ├── Nav.tsx           ← ナビゲーション（ハンバーガーメニュー）
│   ├── Hero.tsx          ← ヒーローセクション
│   ├── AboutSection.tsx  ← 自己紹介セクション
│   ├── ServerTeaser.tsx  ← サーバーへの誘導
│   ├── BlogSection.tsx   ← ブログ記事一覧
│   ├── LinksSection.tsx  ← リンク集
│   └── Footer.tsx        ← フッター
├── pages/
│   ├── index.astro       ← ホームページ（/）
│   ├── server.astro      ← サーバーページ（/server）
│   └── writing.astro     ← 執筆ページ（/writing）
├── layouts/
│   └── BaseLayout.astro  ← 全ページ共通のHTML骨格
├── styles/
│   └── global.css        ← グローバルCSS（CSS変数等）
└── data/
    ├── tech.ts           ← 技術スタックデータ
    ├── blogs.ts          ← ブログ記事データ
    └── machines.ts       ← マシン・サービスデータ
```

> **なぜこの構成なのか？**  
> 「関心の分離」という原則です。データ・見た目・ロジックを別々のファイルに分けることで、  
> 「記事を追加したい」→ `data/blogs.ts` だけ編集すればよい、という状態になります。  
> 一箇所を変更しても他が壊れにくく、見通しも良くなります。

## 4-3 Astroコンポーネントの基本構造

`.astro`ファイルは独自の形式を持っています：

```astro
---
// ここはフロントマター（サーバーサイドで実行されるJavaScript/TypeScript）
// データの取得、importなどをここに書く
import SomeComponent from '../components/SomeComponent.tsx';
const title = "meg4ne.net";
---

<!-- ここはHTML（Reactのように変数を埋め込める） -->
<html>
  <head>
    <title>{title}</title>
  </head>
  <body>
    <SomeComponent />
  </body>
</html>
```

**フロントマター**（`---`と`---`で囲まれた部分）は、ビルド時（サーバーサイド）でのみ実行されます。  
ここで書いたコードはブラウザには送られません。

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

<!-- グローバルCSSはここに書くか、importする -->
<style is:global>
  /* global.cssの内容をここにimportする、または直接書く */
  @import '../styles/global.css';
</style>
```

> **`<slot />`について**  
> Astroのスロットは「ここに子コンテンツが入る」という印です。  
> このレイアウトを使うページが書いた内容が、`<slot />`の位置に挿入されます。

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

# 第7章 Heroセクション

## 7-1 デザインの分析

デザインプロトタイプのHeroセクションは以下の要素で構成されています：

- 背景：ドットグリッドパターン（SVGで実装）
- メインテキスト：「meg」+ タイピングアニメーション + 「ane」
- サブテキスト：`root@meg4ne:~#` というターミナル風の文字
- 説明文：UEC・VLL・Homlab等の紹介
- スキルチップ：技術タグの一覧
- CTAボタン：「~/server」「~/blog」へのリンク

## 7-2 Reactコンポーネントとして実装する理由

タイピングアニメーションは「時間が経つにつれて表示する文字数が変わる」という  
**動的な状態変化**です。これはJavaScriptが必要です。

Astroのコンポーネントはデフォルトでは静的（JavaScriptなし）ですが、  
`client:load` ディレクティブをつけると、ブラウザ側でも動作するようになります。

## 7-3 Hero.tsxを作成する

`src/components/Hero.tsx` を作成します：

```tsx
/**
 * Hero.tsx
 * トップページのファーストビューセクション。
 * タイピングアニメーションがあるため React コンポーネントとして実装。
 */

import { useState, useEffect } from 'react';

// ─────────────────────────────────────────
// 型定義
// TypeScriptでは、コンポーネントが受け取るpropsの型を定義する。
// 今回のHeroはpropsを受け取らないのでPropsは不要。
// ─────────────────────────────────────────

export default function Hero() {
  // useState: Reactの「状態管理」フック。
  // 状態が変わると、コンポーネントが再レンダリング（再描画）される。
  // [現在の値, 値を変える関数] = useState(初期値)
  const [typed, setTyped] = useState('');

  // タイピングしたい文字
  const TARGET = 'megane';

  // useEffect: コンポーネントが表示された後に実行される処理。
  // 第2引数の配列が空([])のとき、最初の一回だけ実行される。
  useEffect(() => {
    let i = 0;

    // setInterval: 指定ミリ秒ごとに繰り返し実行する
    const timerId = setInterval(() => {
      i++;
      // 0文字目からi文字目までを取り出して表示
      setTyped(TARGET.slice(0, i));

      // 全部打ち終わったらタイマーを停止
      if (i >= TARGET.length) {
        clearInterval(timerId);
      }
    }, 72); // 72msごとに1文字追加

    // クリーンアップ関数: コンポーネントが消えるときにタイマーを止める
    // メモリリーク防止のために必要
    return () => clearInterval(timerId);
  }, []); // 空の配列 = マウント時に一度だけ実行

  return (
    // section: HTMLのセマンティックタグ。意味のあるまとまりを示す。
    // minHeight: 85svh → ビューポートの高さの85%。svhはモバイルでも正確な単位。
    <section
      style={{
        position: 'relative',
        minHeight: '85svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 24px 48px',
        overflow: 'hidden',
      }}
    >
      {/* ドットグリッド背景
          SVGのpatternを使って繰り返しのドットを描画 */}
      <DotGrid />

      {/* コンテンツ本体（背景の上に重なる） */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px' }}>

        {/* ターミナル風ラベル */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--t3)',
            marginBottom: '20px',
            letterSpacing: '0.06em',
          }}
        >
          root@meg4ne:~# whoami
        </p>

        {/* メインタイトル（タイピングアニメーション付き） */}
        <h1
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: 'clamp(56px, 12vw, 96px)', // clamp(最小, 推奨, 最大)でレスポンシブなフォントサイズ
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'var(--t1)',
            lineHeight: 1,
            marginBottom: '32px',
          }}
        >
          {/* 入力済みの文字 */}
          <span>{typed}</span>
          {/* カーソル（点滅アニメーション） */}
          <span
            style={{
              display: 'inline-block',
              width: '3px',
              height: '0.85em',
              background: 'var(--cy)',
              marginLeft: '4px',
              verticalAlign: 'middle',
              animation: 'blink 1s step-end infinite',
            }}
          />
        </h1>

        {/* 自己紹介テキスト */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--t2)',
            lineHeight: 1.8,
            marginBottom: '36px',
          }}
        >
          {/* コメント風の説明文 */}
          <p>
            <span style={{ color: 'var(--t3)' }}>// </span>
            電気通信大学 3年 / 2類I科
          </p>
          <p>
            <span style={{ color: 'var(--t3)' }}>// </span>
            VLL（バーチャルライブ研究会）代表
          </p>
          <p>
            <span style={{ color: 'var(--t3)' }}>// </span>
            3D・MoCap・Homelab
          </p>
        </div>

        {/* CTAボタン（Call to Action） */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="/server"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--cy)',
              border: '1px solid var(--bda)',
              padding: '10px 20px',
              borderRadius: '4px',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,204,245,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ~/server
          </a>
          <a
            href="/writing"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--t2)',
              border: '1px solid var(--bd)',
              padding: '10px 20px',
              borderRadius: '4px',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)';
              e.currentTarget.style.color = 'var(--t1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = '1px solid var(--bd)';
              e.currentTarget.style.color = 'var(--t2)';
            }}
          >
            ~/writing
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * ドットグリッド背景コンポーネント
 * SVGのpatternElementを使って繰り返しのドットを描画する。
 * 別コンポーネントとして切り出すことでHeroのコードが読みやすくなる。
 */
function DotGrid() {
  return (
    // position: absolute で親のsectionに対して絶対配置
    // inset: 0 は top:0, right:0, bottom:0, left:0 の省略形
    // pointerEvents: none でクリックを無視（背景なので当然）
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* pattern: 繰り返しのパターンを定義 */}
        <pattern
          id="dots"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse" // ユーザー座標系（ピクセル）でパターンサイズを指定
        >
          {/* 小さな円（ドット） */}
          <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.05)" />
        </pattern>
      </defs>
      {/* パターンを全面に適用 */}
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}
```

---

# 第8章 Aboutセクション

## 8-1 AboutSection.tsxを作成する

`src/components/AboutSection.tsx` を作成します：

```tsx
/**
 * AboutSection.tsx
 * 自己紹介 + 技術スタック一覧セクション。
 * 動的な状態変化がないため、シンプルなReactコンポーネントとして実装。
 */

// 技術スタックデータ（後で data/tech.ts に移す）
const TECH_STACK = [
  {
    group: '3D / Motion',
    items: ['Blender', 'MotionBuilder', 'Unity', 'C#', 'Vive MoCap'],
  },
  {
    group: 'Infrastructure',
    items: ['Proxmox', 'Docker', 'GitLab', 'Zabbix', 'Grafana', 'Cloudflare'],
  },
  {
    group: 'Tools',
    items: ['Obsidian', 'Bambu Lab', 'Claude Code'],
  },
];

// ─────────────────────────────────────────
// 小さな共通コンポーネント
// ─────────────────────────────────────────

/**
 * Chip: タグ・バッジコンポーネント
 * childrenはReactの特殊なpropで、タグの中に書いた内容が入る。
 * <Chip>Blender</Chip> と書くと children = "Blender"
 */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--cy)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '3px 9px',
        borderRadius: '2px',
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
}

/**
 * SectionLabel: セクションのラベル（コメント風）
 */
function SectionLabel({ text }: { text: string }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--t2)',
        marginBottom: '14px',
      }}
    >
      <span style={{ color: 'var(--t3)' }}>// </span>
      {text}
    </p>
  );
}

// ─────────────────────────────────────────
// メインコンポーネント
// ─────────────────────────────────────────

export default function AboutSection() {
  return (
    <section
      style={{
        padding: '80px 24px',
        maxWidth: '640px',
        margin: '0 auto', // 左右自動マージンで中央寄せ
      }}
    >
      <SectionLabel text="about/index.ts" />

      <h2
        style={{
          fontFamily: 'var(--font-title)',
          fontSize: '32px',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: 'var(--t1)',
          marginBottom: '20px',
        }}
      >
        About
      </h2>

      <p
        style={{
          color: 'var(--t2)',
          lineHeight: 1.75,
          marginBottom: '48px',
          fontSize: '15px',
        }}
      >
        電気通信大学 情報理工学域 Ⅱ類 知能機械工学プログラム 3年。
        VLL（バーチャルライブ研究会）で3DモデリングとMoCapを担当しつつ、
        代表として運営にも携わっています。
        自宅ラボでProxmoxベースのサーバー環境を構築・運用中。
        ネットワークエンジニアとしてのインターン準備中。
      </p>

      {/* 技術スタック */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {TECH_STACK.map((category) => (
          // key prop: Reactがリストの各要素を識別するための必須属性
          // ループで要素を生成するときは必ずユニークなkeyをつける
          <div key={category.group}>
            {/* グループ名 */}
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--t3)',
                marginBottom: '10px',
              }}
            >
              {category.group}
            </p>

            {/* チップ一覧 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {category.items.map((item) => (
                <Chip key={item}>{item}</Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

# 第9章 Serverページ

## 9-1 ページファイルを作成する

`src/pages/server.astro` を作成します：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ServerPage from '../components/ServerPage.tsx';
---

<BaseLayout title="Homelab — meg4ne.net" description="自宅サーバー環境の紹介">
  <!-- client:load: このコンポーネントをブラウザでもJSとして読み込む
       静的なコンテンツだけなら不要だが、インタラクションがある場合に必要 -->
  <ServerPage client:load />
</BaseLayout>
```

## 9-2 ServerPage.tsxを作成する

`src/components/ServerPage.tsx` を作成します：

```tsx
/**
 * ServerPage.tsx
 * 自宅サーバー・ホームラボの紹介ページ。
 * マシン一覧、運用サービス一覧を表示する。
 */

// ─────────────────────────────────────────
// 型定義
// TypeScriptで「このデータはこういう形だ」と宣言する。
// ─────────────────────────────────────────

interface Machine {
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  os: string;
  role: string;
}

interface Service {
  name: string;
  desc: string;
  role: string;
}

// ─────────────────────────────────────────
// データ
// ─────────────────────────────────────────

const MACHINES: Machine[] = [
  {
    name: 'CHITOSE (AT-x510)',
    cpu: 'L3 Switch',
    ram: '—',
    storage: '—',
    os: 'AlliedWare Plus',
    role: 'Core Switch',
  },
  {
    name: 'ML350 Gen9',
    cpu: 'Intel Xeon E5-2620 v4',
    ram: '64GB DDR4 ECC',
    storage: '500GB NVMe + 4TB HDD',
    os: 'Proxmox VE 8.x',
    role: 'Hypervisor',
  },
  {
    name: 'MacBook M1 Pro',
    cpu: 'Apple M1 Pro',
    ram: '32GB',
    storage: '512GB NVMe',
    os: 'macOS',
    role: 'Primary Dev Machine',
  },
];

const SERVICES: Service[] = [
  { name: 'GitLab CE',          desc: 'セルフホスト Git サーバー',       role: 'VCS / CI/CD'  },
  { name: 'Grafana + Zabbix',   desc: 'ネットワーク・サーバー監視',      role: 'Monitoring'   },
  { name: 'Docker / Portainer', desc: 'コンテナ管理プラットフォーム',    role: 'Container'    },
  { name: 'Cloudflare Tunnel',  desc: '外部公開用セキュアトンネル',      role: 'Network'      },
  { name: 'Headscale',          desc: 'VPN メッシュネットワーク',        role: 'VPN'          },
  { name: 'PowerDNS',           desc: '内部 DNS サーバー',               role: 'DNS'          },
];

// ─────────────────────────────────────────
// 小さなコンポーネント
// ─────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      color: 'var(--t2)',
      marginBottom: '14px',
    }}>
      <span style={{ color: 'var(--t3)' }}>// </span>
      {text}
    </p>
  );
}

/**
 * MachineCard: マシン1台分のカードUI
 */
function MachineCard({ machine }: { machine: Machine }) {
  return (
    <div
      style={{
        border: '1px solid var(--bd)',
        borderRadius: '8px',
        padding: '20px',
        background: 'var(--bg2)',
      }}
    >
      {/* ヘッダー行 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <h3 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--t1)',
        }}>
          {machine.name}
        </h3>
        {/* ロールバッジ */}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--cy)',
          border: '1px solid var(--bda)',
          padding: '2px 8px',
          borderRadius: '2px',
        }}>
          {machine.role}
        </span>
      </div>

      {/* スペック一覧 */}
      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px' }}>
        {[
          ['CPU', machine.cpu],
          ['RAM', machine.ram],
          ['Storage', machine.storage],
          ['OS', machine.os],
        ].map(([label, value]) => (
          // React.Fragment: 余分なDOM要素を生成せずに複数要素をまとめる
          <React.Fragment key={label}>
            <dt style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--t3)',
              letterSpacing: '0.04em',
            }}>
              {label}
            </dt>
            <dd style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--t2)',
            }}>
              {value}
            </dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}

// ─────────────────────────────────────────
// メインコンポーネント
// ─────────────────────────────────────────

import React from 'react';

export default function ServerPage() {
  return (
    <main style={{ padding: '0 0 80px' }}>

      {/* ページヘッダー */}
      <div style={{ padding: '40px 24px 0', maxWidth: '800px', margin: '0 auto' }}>
        <a href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--t2)',
          marginBottom: '20px',
        }}>
          ← cd ..
        </a>

        <SectionLabel text="infra/topology.ts" />

        <h1 style={{
          fontFamily: 'var(--font-title)',
          fontSize: '40px',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: 'var(--t1)',
          marginBottom: '12px',
        }}>
          Homelab
        </h1>

        <p style={{
          color: 'var(--t2)',
          fontSize: '15px',
          lineHeight: 1.75,
          marginBottom: '48px',
        }}>
          Proxmox + JunOS + Cloudflare で構成した自宅ラボ。
          VLAN、OSPF、VPN、監視スタック、CI/CDをすべてセルフホスト。
        </p>
      </div>

      {/* マシン一覧 */}
      <div style={{ padding: '0 24px', maxWidth: '800px', margin: '0 auto', marginBottom: '60px' }}>
        <h2 style={{
          fontFamily: 'var(--font-title)',
          fontSize: '20px',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: 'var(--t1)',
          marginBottom: '20px',
        }}>
          Machines
        </h2>

        {/* グリッドレイアウト
            auto-fill: 利用可能な幅に応じて自動的に列数を決める
            minmax(280px, 1fr): 最小280px、最大は残り幅いっぱい */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {MACHINES.map((machine) => (
            <MachineCard key={machine.name} machine={machine} />
          ))}
        </div>
      </div>

      {/* サービス一覧 */}
      <div style={{ padding: '0 24px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-title)',
          fontSize: '20px',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: 'var(--t1)',
          marginBottom: '20px',
        }}>
          Running Services
        </h2>

        {/* テーブル風のリスト */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--bd)', border: '1px solid var(--bd)', borderRadius: '8px', overflow: 'hidden' }}>
          {SERVICES.map((service) => (
            <div
              key={service.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                background: 'var(--bg2)',
                gap: '16px',
              }}
            >
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--t1)', marginBottom: '2px' }}>
                  {service.name}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--t3)' }}>
                  {service.desc}
                </p>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--green)',
                border: '1px solid rgba(34,197,94,0.3)',
                padding: '2px 8px',
                borderRadius: '2px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {service.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
```

---

# 第10章 Writingページ

## 10-1 フィルター機能付きのページを作る

`src/components/WritingPage.tsx` を作成します：

```tsx
/**
 * WritingPage.tsx
 * ブログ記事一覧ページ。
 * プラットフォームでフィルタリングできる。
 * useStateでフィルター状態を管理するためReactコンポーネント。
 */

import { useState } from 'react';

// ─────────────────────────────────────────
// 型定義
// ─────────────────────────────────────────

interface BlogPost {
  title: string;
  date: string;
  tags: string[];
  platform: 'Qiita' | 'Zenn' | 'Note';
  url?: string; // 省略可（? がつく）
}

// ─────────────────────────────────────────
// データ（後でdata/blogs.tsに移す）
// ─────────────────────────────────────────

// プラットフォームの色定義
const PLATFORM_COLORS: Record<string, string> = {
  Qiita: '#55c500',
  Zenn:  '#3ea8ff',
  Note:  '#41c9b4',
};

// 全記事データ
const ALL_POSTS: BlogPost[] = [
  { platform: 'Qiita', title: 'ProxmoxでVMを自動プロビジョニングする方法',     date: '2025-03-12', tags: ['Proxmox', 'Infra'] },
  { platform: 'Qiita', title: 'ZabbixとGrafanaで自宅監視ダッシュボードを構築', date: '2025-01-28', tags: ['Zabbix', 'Grafana'] },
  { platform: 'Qiita', title: 'BlenderのPython APIで作業を自動化する',         date: '2024-11-15', tags: ['Blender', 'Python'] },
  { platform: 'Zenn',  title: 'Cloudflare TunnelでSSH over HTTPを実現する',   date: '2025-04-02', tags: ['Cloudflare', 'SSH'] },
  { platform: 'Zenn',  title: 'UnityでViveモーションキャプチャを活用する',     date: '2024-12-20', tags: ['Unity', 'MoCap'] },
  { platform: 'Note',  title: '自宅サーバーを始めて1年、やってよかったこと',   date: '2025-02-14', tags: ['Server', 'Life'] },
  { platform: 'Note',  title: '電通大のサークルと3Dモデリングの話',            date: '2024-10-03', tags: ['Life'] },
];

// ─────────────────────────────────────────
// 小さなコンポーネント
// ─────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--t2)', marginBottom: '14px' }}>
      <span style={{ color: 'var(--t3)' }}>// </span>
      {text}
    </p>
  );
}

/**
 * PostCard: 記事カード1枚
 */
function PostCard({ post }: { post: BlogPost }) {
  const platformColor = PLATFORM_COLORS[post.platform] || 'var(--t2)';

  // 日付をフォーマット（YYYY-MM-DD → YYYY.MM.DD）
  const formattedDate = post.date.replace(/-/g, '.');

  return (
    <article
      style={{
        padding: '20px 0',
        borderBottom: '1px solid var(--bd)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* プラットフォーム + 日付 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: platformColor,
          fontWeight: 500,
        }}>
          {post.platform}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--t3)' }}>
          {formattedDate}
        </span>
      </div>

      {/* タイトル */}
      <h3 style={{
        fontSize: '15px',
        fontWeight: 500,
        color: 'var(--t1)',
        lineHeight: 1.5,
      }}>
        {post.url ? (
          <a href={post.url} style={{ color: 'inherit' }}>
            {post.title}
          </a>
        ) : (
          post.title
        )}
      </h3>

      {/* タグ */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {post.tags.map((tag) => (
          <span key={tag} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--t3)',
            border: '1px solid var(--bd)',
            padding: '2px 7px',
            borderRadius: '2px',
          }}>
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}

// ─────────────────────────────────────────
// メインコンポーネント
// ─────────────────────────────────────────

type FilterOption = 'All' | 'Qiita' | 'Zenn' | 'Note';
const FILTER_OPTIONS: FilterOption[] = ['All', 'Qiita', 'Zenn', 'Note'];

export default function WritingPage() {
  // フィルター状態を管理
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  // フィルタリングされた記事一覧
  // filter(): 条件に合う要素だけを返す配列メソッド
  const filteredPosts = activeFilter === 'All'
    ? ALL_POSTS
    : ALL_POSTS.filter((post) => post.platform === activeFilter);

  return (
    <main style={{ padding: '0 0 80px', maxWidth: '640px', margin: '0 auto' }}>

      {/* ページヘッダー */}
      <div style={{ padding: '40px 24px 0' }}>
        <a href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--t2)',
          marginBottom: '20px',
        }}>
          ← cd ..
        </a>

        <SectionLabel text="blog/index.ts" />

        <h1 style={{
          fontFamily: 'var(--font-title)',
          fontSize: '40px',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: 'var(--t1)',
          marginBottom: '28px',
        }}>
          Writing
        </h1>

        {/* フィルタータブ */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '8px',
          // 横スクロール対応（モバイルで多くのタブがある場合）
          overflowX: 'auto',
          paddingBottom: '4px',
          // スクロールバーを非表示（見た目のため）
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        } as React.CSSProperties}>
          {FILTER_OPTIONS.map((option) => {
            const isActive = option === activeFilter;
            return (
              <button
                key={option}
                onClick={() => setActiveFilter(option)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--bda)' : 'var(--bd)',
                  color: isActive ? 'var(--cy)' : 'var(--t3)',
                  background: isActive ? 'rgba(0,204,245,0.08)' : 'transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* 記事一覧 */}
      <div style={{ padding: '0 24px' }}>
        {/* 件数表示 */}
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--t3)',
          marginBottom: '4px',
        }}>
          {filteredPosts.length} posts
        </p>

        {filteredPosts.map((post, index) => (
          <PostCard key={`${post.platform}-${index}`} post={post} />
        ))}

        {filteredPosts.length === 0 && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--t3)',
            padding: '40px 0',
            textAlign: 'center',
          }}>
            // no posts found
          </p>
        )}
      </div>
    </main>
  );
}
```

---

# 第11章 ナビゲーションとフッター

## 11-1 Nav.tsxを作成する

`src/components/Nav.tsx` を作成します。  
デスクトップ：横並びリンク。モバイル：ハンバーガーメニュー。

```tsx
/**
 * Nav.tsx
 * サイト全体のナビゲーション。
 * モバイルではハンバーガーアイコンを押してオーバーレイメニューを表示。
 * ハンバーガーの開閉状態を管理するためReactコンポーネント。
 */

import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/',        label: '~/about'  },
  { href: '/server',  label: '~/server' },
  { href: '/writing', label: '~/writing' },
];

// 現在のパスを取得する（現在のページを強調表示するため）
// Astroからpropsとして受け取る
interface NavProps {
  currentPath: string;
}

export default function Nav({ currentPath }: NavProps) {
  // ハンバーガーメニューの開閉状態
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  return (
    <>
      {/* ─── トップバー ─── */}
      <nav
        style={{
          position: 'sticky',   // スクロールしても画面上部に固定
          top: 0,
          zIndex: 300,
          height: '54px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid var(--bd)',
          background: 'rgba(7, 9, 15, 0.92)',
          backdropFilter: 'blur(16px)',     // 背景をぼかすガラス効果
          WebkitBackdropFilter: 'blur(16px)', // Safari用のプレフィックス
        }}
      >
        {/* ロゴ */}
        <a href="/" style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--t1)',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{ color: 'var(--t3)' }}>~/</span>
          <span>meg4ne</span>
          <span style={{ color: 'var(--t2)' }}>.</span>
          <span style={{ color: 'var(--cy)' }}>net</span>
        </a>

        {/* デスクトップ用ナビリンク（モバイルでは非表示） */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}
             className="nav-desktop">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: isActive ? 'var(--cy)' : 'var(--t2)',
                  transition: 'color 0.15s',
                }}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* ハンバーガーアイコン（モバイルのみ表示） */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={isOpen}  // アクセシビリティ: スクリーンリーダーに状態を伝える
          className="nav-hamburger"
          style={{
            width: '44px',
            height: '44px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: 0,
          }}
        >
          {/* 三本線のアニメーション
              isOpenのときに×印に変形する */}
          {[
            { rotate: isOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' },
            { opacity: isOpen ? 0 : 1 },
            { rotate: isOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none' },
          ].map((style, i) => (
            <span
              key={i}
              style={{
                display: 'block',
                width: '22px',
                height: '1.5px',
                background: isOpen ? 'var(--cy)' : 'var(--t1)',
                transition: 'all 0.2s',
                transform: style.rotate,
                opacity: style.opacity,
              }}
            />
          ))}
        </button>
      </nav>

      {/* ─── オーバーレイメニュー ─── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(7, 9, 15, 0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 36px',
            animation: 'fadeIn 0.2s ease both',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--t3)',
            marginBottom: '32px',
            letterSpacing: '0.06em',
          }}>
            root@meg4ne:~# navigate
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV_ITEMS.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '28px',
                    fontWeight: 500,
                    color: isActive ? 'var(--cy)' : 'var(--t1)',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--bd)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'color 0.15s',
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span style={{ fontSize: '12px', color: 'var(--cy)' }}>← current</span>
                  )}
                </a>
              );
            })}
          </div>

          {/* SNSリンク（仮） */}
          <div style={{ marginTop: '48px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['GitLab', 'X / Twitter', 'Email'].map((label) => (
              <span key={label} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--t3)',
                border: '1px solid var(--bd)',
                padding: '6px 12px',
                borderRadius: '2px',
              }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* デスクトップ/モバイル切り替え用CSS */}
      <style>{`
        .nav-hamburger { display: none; }
        .nav-desktop   { display: flex; }

        /* 768px以下（タブレット・スマートフォン）のとき切り替える */
        @media (max-width: 768px) {
          .nav-hamburger { display: flex; }
          .nav-desktop   { display: none; }
        }
      `}</style>
    </>
  );
}
```

## 11-2 Footer.tsxを作成する

`src/components/Footer.tsx` を作成します：

```tsx
/**
 * Footer.tsx
 * シンプルなフッター。
 * 動的な内容がないのでReactコンポーネントにする必要はないが、
 * 統一性のためReact関数コンポーネントとして定義。
 */

export default function Footer() {
  const year = new Date().getFullYear(); // 現在の年を自動取得

  return (
    <footer
      style={{
        padding: '24px',
        paddingBottom: 'calc(24px + var(--safe-bottom))',
        borderTop: '1px solid var(--bd)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--t3)' }}>
        © {year} megane — meg4ne.net
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--t3)' }}>
        Built with Astro + React + TypeScript
      </span>
    </footer>
  );
}
```

---

# 第12章 コンテンツデータを管理する

## 12-1 データを分離する意味

今まで各コンポーネントの中にデータを直接書いていましたが、  
`src/data/` フォルダに分離することで：

- コンポーネントコードがすっきりする
- 記事追加・マシン追加が「データファイルだけ編集」で済む
- TypeScriptの型チェックがデータにも効く

## 12-2 data/blogs.tsを作成する

`src/data/blogs.ts` を作成します：

```typescript
/**
 * blogs.ts
 * ブログ記事のデータ。
 * 新しい記事を書いたらここに追加するだけでWritingPageに反映される。
 */

// 型定義
export interface BlogPost {
  title: string;
  date: string;      // YYYY-MM-DD形式
  tags: string[];
  platform: 'Qiita' | 'Zenn' | 'Note';
  url?: string;      // URLがあれば記事にリンクされる
}

// プラットフォームの色定義
export const PLATFORM_COLORS: Record<BlogPost['platform'], string> = {
  Qiita: '#55c500',
  Zenn:  '#3ea8ff',
  Note:  '#41c9b4',
};

// 記事一覧（新しい順に書く）
export const BLOG_POSTS: BlogPost[] = [
  {
    platform: 'Zenn',
    title: 'Cloudflare TunnelでSSH over HTTPを実現する',
    date: '2025-04-02',
    tags: ['Cloudflare', 'SSH'],
    url: 'https://zenn.dev/meg4ne/articles/xxxx', // 実際のURLに変更
  },
  {
    platform: 'Qiita',
    title: 'ProxmoxでVMを自動プロビジョニングする方法',
    date: '2025-03-12',
    tags: ['Proxmox', 'Infra'],
  },
  // 新しい記事はここに追加...
];
```

## 12-3 data/tech.tsを作成する

`src/data/tech.ts` を作成します：

```typescript
/**
 * tech.ts
 * 技術スタックのデータ。
 */

export interface TechCategory {
  group: string;
  items: string[];
}

export const TECH_STACK: TechCategory[] = [
  {
    group: '3D / Motion',
    items: ['Blender', 'MotionBuilder', 'Unity', 'C#', 'Vive MoCap'],
  },
  {
    group: 'Infrastructure',
    items: ['Proxmox', 'Docker', 'GitLab', 'Zabbix', 'Grafana', 'Cloudflare'],
  },
  {
    group: 'Network',
    items: ['OSPF', 'VLAN', 'JunOS', 'WireGuard', 'Headscale'],
  },
  {
    group: 'Development',
    items: ['TypeScript', 'Python', 'Astro', 'React'],
  },
  {
    group: 'Tools',
    items: ['Obsidian', 'Bambu Lab', 'Claude Code', '1Password'],
  },
];
```

---

# 第13章 SEOとアクセシビリティ

## 13-1 SEOとは

SEO（Search Engine Optimization）は「検索エンジン最適化」です。  
Googleで「megane meg4ne」と検索したときに、自分のサイトが表示されるようにする施策です。

**基本的にやること：**
- `<title>` を各ページで適切に設定する（BaseLayoutで対応済み）
- `<meta name="description">` を設定する（BaseLayoutで対応済み）
- 適切なHTMLタグを使う（`<h1>`, `<h2>`, `<nav>`, `<main>`, `<footer>` etc.）

## 13-2 アクセシビリティとは

アクセシビリティは「すべての人が使いやすい」ように配慮することです。  
スクリーンリーダー（目の見えない方が使うブラウザの読み上げ機能）でも  
使えるサイトにするための配慮です。

**基本的にやること：**

```tsx
// ❌ 悪い例：クリックできることが視覚的にしか分からない
<div onClick={handleClick}>クリック</div>

// ✅ 良い例：button要素を使う（キーボードでも操作できる）
<button onClick={handleClick}>クリック</button>

// 画像には alt を必ずつける
<img src="/avatar.jpg" alt="meganeのアバター" />

// アイコンだけのボタンには aria-label をつける
<button aria-label="メニューを開く">☰</button>

// 開閉状態は aria-expanded で伝える
<button aria-expanded={isOpen} aria-label="メニューを開く">☰</button>
```

## 13-3 favicon（タブアイコン）を作る

`public/favicon.svg` を作成します：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <!-- 背景 -->
  <rect width="64" height="64" fill="#07090f" rx="12"/>
  <!-- ドットパターン -->
  <pattern id="d" width="8" height="8" patternUnits="userSpaceOnUse">
    <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,.08)"/>
  </pattern>
  <rect width="64" height="64" fill="url(#d)" rx="12"/>
  <!-- M の文字 -->
  <text
    x="32" y="46"
    text-anchor="middle"
    font-family="monospace"
    font-size="40"
    font-weight="700"
    fill="#00ccf5"
  >M</text>
</svg>
```

---

# 第14章 デプロイする

## 14-1 「デプロイ」とは

ローカル（自分のPC）で動いているサイトを、インターネット上に公開することを  
**デプロイ**といいます。

今回は **Cloudflare Pages** を使います。理由：
- 無料
- GitLabと連携できる（pushするだけで自動デプロイ）
- CDN（世界中のサーバーからコンテンツを配信）なので速い

## 14-2 ビルドしてみる

まずローカルでビルド（静的ファイル生成）を試します：

```bash
npm run build
```

`dist/` フォルダに HTML・CSS・JS ファイルが生成されます。  
エラーが出たら修正して再挑戦します。

```bash
# ビルド結果をプレビューする
npm run preview
```

## 14-3 astro.config.mjsを設定する

Cloudflare Pages用に設定を変更します：

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  // サイトのURL（実際のURLに変更）
  site: 'https://meg4ne.net',

  integrations: [react()],

  // Cloudflare Pages向けのビルド設定
  output: 'static', // 静的サイトとして出力

  // ビルド時の設定
  build: {
    // アセットファイルの出力先
    assets: 'assets',
  },
});
```

## 14-4 Cloudflare Pagesにデプロイする

**方法1：GitLab連携（推奨）**

1. Cloudflare ダッシュボード（https://dash.cloudflare.com）にログイン
2. 「Workers & Pages」→ 「Create」→ 「Pages」
3. 「Connect to Git」→ GitLab を選択
4. リポジトリを選択
5. ビルド設定：
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Build output directory: `dist`
6. 「Save and Deploy」

以降は GitLab に push するたびに自動でデプロイされます。

**方法2：直接アップロード（GitLab連携なしの場合）**

```bash
# Wrangler CLIをインストール
npm install -g wrangler

# ビルド
npm run build

# デプロイ
wrangler pages deploy dist --project-name meg4ne-net
```

## 14-5 カスタムドメイン（meg4ne.net）を設定する

Cloudflare Pagesのダッシュボードで：
1. 対象のプロジェクトを開く
2. 「Custom domains」→ 「Set up a custom domain」
3. `meg4ne.net` を入力
4. Cloudflare DNSを使っている場合は自動設定される

---

# 第15章 次のステップ

## 15-1 完成後にやること

**コンテンツを充実させる**
- `src/data/blogs.ts` に実際の記事を追加
- About セクションのテキストを実際の内容に変更
- Server ページのマシン情報を最新にする

**パフォーマンスを確認する**
- ブラウザの DevTools（F12）→ Lighthouse タブ → Generate report
- スコア90以上を目指す

**OGP画像を作る**
- SNSシェア時に表示される画像
- `public/og-image.png`（1200×630px）を作成
- `<meta property="og:image">` をBaseLayoutに追加

## 15-2 学習を深めるリソース

**公式ドキュメント（英語・日本語あり）**
- Astro: https://docs.astro.build/ja/
- React: https://ja.react.dev/
- TypeScript: https://www.typescriptlang.org/docs/

**CSS学習**
- MDN Web Docs（https://developer.mozilla.org/ja/）— Webの公式リファレンス

**実践的な学習法**
1. まずこの教科書のコードをそのまま動かす
2. 色を変える、テキストを変えるなど小さな変更を加える
3. 新しいセクション（例：「Links」ページ）を自分で追加してみる
4. エラーが出たら、エラーメッセージをそのまま検索する

---

## Appendix: よくあるエラーと対処法

### `Cannot find module '...'`
インポートパスが間違っている。ファイル名・拡張子を確認する。

### `Type '...' is not assignable to type '...'`
TypeScriptの型エラー。propsの型定義と渡している値の型が合っていない。

### 画面が真っ白になる
ブラウザのDevToolsのConsoleタブでエラーを確認する。

### フォントが反映されない
Googleフォントの`<link>`タグがBaseLayoutに入っているか確認する。

### `npm run dev` が動かない
```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
npm run dev
```

---

> **困ったときは**  
> エラーメッセージをそのままGoogleやClaudeに質問してみてください。  
> 「このエラーが出ました: [エラーメッセージ]」と貼るだけで大抵解決できます。  
>
> このサイトのフッターには `Built with Astro + React + TypeScript` と書いてあります。  
> それが本当になる日を楽しみにしています。がんばれ！