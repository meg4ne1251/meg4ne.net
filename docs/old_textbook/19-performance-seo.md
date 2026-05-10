# 第19章: パフォーマンスと SEO

## この章で学ぶこと

- Lighthouse スコアの測定と改善
- Core Web Vitals の理解
- SEO 対策のマークアップ
- OGP（Open Graph Protocol）設定
- レスポンシブデザインの検証

---

## 19.1 パフォーマンス目標

要件定義書の記載:
> Lighthouseスコアで **90点以上** を目標とする。

### Lighthouse の 4 カテゴリ

| カテゴリ | 内容 | 目標 |
|---|---|---|
| **Performance** | 表示速度 | 90+ |
| **Accessibility** | アクセシビリティ | 90+ |
| **Best Practices** | Web 標準の遵守 | 90+ |
| **SEO** | 検索エンジン対策 | 90+ |

### Lighthouse の実行方法

```
方法1: Chrome DevTools
  → F12 → Lighthouse タブ → Analyze page load

方法2: コマンドライン
  npx lighthouse https://meg4ne.net --output html --output-path report.html

方法3: PageSpeed Insights
  → https://pagespeed.web.dev/ にURLを入力
```

---

## 19.2 Core Web Vitals

Google が定義する「ユーザー体験の品質指標」です。検索順位にも影響します。

### 3つの指標

| 指標 | 意味 | 目標値 |
|---|---|---|
| **LCP** (Largest Contentful Paint) | 最大要素の表示完了時間 | 2.5秒以内 |
| **INP** (Interaction to Next Paint) | 操作への応答速度 | 200ms以内 |
| **CLS** (Cumulative Layout Shift) | レイアウトのずれ | 0.1以下 |

### LCP を改善するには

```
LCP = ページの「最大の要素」が表示されるまでの時間

改善策:
1. 画像の最適化（WebP, 適切なサイズ）
2. フォントの事前読み込み（preload）
3. CSS の最小化（不要なCSSを削除）
4. サーバーのレスポンス速度改善
```

```html
<!-- フォントの事前読み込み -->
<link
  rel="preload"
  href="/fonts/JetBrainsMono-Regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

### CLS を防ぐには

```html
<!-- ❌ 画像サイズ未指定 → 読み込み後にレイアウトがずれる -->
<img src="/photo.webp" alt="写真" />

<!-- ✅ サイズを明示 → ブラウザが事前にスペースを確保 -->
<img src="/photo.webp" alt="写真" width="800" height="600" />

<!-- ✅ Astro の Image コンポーネントは自動でサイズ指定 -->
<Image src={photo} alt="写真" />
```

---

## 19.3 パフォーマンス最適化チェックリスト

### 画像

- [x] Astro `<Image>` コンポーネントで WebP 変換
- [x] 適切な `width` / `height` 指定（CLS 防止）
- [x] `loading="lazy"` でオフスクリーン画像の遅延読み込み
- [x] ファーストビュー画像は `loading="eager"` で即時読み込み

### JavaScript

- [x] `client:visible` で必要になるまで JS を読み込まない
- [x] 3D ビューワーは Lazy Load（クリックで読み込み）
- [x] 不要な依存パッケージを含めない

### CSS

- [x] CSS Custom Properties（CSS 変数）でテーマを管理
- [x] 未使用の CSS を削除
- [x] critical CSS のインライン化（Astro が自動対応）

### フォント

```html
<!-- Web フォントの最適化 -->
<link
  rel="preload"
  href="/fonts/JetBrainsMono-Regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<!-- font-display: swap でフォント未読込時もテキスト表示 -->
<style>
  @font-face {
    font-family: "JetBrains Mono";
    src: url("/fonts/JetBrainsMono-Regular.woff2") format("woff2");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
</style>
```

**`font-display: swap`** は「フォントが読み込まれるまでシステムフォントで表示する」設定です。テキストが見えない時間（FOIT: Flash of Invisible Text）を防ぎます。

---

## 19.4 SEO 対策

### 基本的な HTML マークアップ

```astro
---
// src/layouts/Layout.astro（SEO 関連のヘッダー）
interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  type?: "website" | "article";
}

const {
  title,
  description = "megane のポートフォリオサイト。サーバー構築、Web開発、3D制作の活動記録。",
  ogImage = "/images/og-default.png",
  canonicalUrl,
  type = "website",
} = Astro.props;

const siteTitle = `${title} | meg4ne.net`;
const url = canonicalUrl || Astro.url.href;
const fullOgImage = new URL(ogImage, Astro.site).toString();
---

<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- 基本的な SEO タグ -->
  <title>{siteTitle}</title>
  <meta name="description" content={description} />

  <!-- Canonical URL（重複コンテンツ対策） -->
  <link rel="canonical" href={url} />

  <!-- OGP（Open Graph Protocol） -->
  <meta property="og:type" content={type} />
  <meta property="og:title" content={siteTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={fullOgImage} />
  <meta property="og:site_name" content="meg4ne.net" />
  <meta property="og:locale" content="ja_JP" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={siteTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={fullOgImage} />

  <!-- ファビコン -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

  <!-- サイトマップ -->
  <link rel="sitemap" href="/sitemap-index.xml" />
</head>
<body>
  <slot />
</body>
</html>
```

### 各メタタグの役割

**`<title>`**
```
検索結果に表示されるタイトル。最も重要なSEO要素。
32文字以内が推奨。
```

**`<meta name="description">`**
```
検索結果のタイトル下に表示される説明文。
120文字以内が推奨。
```

**Canonical URL**
```
同じコンテンツが複数のURLで表示される場合、
「正式なURL」を検索エンジンに伝える。
例: http://meg4ne.net と https://meg4ne.net が同じ内容 → canonical で統一
```

**OGP**
```
SNS でリンクを共有した時に表示されるカード情報。
・og:title → カードのタイトル
・og:description → カードの説明
・og:image → カードの画像（1200x630px推奨）
```

### OGP 画像の作成

```
推奨サイズ: 1200 x 630 ピクセル
形式: PNG（テキストあり）or WebP
配置: public/images/og-default.png

ページごとに異なる OGP 画像を設定可能:
  <Layout title="ブログ記事" ogImage="/images/blog-og.png">
```

---

## 19.5 サイトマップの生成

Astro にはサイトマップ生成の公式インテグレーションがあります。

```bash
pnpm add @astrojs/sitemap
```

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://meg4ne.net",    // ← 必須: サイトのURL
  integrations: [
    react(),
    sitemap(),
  ],
});
```

ビルド後に `dist/sitemap-index.xml` が自動生成されます。これにより検索エンジンがサイト構造を効率的にクロールできます。

---

## 19.6 robots.txt

```
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://meg4ne.net/sitemap-index.xml
```

**`robots.txt` の役割:**
- 検索エンジンのクローラーに「どのページを見ていいか」を指示
- `Allow: /` は「全ページクロール OK」
- `Sitemap:` でサイトマップの場所を通知

---

## 19.7 構造化データ（JSON-LD）

検索エンジンにコンテンツの意味を伝えるための追加情報です。

```astro
---
// src/layouts/Layout.astro に追加
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "meg4ne.net",
  "url": "https://meg4ne.net",
  "description": description,
  "author": {
    "@type": "Person",
    "name": "megane",
  },
};
---

<!-- <head> 内に追加 -->
<script type="application/ld+json" set:html={JSON.stringify(structuredData)} />
```

ブログ記事用:

```astro
---
// ブログ詳細ページ
const articleData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.data.title,
  "datePublished": post.data.publishedAt.toISOString(),
  "author": {
    "@type": "Person",
    "name": "megane",
  },
  "description": post.data.description,
};
---
```

---

## 19.8 レスポンシブデザインの検証

要件定義書の記載:
> 必須要件。ただし、PC画面のデザイン・実装を優先する。
> モバイルファーストでなくとも良いが、スマホでも閲覧可能にする。

### ブレークポイントの確認

第7章で設定したブレークポイント:

```css
/* モバイル: 〜768px */
@media (max-width: 768px) {
  /* ナビゲーションの調整 */
  /* グリッドを1カラムに */
}

/* タブレット: 769px〜1024px */
@media (max-width: 1024px) {
  /* サイドバーの折りたたみなど */
}
```

### 検証のチェックポイント

| 要素 | PC | タブレット | スマホ |
|---|---|---|---|
| ナビゲーション | 横並び | 横並び | ハンバーガー |
| VM カード | 3列グリッド | 2列 | 1列 |
| ギャラリー | 4列 | 3列 | 2列 |
| テキスト | 16px | 16px | 16px（変えない） |

### 検証ツール

```
1. Chrome DevTools のデバイスツールバー
   → F12 → Toggle device toolbar (Ctrl+Shift+M)

2. 実デバイスでのテスト
   → 開発サーバー起動時に --host オプション
   pnpm dev --host
   → スマホから http://PCのIPアドレス:4321 でアクセス
```

---

## 19.9 ブラウザ互換性

要件定義書の記載:
> 主要なモダンブラウザ (Chrome, Firefox, Safari, Edge) での動作を保証する。

### 確認すべきポイント

1. **CSS Custom Properties** → 全モダンブラウザ対応済み
2. **CSS Grid / Flexbox** → 全モダンブラウザ対応済み
3. **WebP 画像** → 全モダンブラウザ対応済み
4. **`<dialog>` 要素** → Safari 15.4+ で対応（使う場合は確認）
5. **WebSocket** → 全モダンブラウザ対応済み

### Can I Use で確認

特定の CSS/JS 機能が各ブラウザでサポートされているか:
→ https://caniuse.com/

---

## 19.10 本番前チェックリスト

```
[ ] Lighthouse 全カテゴリ 90+ を達成
[ ] 全ページに title と description が設定されている
[ ] OGP 画像（1200x630px）が全ページに設定されている
[ ] Canonical URL が正しく設定されている
[ ] sitemap.xml が生成されている
[ ] robots.txt が配置されている
[ ] 全画像に alt テキストが設定されている
[ ] 全画像に width/height が指定されている
[ ] font-display: swap が設定されている
[ ] Chrome, Firefox, Safari, Edge で表示崩れがない
[ ] スマホで閲覧可能
[ ] 404 ページが適切に表示される
[ ] プライバシーポリシーページが存在する
[ ] フッターにプライバシーポリシーリンクがある
```

---

## 19.11 この章のまとめ

### パフォーマンスの 3 本柱

1. **画像最適化** → WebP, lazy loading, サイズ指定
2. **JavaScript 最小化** → `client:visible`, Code Splitting
3. **キャッシュ活用** → ハッシュ付きアセット, CDN

### SEO の 3 本柱

1. **メタデータ** → title, description, OGP
2. **構造化データ** → JSON-LD
3. **技術的SEO** → サイトマップ, robots.txt, canonical

### Astro が自動で最適化してくれること

- HTML の最小化
- CSS のスコープ化とインライン化
- 画像の自動最適化（`<Image>` 使用時）
- 不要な JavaScript の排除（Islands Architecture）
- サイトマップの自動生成（プラグイン使用時）

---

次の章: [第20章: セキュリティとベストプラクティス](./20-security.md)
