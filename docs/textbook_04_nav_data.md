# meg4ne.net を Astro で作る教科書
## Part 4: ナビゲーション・データ管理

---

> **全体の目次（全5パート）**
>
> 1. [Part 1: 基礎知識・環境構築・プロジェクト作成](./textbook_01_basics.md)（第1〜4章）
> 2. [Part 2: デザイントークン・レイアウト](./textbook_02_design.md)（第5〜6章）
> 3. [Part 3: ページ実装](./textbook_03_pages.md)（第7〜10章）
> 4. **Part 4（このファイル）**: ナビゲーション・データ管理（第11〜12章）
> 5. [Part 5: SEO・デプロイ・次のステップ](./textbook_05_deploy.md)（第13〜15章 + Appendix）

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

# 第13章（補足） ページを組み立てる

## 13-0 なぜここが必要か

ここまでで Nav・Hero・AboutSection・WritingPage・ServerPage などのコンポーネントを作りました。  
しかし「それをどう組み合わせてページにするか」が教科書に抜けていました。  
この補足でホームページの完成形を示します。

## 13-1 index.astroを完成させる

`src/pages/index.astro` を以下のように作成します：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.tsx';
import Hero from '../components/Hero.tsx';
import AboutSection from '../components/AboutSection.tsx';
import Footer from '../components/Footer.tsx';

// Astro.url.pathname で現在のURLパスを取得できる。
// ここでは "/" になる。Nav に渡すことでアクティブなリンクを強調表示できる。
const currentPath = Astro.url.pathname;
---

<BaseLayout title="meg4ne.net" description="megane — 3D / MoCap / Homelab / UEC">
  <!--
    client:load  → ページ読み込み時にすぐJSを送ってReactを起動する。
                   Navはハンバーガーメニューの開閉状態を持つので必要。
    client:idle  → ブラウザが暇になったときにJSを送る。
                   Heroのタイピングアニメーションは最初に動くので load が適切。
  -->
  <Nav currentPath={currentPath} client:load />

  <main>
    <!-- Hero はタイピングアニメーションがあるので client:load -->
    <Hero client:load />

    <!-- AboutSection は状態を持たないので client:* ディレクティブ不要。
         Astroがビルド時にHTMLを生成し、JSはブラウザに送られない。 -->
    <AboutSection />
  </main>

  <Footer />
</BaseLayout>
```

同様に `src/pages/server.astro`：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.tsx';
import ServerPage from '../components/ServerPage.tsx';
import Footer from '../components/Footer.tsx';

const currentPath = Astro.url.pathname;
---

<BaseLayout title="Homelab — meg4ne.net" description="自宅サーバー環境の紹介">
  <Nav currentPath={currentPath} client:load />
  <ServerPage />
  <Footer />
</BaseLayout>
```

`src/pages/writing.astro`：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.tsx';
import WritingPage from '../components/WritingPage.tsx';
import Footer from '../components/Footer.tsx';

const currentPath = Astro.url.pathname;
---

<BaseLayout title="Writing — meg4ne.net" description="ブログ記事一覧">
  <Nav currentPath={currentPath} client:load />
  <!--
    WritingPage はフィルタータブの選択状態（useState）を持つので client:load が必要。
  -->
  <WritingPage client:load />
  <Footer />
</BaseLayout>
```

## 13-2 client:* ディレクティブの使い分けまとめ

| ディレクティブ | 送るタイミング | 使いどころ |
|---|---|---|
| `client:load` | 即座（ページ読み込み時） | NavやHeroなど、最初から動く必要があるもの |
| `client:idle` | ブラウザが暇なとき | スクロール後に見えるコンテンツなど |
| `client:visible` | 画面に入ったとき | 画面外にある重いコンポーネント |
| なし（デフォルト） | JSを送らない | 静的なHTMLだけで十分なもの |

**原則**: インタラクション（`useState` など）が不要なコンポーネントにはディレクティブをつけない。  
無駄なJSを送らないことがAstroのパフォーマンスの核心です。

---

> **前のパート**: [← Part 3: ページ実装](./textbook_03_pages.md)
> **次のパート**: [Part 5: SEO・デプロイ・次のステップ →](./textbook_05_deploy.md)
