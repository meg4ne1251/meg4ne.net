# 第8章: コンテンツページの実装

## この章で学ぶこと

- データ駆動でページを構築する手法
- 自己紹介ページ（About Me）の実装
- 計算機構成ページの実装
- ネットワーク構成図ページの実装
- ネーミングコンベンションのページ実装
- 制作物ページの実装
- リンク集ページの実装

---

## 8.1 データ駆動の設計思想

コンテンツページを実装する際の重要な原則は **「データとUIを分離する」** ことです。

```
❌ 悪い例：HTML に直接データを書く
→ デザイン変更のたびに全データに触れる必要がある

✅ 良い例：データは TypeScript ファイルに、表示は Astro コンポーネントに
→ データの追加・変更がUIに影響しない
```

### データファイルの設計

```typescript
// src/data/profile.ts

import type { Profile } from "../types/content";

export const profile: Profile = {
  name: "本名（公開する場合）",
  handleName: "megane",
  university: "電気通信大学",
  club: "サークル名",
  hometown: "出身地",
  hobbies: ["自宅サーバー運用", "3Dモデル制作", "写真撮影"],
  certifications: [
    "基本情報技術者",
    // 資格を追加
  ],
};
```

```typescript
// src/data/skills.ts

import type { Skill } from "../types/content";

export const skills: Skill[] = [
  // 言語
  { name: "TypeScript", category: "language", level: "intermediate" },
  { name: "Python", category: "language", level: "intermediate" },
  { name: "HTML/CSS", category: "language", level: "intermediate" },

  // フレームワーク
  { name: "Astro", category: "framework", level: "beginner" },
  { name: "React", category: "framework", level: "beginner" },

  // ツール
  { name: "Docker", category: "tool", level: "intermediate" },
  { name: "Git", category: "tool", level: "intermediate" },
  { name: "Linux", category: "tool", level: "intermediate" },
  { name: "Proxmox VE", category: "tool", level: "intermediate" },
  { name: "Nginx", category: "tool", level: "beginner" },

  // 3D
  { name: "Blender", category: "3d", level: "intermediate" },
  // 他の3Dソフト
];
```

```typescript
// src/types/content.ts

export interface Profile {
  name: string;
  handleName: string;
  university: string;
  club: string;
  hometown: string;
  hobbies: string[];
  certifications: string[];
}

export interface Skill {
  name: string;
  category: "language" | "framework" | "tool" | "3d" | "other";
  level?: "beginner" | "intermediate" | "advanced";
}

export interface PhysicalHost {
  name: string;
  type: "desktop" | "laptop" | "server";
  cpu: string;
  memory: string;
  storage: string[];
  gpu?: string;
  os: string;
  description?: string;
}

export interface Work {
  title: string;
  description: string;
  tags: string[];
  url?: string;
  repositoryUrl?: string;
  thumbnailPath: string;
  createdAt: string;
}

export interface LinkItem {
  label: string;
  url: string;
  icon?: string;
  description?: string;
}

export interface ShipNaming {
  vmName: string;
  shipClass: string;
  origin: string;
  role: string;
  description: string;
  status: "running" | "stopped" | "planned";
}
```

---

## 8.2 自己紹介ページ（About Me）

```astro
---
// src/pages/about.astro
import Layout from "../layouts/Layout.astro";
import Breadcrumb from "../components/common/Breadcrumb.astro";
import SkillBadge from "../components/about/SkillBadge.astro";
import { profile } from "../data/profile";
import { skills } from "../data/skills";

// スキルをカテゴリごとにグループ化
const skillsByCategory = {
  language: skills.filter((s) => s.category === "language"),
  framework: skills.filter((s) => s.category === "framework"),
  tool: skills.filter((s) => s.category === "tool"),
  "3d": skills.filter((s) => s.category === "3d"),
};

const categoryLabels: Record<string, string> = {
  language: "プログラミング言語",
  framework: "フレームワーク",
  tool: "ツール・インフラ",
  "3d": "3D制作",
};
---

<Layout title="自己紹介" description="meganeのプロフィール・技術スタック">
  <Breadcrumb items={[{ label: "About" }]} />

  <article class="about-page">
    <!-- プロフィールセクション -->
    <section class="profile-section">
      <h1>About Me</h1>

      <div class="profile-card">
        <div class="profile-info">
          <dl class="info-list">
            <div class="info-item">
              <dt>ハンドルネーム</dt>
              <dd>{profile.handleName}</dd>
            </div>
            <div class="info-item">
              <dt>出身地</dt>
              <dd>{profile.hometown}</dd>
            </div>
            <div class="info-item">
              <dt>大学</dt>
              <dd>{profile.university}</dd>
            </div>
            <div class="info-item">
              <dt>サークル</dt>
              <dd>{profile.club}</dd>
            </div>
            <div class="info-item">
              <dt>趣味</dt>
              <dd>{profile.hobbies.join("、")}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- 資格セクション -->
    {profile.certifications.length > 0 && (
      <section class="certifications-section">
        <h2>所有資格</h2>
        <ul class="cert-list">
          {profile.certifications.map((cert) => (
            <li>{cert}</li>
          ))}
        </ul>
      </section>
    )}

    <!-- 技術スタックセクション -->
    <section class="skills-section">
      <h2>技術スタック</h2>

      {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
        <div class="skill-category">
          <h3>{categoryLabels[category]}</h3>
          <div class="skill-badges">
            {categorySkills.map((skill) => (
              <SkillBadge name={skill.name} category={skill.category} level={skill.level} />
            ))}
          </div>
        </div>
      ))}
    </section>
  </article>
</Layout>

<style>
  .about-page {
    max-width: 800px;
  }

  .profile-card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-xl);
  }

  .info-list {
    display: grid;
    gap: var(--space-md);
  }

  .info-item {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: var(--space-md);
  }

  .info-item dt {
    color: var(--color-text-muted);
    font-weight: bold;
  }

  .skill-category {
    margin-top: var(--space-xl);
  }

  .skill-badges {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  @media (max-width: 768px) {
    .info-item {
      grid-template-columns: 1fr;
      gap: var(--space-xs);
    }
  }
</style>
```

### `<dl>` 要素の使い方

```html
<!-- dl = Definition List（定義リスト） -->
<!-- 用語と説明のペアを意味的に正しくマークアップできる -->
<dl>
  <dt>用語（Definition Term）</dt>
  <dd>説明（Definition Description）</dd>
</dl>
```

プロフィール情報のような「ラベル：値」のペアには、`<dl>` が最も意味的に適切です。`<div>` と `<p>` で書くよりも、スクリーンリーダーや検索エンジンに内容の構造を正確に伝えられます。

---

## 8.3 スキルバッジコンポーネント

```astro
---
// src/components/about/SkillBadge.astro

interface Props {
  name: string;
  category: "language" | "framework" | "tool" | "3d" | "other";
  level?: "beginner" | "intermediate" | "advanced";
}

const { name, category, level } = Astro.props;

// カテゴリごとの色マップ
const categoryColors: Record<string, string> = {
  language: "#61dafb",
  framework: "#764abc",
  tool: "#ff6b35",
  "3d": "#00d4aa",
  other: "#888",
};
---

<span
  class="skill-badge"
  style={`--badge-color: ${categoryColors[category]}`}
  title={level ? `レベル: ${level}` : undefined}
>
  {name}
</span>

<style>
  .skill-badge {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    border: 1px solid var(--badge-color);
    border-radius: var(--radius-sm);
    color: var(--badge-color);
    font-size: 0.85rem;
    font-weight: 500;
    background: transparent;
    transition: background var(--transition-fast);
  }

  .skill-badge:hover {
    background: color-mix(in srgb, var(--badge-color) 15%, transparent);
  }
</style>
```

> **`color-mix()` 関数**: 2つの色を混合する CSS 関数です。ここでは `var(--badge-color)` を15%の濃さで背景に適用しています。モダンブラウザで対応済みです。

---

## 8.4 計算機構成ページ

```typescript
// src/data/computers.ts

import type { PhysicalHost } from "../types/content";

export const computers: PhysicalHost[] = [
  {
    name: "メインPC",
    type: "desktop",
    cpu: "AMD Ryzen 7 5800X",
    memory: "64GB DDR4-3200",
    storage: ["1TB NVMe SSD", "2TB HDD"],
    gpu: "NVIDIA GeForce RTX 3070",
    os: "Windows 11 / Ubuntu 24.04 (デュアルブート)",
    description: "制作作業とゲーミングに使用。Blenderの3Dレンダリングを行う。",
  },
  {
    name: "自宅サーバー",
    type: "server",
    cpu: "Intel Xeon E-2236",
    memory: "128GB ECC DDR4",
    storage: ["512GB NVMe SSD (OS)", "4TB HDD x4 (RAID10)"],
    os: "Proxmox VE 8.x",
    description: "仮想化基盤。複数のVMとコンテナを運用。",
  },
  // 他のマシンも追加
];
```

```astro
---
// src/pages/computer/index.astro
import Layout from "../../layouts/Layout.astro";
import Breadcrumb from "../../components/common/Breadcrumb.astro";
import { computers } from "../../data/computers";

// type ごとのアイコンマッピング
const typeIcons: Record<string, string> = {
  desktop: "🖥️",
  laptop: "💻",
  server: "🖧",
};

const typeLabels: Record<string, string> = {
  desktop: "デスクトップ",
  laptop: "ノートPC",
  server: "サーバー",
};
---

<Layout title="計算機構成" description="所有する計算機のスペック一覧">
  <Breadcrumb items={[{ label: "Computer" }]} />

  <h1>計算機構成</h1>
  <p>自宅で運用している計算機の一覧です。</p>

  <div class="computer-grid">
    {computers.map((pc) => (
      <article class="computer-card">
        <div class="card-header">
          <span class="type-icon">{typeIcons[pc.type]}</span>
          <div>
            <h2>{pc.name}</h2>
            <span class="type-label">{typeLabels[pc.type]}</span>
          </div>
        </div>

        <table class="spec-table">
          <tbody>
            <tr><th>CPU</th><td>{pc.cpu}</td></tr>
            <tr><th>メモリ</th><td>{pc.memory}</td></tr>
            {pc.gpu && <tr><th>GPU</th><td>{pc.gpu}</td></tr>}
            <tr>
              <th>ストレージ</th>
              <td>
                <ul class="storage-list">
                  {pc.storage.map((s) => <li>{s}</li>)}
                </ul>
              </td>
            </tr>
            <tr><th>OS</th><td>{pc.os}</td></tr>
          </tbody>
        </table>

        {pc.description && (
          <p class="description">{pc.description}</p>
        )}
      </article>
    ))}
  </div>

  <!-- サブページへのリンク -->
  <nav class="sub-nav">
    <a href="/computer/network" class="sub-nav-link">
      <h3>ネットワーク構成図</h3>
      <p>仮想ルーター、仮想スイッチ、物理スイッチの配線図</p>
    </a>
    <a href="/computer/naming" class="sub-nav-link">
      <h3>ネーミングコンベンション</h3>
      <p>VMの命名規則と各艦の役割</p>
    </a>
  </nav>
</Layout>

<style>
  .computer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--space-lg);
    margin-top: var(--space-xl);
  }

  .computer-card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
  }

  .type-icon {
    font-size: 2rem;
  }

  .card-header h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  .type-label {
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  .spec-table {
    width: 100%;
    border-collapse: collapse;
  }

  .spec-table th {
    text-align: left;
    padding: var(--space-sm);
    color: var(--color-text-muted);
    font-weight: normal;
    width: 100px;
    vertical-align: top;
    border-bottom: 1px solid var(--color-border);
  }

  .spec-table td {
    padding: var(--space-sm);
    border-bottom: 1px solid var(--color-border);
  }

  .storage-list {
    margin: 0;
    padding-left: var(--space-md);
  }

  .description {
    margin-top: var(--space-md);
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }

  .sub-nav {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-md);
    margin-top: var(--space-2xl);
  }

  .sub-nav-link {
    display: block;
    padding: var(--space-lg);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: border-color var(--transition-fast);
  }

  .sub-nav-link:hover {
    border-color: var(--color-primary);
  }

  .sub-nav-link h3 {
    color: var(--color-primary);
    margin-bottom: var(--space-sm);
  }

  .sub-nav-link p {
    color: var(--color-text-muted);
    font-size: 0.9rem;
    margin: 0;
  }
</style>
```

### `grid-template-columns: repeat(auto-fit, minmax(350px, 1fr))` の解説

```css
/* この1行で、レスポンシブなグリッドを実現できる */
grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));

/*
  意味:
  - 各カラムは最小350px、最大で利用可能な幅いっぱい (1fr)
  - auto-fit: 画面幅に合わせてカラム数を自動調整
  
  動作:
  - 画面幅 1200px → 3列 (400px × 3)
  - 画面幅 800px  → 2列 (400px × 2)
  - 画面幅 400px  → 1列 (400px × 1)
  
  一切メディアクエリを書かずにレスポンシブ対応できる便利な技法
*/
```

---

## 8.5 ネットワーク構成図ページ

要件定義書の「ネットワーク構成 (Network Diagram): 仮想ルーター, 仮想スイッチ, 物理スイッチ等の配線図・構成図」に対応するページです。

```astro
---
// src/pages/computer/network.astro
import Layout from "../../layouts/Layout.astro";
import Breadcrumb from "../../components/common/Breadcrumb.astro";
---

<Layout title="ネットワーク構成図" description="自宅ネットワークの構成図">
  <Breadcrumb items={[
    { label: "Computer", href: "/computer" },
    { label: "Network" },
  ]} />

  <h1>ネットワーク構成図</h1>
  <p>自宅ネットワークの仮想ルーター、仮想スイッチ、物理スイッチの接続構成です。</p>

  <!-- 構成図は SVG またはテキスト図で表現 -->
  <div class="diagram-container">
    <pre class="network-diagram">
{`
┌─── インターネット ───────────────────────────────┐
│                                                   │
│  Cloudflare Tunnel                                │
│       │                                           │
│       ▼                                           │
│  ┌─────────────────── DMZ (VLAN 10) ───────────┐ │
│  │  ┌──────────────┐                            │ │
│  │  │  Web公開VM   │                            │ │
│  │  │  (Docker)    │                            │ │
│  │  └──────────────┘                            │ │
│  └──────────────────────────────────────────────┘ │
│       │                                           │
│  ┌─── 仮想ルーター (Kaga) ──────────────────────┐ │
│  │  VLAN 10 (DMZ) ←→ VLAN 20 (管理)            │ │
│  │  ファイアウォールで厳格に分離                   │ │
│  └──────────────────────────────────────────────┘ │
│       │                                           │
│  ┌─── 管理LAN (VLAN 20) ───────────────────────┐ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │ Proxmox  │  │  NAS     │  │ その他VM  │   │ │
│  │  │ (管理UI) │  │          │  │          │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘   │ │
│  └──────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
`}
    </pre>
  </div>

  <section class="legend">
    <h2>凡例</h2>
    <dl class="legend-list">
      <div class="legend-item">
        <dt>VLAN 10 (DMZ)</dt>
        <dd>外部公開サービスが配置されるセグメント。インターネットからアクセス可能。</dd>
      </div>
      <div class="legend-item">
        <dt>VLAN 20 (管理LAN)</dt>
        <dd>Proxmox管理UIやNASなど、外部に公開しない内部サービスのセグメント。</dd>
      </div>
      <div class="legend-item">
        <dt>仮想ルーター (Kaga)</dt>
        <dd>VLAN間のルーティングとファイアウォールを担当。DMZから管理LANへの通信を遮断。</dd>
      </div>
    </dl>
  </section>
</Layout>

<style>
  .diagram-container {
    margin-top: var(--space-xl);
    overflow-x: auto;
  }

  .network-diagram {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    font-family: var(--font-mono);
    font-size: 0.85rem;
    line-height: 1.4;
    color: var(--color-primary);
    white-space: pre;
  }

  .legend {
    margin-top: var(--space-2xl);
  }

  .legend-list {
    margin: 0;
  }

  .legend-item {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .legend-item dt {
    font-family: var(--font-mono);
    font-weight: bold;
    color: var(--color-primary);
  }

  .legend-item dd {
    margin: 0;
    color: var(--color-text-muted);
  }

  @media (max-width: 768px) {
    .legend-item {
      grid-template-columns: 1fr;
      gap: var(--space-xs);
    }
  }
</style>
```

> **IPアドレスを含めない**: 要件定義書の「内部ネットワーク構成図（IP入り）」はセキュリティリスクが高いため、IPアドレスを伏せた概念図として実装します。実際の自分の構成に合わせて図を更新してください。

---

## 8.6 ネーミングコンベンションページ

```typescript
// src/data/ships.ts

import type { ShipNaming } from "../types/content";

export const ships: ShipNaming[] = [
  {
    vmName: "Kaga",
    shipClass: "航空母艦",
    origin: "加賀国（現在の石川県南部）に由来",
    role: "旗艦 = メインルーター / ファイアウォール",
    description: "ネットワークの中枢を担う仮想マシン。全てのトラフィックがここを通過する。",
    status: "running",
  },
  {
    vmName: "Izumo",
    shipClass: "護衛艦（ヘリコプター搭載）",
    origin: "出雲国（現在の島根県東部）に由来",
    role: "Webサーバー = 公開サービスの基盤",
    description: "Nginx、Astro、監視APIなどのWebサービスを搭載。外部公開の前線。",
    status: "running",
  },
  // 他の VM も追加...
];
```

```astro
---
// src/pages/computer/naming.astro
import Layout from "../../layouts/Layout.astro";
import Breadcrumb from "../../components/common/Breadcrumb.astro";
import { ships } from "../../data/ships";
---

<Layout title="ネーミングコンベンション" description="VMの命名規則と各艦の役割">
  <Breadcrumb items={[
    { label: "Computer", href: "/computer" },
    { label: "Naming" },
  ]} />

  <h1>ネーミングコンベンション</h1>
  <p>
    運用している仮想マシンには、<strong>日本の軍艦・護衛艦の名前</strong>を命名しています。
    それぞれの名前には由来があり、サーバーとしての役割と艦としての性格を対応させています。
  </p>

  <div class="ship-list">
    {ships.map((ship) => (
      <article class="ship-card">
        <div class="ship-header">
          <h2 class="ship-name">{ship.vmName}</h2>
          <span class={`status-badge status-${ship.status}`}>
            {ship.status === "running" ? "稼働中" : ship.status === "stopped" ? "停止中" : "計画中"}
          </span>
        </div>
        <dl class="ship-details">
          <div class="detail-row">
            <dt>艦種</dt>
            <dd>{ship.shipClass}</dd>
          </div>
          <div class="detail-row">
            <dt>由来</dt>
            <dd>{ship.origin}</dd>
          </div>
          <div class="detail-row">
            <dt>役割</dt>
            <dd>{ship.role}</dd>
          </div>
        </dl>
        <p class="ship-description">{ship.description}</p>
      </article>
    ))}
  </div>
</Layout>

<style>
  .ship-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    margin-top: var(--space-xl);
  }

  .ship-card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-left: 3px solid var(--color-primary);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
  }

  .ship-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
  }

  .ship-name {
    font-family: var(--font-mono);
    font-size: 1.4rem;
    margin: 0;
  }

  .status-badge {
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-weight: bold;
  }

  .status-running {
    background: rgba(74, 222, 128, 0.15);
    color: var(--color-success);
  }

  .status-stopped {
    background: rgba(248, 113, 113, 0.15);
    color: var(--color-error);
  }

  .status-planned {
    background: rgba(251, 191, 36, 0.15);
    color: var(--color-warning);
  }

  .ship-details {
    margin: 0;
  }

  .detail-row {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-xs) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .detail-row dt {
    min-width: 60px;
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  .ship-description {
    margin-top: var(--space-md);
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }
</style>
```

---

## 8.7 制作物ページ（Works）

```astro
---
// src/pages/works.astro
import Layout from "../layouts/Layout.astro";
import Breadcrumb from "../components/common/Breadcrumb.astro";
import WorkCard from "../components/works/WorkCard.astro";

// データファイルからインポート（省略）
const works = [
  {
    title: "meg4ne.net",
    description: "自身の個人ページ。ポートフォリオ、サーバー情報、活動記録を掲載。",
    tags: ["Astro", "React", "TypeScript", "Docker"],
    repositoryUrl: "https://github.com/xxx/meg4ne-net",
    thumbnailPath: "/assets/images/works/meg4ne-net.png",
    createdAt: "2026-01",
  },
  // 他の制作物
];
---

<Layout title="制作物" description="meganeが制作したサービス・プロダクト一覧">
  <Breadcrumb items={[{ label: "Works" }]} />

  <h1>制作物</h1>
  <div class="works-grid">
    {works.map((work) => (
      <WorkCard
        title={work.title}
        description={work.description}
        tags={work.tags}
        repositoryUrl={work.repositoryUrl}
        thumbnailPath={work.thumbnailPath}
      />
    ))}
  </div>
</Layout>

<style>
  .works-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-lg);
    margin-top: var(--space-xl);
  }
</style>
```

---

## 8.8 リンク集ページ

```astro
---
// src/pages/links.astro
import Layout from "../layouts/Layout.astro";

const links = [
  { label: "GitHub", url: "https://github.com/あなたのアカウント", description: "ソースコード", icon: "github" },
  { label: "Twitter / X", url: "https://x.com/あなたのアカウント", description: "SNS", icon: "twitter" },
  { label: "Qiita", url: "https://qiita.com/あなたのアカウント", description: "技術記事", icon: "qiita" },
  { label: "Zenn", url: "https://zenn.dev/あなたのアカウント", description: "技術記事", icon: "zenn" },
  { label: "Email", url: "mailto:your-email@example.com", description: "連絡先", icon: "email" },
];
---

<Layout title="リンク集" description="SNS・連絡先のリンク一覧">
  <h1>Links</h1>
  <div class="links-grid">
    {links.map((link) => (
      <a href={link.url} class="link-card" target="_blank" rel="noopener noreferrer">
        <span class="link-label">{link.label}</span>
        <span class="link-desc">{link.description}</span>
      </a>
    ))}
  </div>
</Layout>

<style>
  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-md);
    margin-top: var(--space-xl);
    max-width: 600px;
  }

  .link-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: border-color var(--transition-fast), transform var(--transition-fast);
  }

  .link-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }

  .link-label {
    font-weight: bold;
    color: var(--color-text);
  }

  .link-desc {
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }
</style>
```

---

## 8.9 この章のまとめと確認項目

### 設計パターンの復習

1. **データとUIの分離**: `src/data/` にデータ、コンポーネントでは表示のみ
2. **型定義の共有**: `src/types/` で定義してデータファイルとコンポーネントの両方で使う
3. **コンポーネントの分割**: 再利用可能な単位（カード、バッジ）に分ける
4. **意味的なHTML**: `<dl>` でキー・バリュー、`<article>` で独立コンテンツ、`<nav>` でナビゲーション
5. **CSS Grid の `auto-fit` + `minmax()`**: メディアクエリなしのレスポンシブグリッド

### 実装チェックリスト

- [ ] `/about` - 自己紹介ページが表示される
- [ ] `/computer` - 計算機構成が表示される
- [ ] `/computer/network` - ネットワーク構成図が表示される
- [ ] `/computer/naming` - ネーミングコンベンションが表示される
- [ ] `/works` - 制作物一覧が表示される
- [ ] `/links` - リンク集が表示される
- [ ] 全ページでパンくずリストが正しく表示される
- [ ] レスポンシブ対応：スマホ幅でもレイアウトが崩れない

---

次の章: [第9章: Markdown コンテンツ管理](./09-markdown-content.md)
