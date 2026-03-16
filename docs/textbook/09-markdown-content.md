# 第9章: Markdown コンテンツ管理

## この章で学ぶこと

- Astro Content Collections の仕組み
- 運用記（Operation Log）のスキーマ定義
- Markdown ファイルの書き方とフロントマター
- 記事一覧ページと個別記事ページの実装
- 執筆ワークフロー（PR ベース）

---

## 9.1 Content Collections とは

Astro の **Content Collections** は、Markdown や MDX（Markdown + JSX）ファイルを**型安全に管理**する仕組みです。

### なぜ Content Collections を使うのか

```
❌ 普通のファイル読み込み
- フロントマター（メタデータ）の形式が統一されない
- 必須項目が抜けていても気づかない
- タイプミスが実行時まで発見できない

✅ Content Collections
- スキーマ（Zod）で型を定義 → バリデーション付き
- TypeScript の型補完が効く
- ビルド時にエラーを検出
```

---

## 9.2 スキーマの定義

```typescript
// src/content/config.ts（Content Collections の設定ファイル、このパスは固定）

import { defineCollection, z } from "astro:content";

// 運用記（Operation Log）のコレクション定義
const blogCollection = defineCollection({
  type: "content",  // Markdown コンテンツ
  schema: z.object({
    // --- 必須フィールド ---
    title: z.string(),                        // 記事タイトル
    publishedAt: z.coerce.date(),             // 公開日（文字列 → Date に自動変換）
    description: z.string().max(200),         // 説明文（200文字以内）

    // --- オプショナルフィールド ---
    updatedAt: z.coerce.date().optional(),    // 更新日
    tags: z.array(z.string()).default([]),     // タグ
    draft: z.boolean().default(false),        // 下書きフラグ

    // --- 画像 ---
    heroImage: z.string().optional(),         // アイキャッチ画像パス
  }),
});

// 全コレクションをエクスポート
export const collections = {
  blog: blogCollection,
};
```

### Zod とは

Zod は「スキーマバリデーション」ライブラリです。データの形を定義し、実行時にバリデーション（検証）を行います。Astro に組み込まれているため、別途インストールは不要です。

```typescript
// Zod のバリデーション例
const schema = z.object({
  title: z.string(),           // 文字列（必須）
  count: z.number().min(0),    // 0以上の数値
  tags: z.array(z.string()),   // 文字列の配列
  email: z.string().email(),   // メールアドレス形式
});

// バリデーション
schema.parse({ title: "Hello", count: 5, tags: ["web"], email: "a@b.com" });  // ✅ OK
schema.parse({ title: 123 });  // ❌ エラー（title は string であるべき）
```

---

## 9.3 Markdown ファイルの作成

### フロントマター

Markdown ファイルの先頭にある `---` で囲まれた部分が**フロントマター**です。記事のメタデータを YAML 形式で記述します。

```markdown
---
title: "Proxmox VE 8.2 にアップグレードした"
publishedAt: 2026-02-15
description: "Proxmox VE を 8.1 から 8.2 にアップグレードした際の手順と注意点。"
tags: ["proxmox", "server", "upgrade"]
draft: false
heroImage: "/assets/images/blog/proxmox-upgrade.png"
---

## 動機

Proxmox VE 8.2 がリリースされたので、テスト環境で検証した後に本番環境もアップグレードすることにした。

## 事前準備

### バックアップ

PBS（Proxmox Backup Server）で全 VM のバックアップを取得した。

```bash
# PBS のバックアップ状態を確認
pvesh get /nodes/kaga/storage/pbs/content
```

### アップグレード手順

1. パッケージリストの更新
2. フルアップグレードの実行
3. 再起動
4. 動作確認

## 結果

問題なくアップグレード完了。起動時間は約3分。

## 学んだこと

- アップグレード前に必ず PBS バックアップを取ること
- テスト環境で先に検証すること
```

### ファイルの配置

```
src/content/blog/
├── proxmox-upgrade.md      →  /blog/proxmox-upgrade
├── network-redesign.md     →  /blog/network-redesign
├── docker-migration.md     →  /blog/docker-migration
└── first-post.md           →  /blog/first-post
```

ファイル名（拡張子を除く）がそのまま URL の**スラッグ**になります。

> **Astro v5 での変更**: Astro v4 以前では `post.slug` でスラッグを取得していましたが、v5 以降では `post.id` を使います。本教科書では v5 の記法を使用しています。

---

## 9.4 記事一覧ページの実装

```astro
---
// src/pages/blog/index.astro
import Layout from "../../layouts/Layout.astro";
import Breadcrumb from "../../components/common/Breadcrumb.astro";
import { getCollection } from "astro:content";

// blog コレクションから全記事を取得
const allPosts = await getCollection("blog", ({ data }) => {
  // 下書き記事をフィルタリング
  // 本番ビルド時は draft: true の記事を除外
  // 開発中は全記事を表示
  return import.meta.env.PROD ? !data.draft : true;
});

// 公開日の降順（新しい順）でソート
const sortedPosts = allPosts.sort(
  (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
);

// 日付フォーマット関数
function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
---

<Layout title="運用記" description="サーバー運用に関する記録">
  <Breadcrumb items={[{ label: "Blog" }]} />

  <h1>運用記</h1>
  <p>サーバー運用に関する記録です。</p>

  <div class="post-list">
    {sortedPosts.map((post) => (
      <article class="post-card">
        <a href={`/blog/${post.id}`} class="post-link">
          <time datetime={post.data.publishedAt.toISOString()} class="post-date">
            {formatDate(post.data.publishedAt)}
          </time>
          <h2 class="post-title">{post.data.title}</h2>
          <p class="post-description">{post.data.description}</p>
          {post.data.tags.length > 0 && (
            <div class="post-tags">
              {post.data.tags.map((tag) => (
                <span class="tag">#{tag}</span>
              ))}
            </div>
          )}
        </a>
      </article>
    ))}
  </div>

  {sortedPosts.length === 0 && (
    <p class="no-posts">まだ記事がありません。</p>
  )}
</Layout>

<style>
  .post-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-top: var(--space-xl);
  }

  .post-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition: border-color var(--transition-fast);
  }

  .post-card:hover {
    border-color: var(--color-primary);
  }

  .post-link {
    display: block;
    padding: var(--space-lg);
    text-decoration: none;
  }

  .post-date {
    color: var(--color-text-muted);
    font-size: 0.85rem;
    font-family: var(--font-mono);
  }

  .post-title {
    margin: var(--space-sm) 0;
    color: var(--color-text-heading);
    font-size: 1.2rem;
  }

  .post-description {
    color: var(--color-text-muted);
    font-size: 0.9rem;
    margin: 0;
  }

  .post-tags {
    display: flex;
    gap: var(--space-sm);
    margin-top: var(--space-sm);
  }

  .tag {
    color: var(--color-primary);
    font-size: 0.8rem;
  }
</style>
```

---

## 9.5 個別記事ページの実装

```astro
---
// src/pages/blog/[slug].astro
// [slug] は動的ルーティング → ファイル名から自動決定

import Layout from "../../layouts/Layout.astro";
import Breadcrumb from "../../components/common/Breadcrumb.astro";
import { getCollection } from "astro:content";

// 全ての記事パスを事前生成（静的ビルドに必要）
export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

// Props から記事データを受け取る
const { post } = Astro.props;

// Markdown を HTML にレンダリング
const { Content } = await post.render();

function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
---

<Layout title={post.data.title} description={post.data.description}>
  <Breadcrumb items={[
    { label: "Blog", href: "/blog" },
    { label: post.data.title },
  ]} />

  <article class="blog-post">
    <header class="post-header">
      <time datetime={post.data.publishedAt.toISOString()}>
        {formatDate(post.data.publishedAt)}
      </time>
      {post.data.updatedAt && (
        <span class="updated">
          (更新: {formatDate(post.data.updatedAt)})
        </span>
      )}
      <h1>{post.data.title}</h1>
      {post.data.tags.length > 0 && (
        <div class="tags">
          {post.data.tags.map((tag) => (
            <span class="tag">#{tag}</span>
          ))}
        </div>
      )}
    </header>

    <!-- Markdown の内容がここにレンダリングされる -->
    <div class="post-content">
      <Content />
    </div>
  </article>
</Layout>

<style>
  .blog-post {
    max-width: 750px;
  }

  .post-header {
    margin-bottom: var(--space-2xl);
    padding-bottom: var(--space-lg);
    border-bottom: 1px solid var(--color-border);
  }

  .post-header time {
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    font-size: 0.9rem;
  }

  .updated {
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  .post-header h1 {
    margin-top: var(--space-sm);
    font-size: 1.8rem;
  }

  .tags {
    display: flex;
    gap: var(--space-sm);
    margin-top: var(--space-sm);
  }

  .tag {
    color: var(--color-primary);
    font-size: 0.85rem;
  }

  /* Markdown コンテンツのスタイル */
  .post-content :global(h2) {
    margin-top: var(--space-2xl);
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--color-border);
  }

  .post-content :global(h3) {
    margin-top: var(--space-xl);
  }

  .post-content :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .post-content :global(pre) {
    margin: var(--space-lg) 0;
  }

  .post-content :global(blockquote) {
    border-left: 3px solid var(--color-primary);
    padding-left: var(--space-md);
    color: var(--color-text-muted);
    margin: var(--space-lg) 0;
  }
</style>
```

### `:global()` セレクタ

```css
/* Astro のスコープドスタイルは、自分のコンポーネント内の要素にしか適用されない */
/* しかし <Content /> でレンダリングされた Markdown の HTML は「子コンポーネント」扱い */
/* そのため :global() で「スコープの外側」にスタイルを適用する必要がある */

.post-content :global(h2) {
  /* post-content クラスの中にある h2 要素（Content が生成したもの）に適用 */
}
```

---

## 9.6 執筆ワークフロー

要件定義書に記載された執筆ワークフローを実践します：

```
1. ローカルで Markdown ファイルを作成
   └── src/content/blog/new-article.md

2. 画像ファイルを配置
   └── public/assets/images/blog/new-article/

3. 開発サーバーで確認
   └── pnpm dev → http://localhost:4321/blog/new-article

4. Git にコミット
   └── git add . && git commit -m "blog: サーバー移行の記録"

5. Pull Request を作成
   └── git push origin feature/blog-new-article
   └── GitHub で PR を作成

6. main ブランチにマージ
   └── GitHub Actions が走り、自動デプロイ
```

### 画像の管理

```markdown
---
title: "サーバールームの整理"
heroImage: "/assets/images/blog/server-room/hero.webp"
---

## Before

![整理前のラック](/assets/images/blog/server-room/before.webp)

## After

![整理後のラック](/assets/images/blog/server-room/after.webp)
```

画像は `public/assets/images/blog/記事スラッグ/` に配置するルールを作ると管理しやすくなります。

---

## 9.7 この章のまとめと確認項目

### 理解度チェック

1. Content Collections の `config.ts` はどこに置く？
   → `src/content/config.ts`（固定パス）

2. `z.coerce.date()` は何をする？
   → フロントマターの文字列（"2026-02-15"）を JavaScript の `Date` オブジェクトに自動変換

3. `getStaticPaths()` が必要な理由は？
   → 静的ビルドで「どの URL のページを生成するか」を事前に伝えるため

4. `:global()` セレクタはなぜ必要？
   → `<Content />` が生成する HTML は Astro のスコープ外なので、スコープを超えてスタイルを適用するため

5. `import.meta.env.PROD` は何を返す？
   → 本番ビルド時は `true`、開発時は `false`

### 実装チェックリスト

- [ ] `src/content/config.ts` にスキーマが定義されている
- [ ] テスト記事が最低1つある
- [ ] `/blog` で記事一覧が表示される
- [ ] `/blog/記事名` で個別記事が表示される
- [ ] 下書き記事が本番ビルドで除外される
- [ ] 画像が正しく表示される

---

次の章: [第10章: 画像最適化とギャラリー](./10-image-gallery.md)
