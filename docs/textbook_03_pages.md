# meg4ne.net を Astro で作る教科書
## Part 3: ページ実装（Hero・About・Server・Writing）

---

> **全体の目次（全5パート）**
>
> 1. [Part 1: 基礎知識・環境構築・プロジェクト作成](./textbook_01_basics.md)（第1〜4章）
> 2. [Part 2: デザイントークン・レイアウト](./textbook_02_design.md)（第5〜6章）
> 3. **Part 3（このファイル）**: ページ実装（第7〜10章）
> 4. [Part 4: ナビゲーション・データ管理](./textbook_04_nav_data.md)（第11〜12章）
> 5. [Part 5: SEO・デプロイ・次のステップ](./textbook_05_deploy.md)（第13〜15章 + Appendix）

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

> **前のパート**: [← Part 2: デザイントークン・レイアウト](./textbook_02_design.md)
> **次のパート**: [Part 4: ナビゲーション・データ管理 →](./textbook_04_nav_data.md)
