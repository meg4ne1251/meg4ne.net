# 第12章: 外部API連携（ブログアクセスパネル）

## この章で学ぶこと

- RSS フィードの仕組みと解析
- Qiita / Zenn / Note の記事集約
- Astro のビルド時データ取得
- エラーハンドリングとフォールバック

---

## 12.1 ブログアクセスパネルの設計

要件定義書では「Qiita, Note, Zenn の記事集約 (RSS/API利用)」とあります。

### 取得方法の選択

| プラットフォーム | 取得方法 | URL パターン |
|---|---|---|
| **Qiita** | RSS or API | RSS: `https://qiita.com/ユーザー名/feed` |
| **Zenn** | RSS | `https://zenn.dev/ユーザー名/feed` |
| **Note** | RSS | `https://note.com/ユーザー名/rss` |

RSS（Really Simple Syndication）は、サイトの更新情報を配信するための標準フォーマットです。API キーが不要で、パブリックに取得できます。

### RSS フィードの構造

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>megane の記事</title>
    <link>https://qiita.com/megane</link>
    <item>
      <title>Docker Composeで本番環境を構築する</title>
      <link>https://qiita.com/megane/items/abc123</link>
      <pubDate>Thu, 15 Feb 2026 00:00:00 +0900</pubDate>
      <description>記事の概要...</description>
    </item>
    <!-- 他の記事... -->
  </channel>
</rss>
```

---

## 12.2 RSS パーサーの実装

```bash
# RSS パース用のライブラリをインストール
# rss-parser は CommonJS モジュールのため、ESM プロジェクトではインポート方法に注意
pnpm add rss-parser
```

> **注意**: `rss-parser` は CommonJS（CJS）形式のパッケージです。Astro の ESM 環境では `import Parser from "rss-parser"` がそのまま動作しない場合があります。もし問題が発生した場合は、`default` プロパティ経由でアクセスするか、代替ライブラリ（`fast-xml-parser` + `fetch` での自前パース）を検討してください。

```typescript
// src/lib/fetchRSS.ts
import Parser from "rss-parser";

// ブログ記事の型定義
export interface BlogPost {
  platform: "qiita" | "zenn" | "note";
  title: string;
  url: string;
  publishedAt: Date;
  description?: string;
}

// RSS フィード設定
const FEEDS = [
  {
    platform: "qiita" as const,
    url: "https://qiita.com/あなたのユーザー名/feed",
  },
  {
    platform: "zenn" as const,
    url: "https://zenn.dev/あなたのユーザー名/feed",
  },
  {
    platform: "note" as const,
    url: "https://note.com/あなたのユーザー名/rss",
  },
];

const parser = new Parser({
  timeout: 10000,  // 10秒のタイムアウト
});

/**
 * 1つの RSS フィードからブログ記事を取得する
 */
async function fetchFeed(
  feedUrl: string,
  platform: BlogPost["platform"],
): Promise<BlogPost[]> {
  try {
    const feed = await parser.parseURL(feedUrl);

    return (feed.items || []).map((item) => ({
      platform,
      title: item.title || "無題",
      url: item.link || "",
      publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
      description: item.contentSnippet?.slice(0, 150),  // 最初の150文字
    }));
  } catch (error) {
    // フィード取得に失敗しても他のフィードに影響させない
    console.warn(`[RSS] ${platform} の取得に失敗: ${error}`);
    return [];
  }
}

/**
 * 全プラットフォームの記事を取得し、日付順にソートして返す
 */
export async function fetchAllBlogPosts(limit: number = 20): Promise<BlogPost[]> {
  // 全フィードを並行して取得（Promise.all）
  const results = await Promise.all(
    FEEDS.map((feed) => fetchFeed(feed.url, feed.platform)),
  );

  // 全記事をフラットに結合して日付の降順にソート
  const allPosts = results
    .flat()
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);  // 最大件数で制限

  return allPosts;
}
```

### `Promise.all` の解説

```typescript
// 逐次実行（遅い: 合計9秒）
const qiita = await fetchFeed(qiitaUrl);  // 3秒
const zenn = await fetchFeed(zennUrl);     // 3秒
const note = await fetchFeed(noteUrl);     // 3秒

// 並行実行（速い: 最大3秒）
const [qiita, zenn, note] = await Promise.all([
  fetchFeed(qiitaUrl),   // ─┐
  fetchFeed(zennUrl),    // ─┤ 同時に実行
  fetchFeed(noteUrl),    // ─┘
]);
```

---

## 12.3 Astro でのビルド時データ取得

Astro のフロントマターは**ビルド時に実行される**ので、RSS の取得もビルド時に行われます。

```astro
---
// src/pages/index.astro（トップページにブログパネルを表示する場合）
import Layout from "../layouts/Layout.astro";
import BlogPanel from "../components/blog/BlogPanel.astro";
import { fetchAllBlogPosts } from "../lib/fetchRSS";

// ビルド時に RSS を取得（本番ではビルドのたびに最新を取得）
const blogPosts = await fetchAllBlogPosts(10);
---

<Layout title="ホーム">
  <!-- 他のセクション -->

  <section>
    <h2>最近の記事</h2>
    <BlogPanel posts={blogPosts} />
  </section>
</Layout>
```

### BlogPanel コンポーネント

```astro
---
// src/components/blog/BlogPanel.astro
import type { BlogPost } from "../../lib/fetchRSS";

interface Props {
  posts: BlogPost[];
}

const { posts } = Astro.props;

// プラットフォームごとのラベルと色
const platformConfig: Record<string, { label: string; color: string }> = {
  qiita: { label: "Qiita", color: "#55c500" },
  zenn: { label: "Zenn", color: "#3ea8ff" },
  note: { label: "note", color: "#41c9b4" },
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
---

<div class="blog-panel">
  {posts.length === 0 ? (
    <p class="no-posts">記事がありません</p>
  ) : (
    <ul class="post-list">
      {posts.map((post) => {
        const config = platformConfig[post.platform];
        return (
          <li class="post-item">
            <a href={post.url} target="_blank" rel="noopener noreferrer" class="post-link">
              <span
                class="platform-badge"
                style={`--platform-color: ${config.color}`}
              >
                {config.label}
              </span>
              <div class="post-info">
                <span class="post-title">{post.title}</span>
                <time datetime={post.publishedAt.toISOString()} class="post-date">
                  {formatDate(post.publishedAt)}
                </time>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  )}
</div>

<style>
  .post-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .post-item {
    border-bottom: 1px solid var(--color-border);
  }

  .post-item:last-child {
    border-bottom: none;
  }

  .post-link {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    text-decoration: none;
    transition: opacity var(--transition-fast);
  }

  .post-link:hover {
    opacity: 0.8;
  }

  .platform-badge {
    flex-shrink: 0;
    padding: 0.2rem 0.5rem;
    border: 1px solid var(--platform-color);
    border-radius: var(--radius-sm);
    color: var(--platform-color);
    font-size: 0.75rem;
    font-weight: bold;
    min-width: 50px;
    text-align: center;
  }

  .post-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    min-width: 0;  /* テキストの省略表示のために必要 */
  }

  .post-title {
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .post-date {
    flex-shrink: 0;
    color: var(--color-text-muted);
    font-size: 0.85rem;
    font-family: var(--font-mono);
    margin-left: var(--space-md);
  }
</style>
```

---

## 12.4 データ更新のタイミング

静的ビルド（`output: "static"`）の場合、RSS データは**ビルド時に1回だけ取得**されます。

```
記事を投稿 → すぐにはサイトに反映されない
          → main ブランチにマージ（何かの変更で）→ 再ビルド → 反映

解決策:
1. GitHub Actions で定期的に再ビルド（cron トリガー）
2. 手動で再ビルド
3. hybrid モードにして RSS 取得部分だけ SSR にする
```

### GitHub Actions での定期ビルド

```yaml
# .github/workflows/scheduled-build.yml
name: Scheduled Rebuild

on:
  schedule:
    # 毎日午前6時（JST）に再ビルド
    - cron: "0 21 * * *"  # UTC 21:00 = JST 06:00

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ... 通常のビルド・デプロイ処理
```

---

## 12.5 この章のまとめ

### 重要なポイント

1. **RSS フィードで API キー不要の記事取得** → セキュリティリスクなし
2. **`Promise.all` で並行取得** → パフォーマンス向上
3. **ビルド時にデータ取得（SSG）** → リクエストのたびの外部通信なし
4. **エラーハンドリング** → 1つのフィードが失敗しても他に影響しない
5. **定期再ビルドで鮮度を保つ** → cron トリガーの GitHub Actions

---

次の章: [第13章: BFF アーキテクチャと API 設計](./13-bff-api.md)
