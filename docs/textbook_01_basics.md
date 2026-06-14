# meg4ne.net を Astro で作る教科書
## Part 1: 基礎知識・環境構築・プロジェクト作成

---

> **この教科書の目標**
> デザインプロトタイプ（`meg4ne_net_Mobile_standalone.html`）と同じ見た目・構成のサイトを、  
> Astro + React + TypeScript で、ベストプラクティスに従って作る。
>
> **前提知識**: ターミナルを開いたことがある、ファイルを作ったり編集したりできる。  
> それだけで大丈夫です。

---

## 全体の目次（全5パート）

1. **Part 1（このファイル）**: 基礎知識・環境構築・プロジェクト作成（第1〜4章）
2. [Part 2: デザイントークン・レイアウト](./textbook_02_design.md)（第5〜6章）
3. [Part 3: ページ実装](./textbook_03_pages.md)（第7〜10章）
4. [Part 4: ナビゲーション・データ管理](./textbook_04_nav_data.md)（第11〜12章）
5. [Part 5: SEO・デプロイ・次のステップ](./textbook_05_deploy.md)（第13〜15章 + Appendix）

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

> **次のパート**: [Part 2: デザイントークン・レイアウト →](./textbook_02_design.md)
