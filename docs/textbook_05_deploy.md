# meg4ne.net を Astro で作る教科書
## Part 5: SEO・デプロイ・次のステップ

---

> **全体の目次（全5パート）**
>
> 1. [Part 1: 基礎知識・環境構築・プロジェクト作成](./textbook_01_basics.md)（第1〜4章）
> 2. [Part 2: デザイントークン・レイアウト](./textbook_02_design.md)（第5〜6章）
> 3. [Part 3: ページ実装](./textbook_03_pages.md)（第7〜10章）
> 4. [Part 4: ナビゲーション・データ管理](./textbook_04_nav_data.md)（第11〜12章）
> 5. **Part 5（このファイル）**: SEO・デプロイ・次のステップ（第13〜15章 + Appendix）

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
---

> **前のパート**: [← Part 4: ナビゲーション・データ管理](./textbook_04_nav_data.md)
