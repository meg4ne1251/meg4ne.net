# 第10章: 画像最適化とギャラリー

## この章で学ぶこと

- なぜ画像最適化が重要なのか
- Astro Image コンポーネントの使い方
- WebP 形式への自動変換
- ギャラリーページ（グリッドレイアウト）の実装
- レスポンシブ画像の配信

---

## 10.1 なぜ画像最適化が必要なのか

Web ページの転送量の多くを画像が占めます。最適化しないと：

- **表示が遅い** → Lighthouse スコアが下がる（CLS, LCP）
- **通信量が大きい** → モバイルユーザーのデータ通信量を浪費
- **サーバー負荷が高い** → 帯域幅のコスト

### 最適化でやること

| 最適化 | 説明 | 効果 |
|---|---|---|
| **フォーマット変換** | JPEG/PNG → WebP | ファイルサイズ 25-35% 削減 |
| **リサイズ** | 表示サイズに合わせて縮小 | 不要な大きさのデータを送らない |
| **Lazy Loading** | 画面外の画像は遅延読み込み | 初期ロード時間の短縮 |
| **width/height 指定** | CLS（レイアウトシフト）の防止 | UXの向上 |

---

## 10.2 Astro Image コンポーネント

Astro にはビルド時に画像を自動最適化する機能が組み込まれています。

### `<Image>` コンポーネントの基本

```astro
---
// src 配下の画像はインポートして使う（最適化の対象になる）
import { Image } from "astro:assets";
import serverPhoto from "../assets/images/server-rack.jpg";
---

<!-- 自動で WebP に変換、リサイズ、width/height 属性の付与が行われる -->
<Image src={serverPhoto} alt="自宅サーバーラック" />

<!-- サイズを指定することもできる -->
<Image src={serverPhoto} alt="自宅サーバーラック" width={800} height={600} />
```

### src/ vs public/ の画像配置の違い

```
src/assets/images/        ← Astro が最適化する画像（推奨）
├── server-rack.jpg       → ビルド時に WebP 変換 + リサイズ
└── profile.png           → ビルド時に最適化

public/assets/images/     ← そのままコピーされる画像（最適化されない）
├── blog/article/img.png  → Markdown から参照する画像
└── og-default.png        → OGP 画像
```

| 配置場所 | 最適化 | 使い分け |
|---|---|---|
| `src/assets/` | ✅ 自動最適化 | コンポーネントで `<Image>` として使う画像 |
| `public/assets/` | ❌ そのまま | Markdown 内の画像、OGP、ファビコンなど |

### なぜ `src/` に入れると最適化されるのか

`src/` 配下のファイルは Astro のビルドパイプラインを通過します。`import` 文で読み込むと、Astro が画像のメタデータ（幅、高さ）を取得し、最適なフォーマットとサイズに変換した上で `dist/` に出力します。`public/` 配下のファイルはビルドパイプラインを通らず、そのままコピーされるだけです。

---

## 10.3 ギャラリーページの実装

要件定義書に「撮影した写真を掲載するページ。グリッドレイアウト等で見やすく表示する」とあります。

### 画像データの定義

```typescript
// src/data/gallery.ts

export interface GalleryImage {
  src: string;           // 画像パス
  alt: string;           // 代替テキスト
  title?: string;        // キャプション
  category?: string;     // カテゴリ（フィルタ用）
  date?: string;         // 撮影日
}

export const galleryImages: GalleryImage[] = [
  {
    src: "/assets/images/gallery/sunset.webp",
    alt: "夕焼けの風景",
    title: "キャンパスからの夕焼け",
    category: "landscape",
    date: "2025-12",
  },
  {
    src: "/assets/images/gallery/server-rack.webp",
    alt: "自宅サーバーラック",
    title: "ラックを整理した後",
    category: "server",
    date: "2026-01",
  },
  // 他の画像...
];
```

### ギャラリーページ

```astro
---
// src/pages/activities/gallery.astro
import Layout from "../../layouts/Layout.astro";
import Breadcrumb from "../../components/common/Breadcrumb.astro";
import { galleryImages } from "../../data/gallery";
---

<Layout title="ギャラリー" description="撮影した写真のギャラリー">
  <Breadcrumb items={[
    { label: "Activities", href: "/activities" },
    { label: "Gallery" },
  ]} />

  <h1>ギャラリー</h1>

  <div class="gallery-grid">
    {galleryImages.map((image, index) => (
      <figure class="gallery-item">
        <img
          src={image.src}
          alt={image.alt}
          loading={index < 6 ? "eager" : "lazy"}
          decoding="async"
          width="400"
          height="300"
        />
        {image.title && (
          <figcaption>{image.title}</figcaption>
        )}
      </figure>
    ))}
  </div>
</Layout>

<style>
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-md);
    margin-top: var(--space-xl);
  }

  .gallery-item {
    margin: 0;
    overflow: hidden;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: var(--color-bg-card);
    transition: transform var(--transition-fast);
  }

  .gallery-item:hover {
    transform: scale(1.02);
  }

  .gallery-item img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    display: block;
  }

  figcaption {
    padding: var(--space-sm) var(--space-md);
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    .gallery-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

### loading 属性の解説

```html
<!-- eager: すぐに読み込む（画面上部の画像） -->
<img src="hero.webp" loading="eager" />

<!-- lazy: ビューポート付近に来たら読み込む（画面下部の画像） -->
<img src="photo.webp" loading="lazy" />
```

**方針**: 最初の6枚は `eager`（ファーストビューに表示される可能性が高い）、それ以降は `lazy` にすることで LCP（Largest Contentful Paint）を損なわずにデータ転送量を抑えます。

### `object-fit: cover` の解説

```
object-fit: cover
├── 画像を指定サイズの枠に収める
├── 比率を維持したまま拡大/縮小
├── 枠からはみ出す部分はトリミング
└── グリッドレイアウトで全画像のサイズを揃えるのに最適

object-fit: contain
├── 画像全体を枠内に収める
├── 余白が生まれることがある
└── 画像全体を見せたい時に使う
```

---

## 10.4 画像をデプロイ前に手動で最適化する方法

`public/` に置く画像（Markdown から参照するものなど）は Astro が自動最適化しないため、事前に最適化しておくと良いです。

```bash
# cwebp コマンドで WebP に変換（libwebp パッケージ）
sudo apt install webp  # Ubuntu/Debian
# または
brew install webp      # macOS

# JPEG → WebP に変換（品質80%）
cwebp -q 80 input.jpg -o output.webp

# 一括変換（public/assets/images/ 内の全 JPEG を WebP に変換）
find public/assets/images -name "*.jpg" -exec sh -c \
  'cwebp -q 80 "$1" -o "${1%.jpg}.webp"' _ {} \;
```

> **WebP 形式の利点**: JPEG と同等の画質で 25-35% 小さいファイルサイズ。2024年時点で全モダンブラウザがサポート済み。

---

## 10.5 この章のまとめ

### 重要なポイント

1. **`src/assets/` の画像は `<Image>` で自動最適化** → WebP 変換、リサイズ
2. **`public/assets/` の画像は手動で最適化** → cwebp コマンドなど
3. **`loading="lazy"` でファーストビュー外の画像を遅延読み込み**
4. **`width` と `height` を指定して CLS を防止**
5. **`object-fit: cover` でグリッドを美しく整列**

---

次の章: [第11章: 3Dモデルビューワー](./11-3d-viewer.md)
