# 第14章: リアルタイムサーバーモニター

## この章で学ぶこと

- WebSocket によるリアルタイム通信の仕組み
- ポーリング方式との比較
- サーバーリソースの可視化コンポーネント
- React でのリアルタイムデータ表示
- サービス一覧のタグフィルタ・ソート機能

---

## 14.1 リアルタイム通信の方式

要件定義書の記述：
> webhook, webRTC などを利用してリアルタイム同期を目指す。

リアルタイム通信には複数の方式があります。用途に応じて適切なものを選びます。

### 方式比較

| 方式 | 仕組み | 適したケース | 複雑さ |
|---|---|---|---|
| **ポーリング** | 定期的にGETリクエスト | 簡単に始めたい | ★☆☆ |
| **SSE** | サーバーからの一方向ストリーム | サーバー→クライアントのみ | ★★☆ |
| **WebSocket** | 双方向リアルタイム通信 | 低遅延が必要 | ★★★ |
| **WebRTC** | P2P通信 | ビデオ通話など | ★★★★ |

サーバーモニターの場合、**データは常にサーバーからクライアントへの一方向**です。しかし、将来の拡張性（例: クライアントからリフレッシュ要求）を考慮し、**WebSocket** を採用します。

---

## 14.2 段階的な実装アプローチ

いきなり WebSocket を実装するのではなく、まず**ポーリング方式で動くものを作り**、後で WebSocket に移行する戦略を取ります。

```
Step 1: ポーリング方式で基本UI完成    ← この章で実装
Step 2: WebSocket へ移行（任意）      ← 発展的な内容
```

---

## 14.3 ポーリング方式の実装

### フロントエンド用 API クライアント

```typescript
// src/lib/apiClient.ts

// API レスポンスの共通型
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

// サーバーリソースの型（サーバーの sanitize.ts と揃える）
export interface NodeStatus {
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
}

export interface VMStatus {
  name: string;
  status: "running" | "stopped" | "paused" | "unknown";
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: number;
}

// API のベース URL
const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:3001";

/**
 * API からノードステータスを取得
 */
export async function fetchNodeStatus(): Promise<NodeStatus | null> {
  try {
    const res = await fetch(`${API_BASE}/api/monitor/node`);
    const json: ApiResponse<NodeStatus> = await res.json();

    if (json.success && json.data) {
      return json.data;
    }
    console.warn("ノードステータス取得失敗:", json.error);
    return null;
  } catch (error) {
    console.error("API通信エラー:", error);
    return null;
  }
}

/**
 * API から VM 一覧を取得
 */
export async function fetchVMList(): Promise<VMStatus[]> {
  try {
    const res = await fetch(`${API_BASE}/api/monitor/vms`);
    const json: ApiResponse<VMStatus[]> = await res.json();

    if (json.success && json.data) {
      return json.data;
    }
    console.warn("VM一覧取得失敗:", json.error);
    return [];
  } catch (error) {
    console.error("API通信エラー:", error);
    return [];
  }
}
```

### `import.meta.env` について

Astro では環境変数を `import.meta.env` で参照します。

```bash
# .env
# PUBLIC_ プレフィックスがあるとフロントエンドからも参照可
PUBLIC_API_URL=http://localhost:3001
```

`PUBLIC_` から始まる環境変数だけがブラウザ側のコードに含まれます。
`PROXMOX_TOKEN` などは `PUBLIC_` を付けてはいけません。

---

## 14.4 ポーリング用のカスタムフック

```tsx
// src/hooks/useServerMonitor.ts
import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchNodeStatus,
  fetchVMList,
  type NodeStatus,
  type VMStatus,
} from "../lib/apiClient";

interface ServerMonitorState {
  node: NodeStatus | null;
  vms: VMStatus[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * サーバーリソースを定期的に取得するカスタムフック
 * @param intervalMs - 取得間隔（ミリ秒）。デフォルト 5000ms
 */
export function useServerMonitor(intervalMs: number = 5000) {
  const [state, setState] = useState<ServerMonitorState>({
    node: null,
    vms: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  // React の StrictMode での二重実行対策に useRef を使う
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // ノードステータスと VM 一覧を並行取得
      const [node, vms] = await Promise.all([
        fetchNodeStatus(),
        fetchVMList(),
      ]);

      setState({
        node,
        vms,
        isLoading: false,
        error: node === null ? "データの取得に失敗しました" : null,
        lastUpdated: new Date(),
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "サーバーとの通信に失敗しました",
      }));
    }
  }, []);

  useEffect(() => {
    // 初回取得
    fetchData();

    // 定期ポーリング開始
    intervalRef.current = setInterval(fetchData, intervalMs);

    // クリーンアップ: コンポーネントのアンマウント時にポーリング停止
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, intervalMs]);

  return state;
}
```

### なぜクリーンアップが必要なのか

```
ページ遷移                     setInterval は残り続ける
  コンポーネントがアンマウント     ↓
    ↓                          古いコンポーネントの setState が呼ばれる
    消えたのに                    ↓
    メモリに残る                  メモリリーク + 警告エラー

→ clearInterval でクリーンアップすれば安全
```

---

## 14.5 リソースゲージコンポーネント

```tsx
// src/components/monitor/ResourceGauge.tsx
import { useMemo } from "react";

interface ResourceGaugeProps {
  label: string;
  value: number;       // 0-100 のパーセンテージ
  unit?: string;
  thresholds?: {
    warning: number;   // 黄色になる閾値
    danger: number;    // 赤色になる閾値
  };
}

/**
 * リソース使用率を視覚的に表示するゲージコンポーネント
 */
export function ResourceGauge({
  label,
  value,
  unit = "%",
  thresholds = { warning: 60, danger: 85 },
}: ResourceGaugeProps) {
  // 値に応じた色を決定
  const colorClass = useMemo(() => {
    if (value >= thresholds.danger) return "gauge-danger";
    if (value >= thresholds.warning) return "gauge-warning";
    return "gauge-normal";
  }, [value, thresholds]);

  return (
    <div className="resource-gauge">
      <div className="gauge-header">
        <span className="gauge-label">{label}</span>
        <span className={`gauge-value ${colorClass}`}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div className="gauge-bar-bg">
        <div
          className={`gauge-bar-fill ${colorClass}`}
          style={{ width: `${Math.min(value, 100)}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${value.toFixed(1)}${unit}`}
        />
      </div>
    </div>
  );
}
```

### CSS

```css
/* src/components/monitor/ResourceGauge.css */
.resource-gauge {
  margin-bottom: var(--space-md);
}

.gauge-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.gauge-label {
  color: var(--color-text-muted);
}

.gauge-value {
  font-weight: bold;
}

.gauge-bar-bg {
  height: 8px;
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.gauge-bar-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.5s ease-out;
}

/* 色のバリエーション */
.gauge-normal {
  color: var(--color-primary);
}
.gauge-normal.gauge-bar-fill {
  background: var(--color-primary);
}

.gauge-warning {
  color: #f59e0b;
}
.gauge-warning.gauge-bar-fill {
  background: #f59e0b;
}

.gauge-danger {
  color: #ef4444;
}
.gauge-danger.gauge-bar-fill {
  background: #ef4444;
}
```

### `role="progressbar"` の解説

`role="progressbar"` はアクセシビリティのための属性です。
スクリーンリーダーが「CPU 使用率: 25%」のように読み上げてくれます。

---

## 14.6 VM ステータスカード

```tsx
// src/components/monitor/VMCard.tsx
import type { VMStatus } from "../../lib/apiClient";
import { ResourceGauge } from "./ResourceGauge";

interface VMCardProps {
  vm: VMStatus;
}

/**
 * 仮想マシン 1 台分のステータス表示カード
 */
export function VMCard({ vm }: VMCardProps) {
  // 稼働時間を読みやすい形式に変換
  const uptimeText = formatUptime(vm.uptime);

  // ステータスに応じたスタイル
  const statusColor: Record<string, string> = {
    running: "#22c55e",
    stopped: "#6b7280",
    paused: "#f59e0b",
    unknown: "#ef4444",
  };

  const statusLabel: Record<string, string> = {
    running: "稼働中",
    stopped: "停止",
    paused: "一時停止",
    unknown: "不明",
  };

  return (
    <article className="vm-card">
      <header className="vm-card-header">
        <h3 className="vm-name">{vm.name}</h3>
        <span
          className="vm-status"
          style={{ color: statusColor[vm.status] }}
        >
          ● {statusLabel[vm.status]}
        </span>
      </header>

      {vm.status === "running" && (
        <div className="vm-card-body">
          <ResourceGauge label="CPU" value={vm.cpuUsage} />
          <ResourceGauge label="Memory" value={vm.memoryUsage} />
          <ResourceGauge label="Disk" value={vm.diskUsage} />
          <div className="vm-uptime">
            <span className="uptime-label">Uptime</span>
            <span className="uptime-value">{uptimeText}</span>
          </div>
        </div>
      )}
    </article>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);

  return parts.join(" ");
}
```

---

## 14.7 サーバーモニターページ

```tsx
// src/components/monitor/ServerMonitor.tsx
import { useServerMonitor } from "../../hooks/useServerMonitor";
import { ResourceGauge } from "./ResourceGauge";
import { VMCard } from "./VMCard";
import "./ServerMonitor.css";

/**
 * サーバーモニター全体のコンポーネント
 * Astro ページから client:load で読み込む
 */
export function ServerMonitor() {
  const { node, vms, isLoading, error, lastUpdated } = useServerMonitor(5000);

  if (isLoading) {
    return (
      <div className="monitor-loading">
        <span className="loading-spinner" />
        <p>サーバー情報を取得中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="monitor-error">
        <p>⚠ {error}</p>
        <p className="error-hint">
          サーバーが起動しているか確認してください
        </p>
      </div>
    );
  }

  return (
    <div className="server-monitor">
      {/* ヘッダー: 最終更新時刻 */}
      <div className="monitor-header">
        <h2>Server Status</h2>
        {lastUpdated && (
          <time className="last-updated" dateTime={lastUpdated.toISOString()}>
            Last updated: {lastUpdated.toLocaleTimeString("ja-JP")}
          </time>
        )}
      </div>

      {/* ノード全体のリソース */}
      {node && (
        <section className="node-status">
          <h3>Host Node</h3>
          <div className="node-gauges">
            <ResourceGauge label="CPU" value={node.cpuUsage} />
            <ResourceGauge label="Memory" value={node.memoryUsage} />
          </div>
          <p className="node-uptime">
            Uptime: {formatUptimeShort(node.uptime)}
          </p>
        </section>
      )}

      {/* VM 一覧 */}
      <section className="vm-list">
        <h3>Virtual Machines</h3>
        <div className="vm-grid">
          {vms.map((vm) => (
            <VMCard key={vm.name} vm={vm} />
          ))}
        </div>
        {vms.length === 0 && (
          <p className="no-vms">仮想マシンが見つかりません</p>
        )}
      </section>
    </div>
  );
}

function formatUptimeShort(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}
```

### CSS

```css
/* src/components/monitor/ServerMonitor.css */
.server-monitor {
  max-width: 1000px;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.last-updated {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-family: var(--font-mono);
}

.node-status {
  background: var(--color-surface);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.node-uptime {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  margin-top: var(--space-sm);
}

.vm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-md);
}

.vm-card {
  background: var(--color-surface);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.vm-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.vm-name {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  margin: 0;
}

.vm-status {
  font-size: 0.85rem;
  font-weight: bold;
}

.vm-uptime {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-sm);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

/* ローディング */
.monitor-loading {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-muted);
}

.loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* エラー */
.monitor-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  text-align: center;
}

.error-hint {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: var(--space-sm);
}
```

---

## 14.8 Astro ページへの統合

```astro
---
// src/pages/server/index.astro
import Layout from "../../layouts/Layout.astro";
import { ServerMonitor } from "../../components/monitor/ServerMonitor";
---

<Layout title="サーバー情報">
  <h1>Server</h1>

  <!-- client:load でページ読み込み時に即座にレンダリング -->
  <ServerMonitor client:load />

  <p class="note">
    データは5秒ごとに自動更新されます。
  </p>
</Layout>

<style>
  .note {
    margin-top: var(--space-xl);
    color: var(--color-text-muted);
    font-size: 0.85rem;
    text-align: center;
  }
</style>
```

### なぜ `client:load` を使うのか

```
client:visible → ビューポートに入ったら読み込む（通常はこれ）
client:load   → ページ読み込みと同時に即座に読み込む

サーバーモニターはページのメインコンテンツなので、
待つよりも即座に表示を開始する client:load が適切。
```

---

## 14.9 WebSocket への移行（発展）

ポーリング方式で基本が動いたら、WebSocket に移行してより低遅延にできます。

### サーバー側（Hono + WebSocket）

```typescript
// server/src/routes/ws.ts（発展的な内容）
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";

const wsApp = new Hono();

// WebSocket のアップグレードハンドラー
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app: wsApp });

wsApp.get(
  "/ws/monitor",
  upgradeWebSocket(() => {
    let interval: ReturnType<typeof setInterval>;

    return {
      onOpen(_event, ws) {
        console.log("WebSocket クライアント接続");

        // 接続されたら5秒ごとにデータを送信
        interval = setInterval(async () => {
          try {
            const data = await getMonitorData();  // データ取得
            ws.send(JSON.stringify(data));
          } catch (error) {
            ws.send(JSON.stringify({ error: "データ取得失敗" }));
          }
        }, 5000);
      },

      onClose() {
        console.log("WebSocket クライアント切断");
        clearInterval(interval);
      },
    };
  }),
);
```

### クライアント側（WebSocket フック）

```typescript
// src/hooks/useWebSocketMonitor.ts（発展的な内容）
import { useState, useEffect, useRef, useCallback } from "react";

export function useWebSocketMonitor(url: string) {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket 接続成功");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setData(parsed);
    };

    ws.onclose = () => {
      setIsConnected(false);
      // 自動再接続（5秒後）
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket エラー:", error);
      ws.close();
    };

    wsRef.current = ws;
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      wsRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { data, isConnected };
}
```

---

## 14.10 サービス一覧ページ（タグ・ソート機能付き）

要件定義書の「サービス一覧: 稼働中のソフトウェア一覧をテーブル形式で表示。タグ付け機能とソート機能を実装」に対応するコンポーネントです。タグのフィルタリングやソートはブラウザ上でのインタラクションが必要なため、React コンポーネントとして実装します。

### データ定義

```typescript
// src/types/server.ts に追加

export interface Service {
  name: string;
  description: string;
  role: string;
  vm: string;            // どのVMで動いているか
  tags: string[];
  status: "running" | "stopped";
}
```

```typescript
// src/data/services.ts

import type { Service } from "../types/server";

export const services: Service[] = [
  {
    name: "Nginx",
    description: "リバースプロキシ・Webサーバー",
    role: "防衛",
    vm: "Izumo",
    tags: ["web", "proxy"],
    status: "running",
  },
  {
    name: "Gitea",
    description: "セルフホスト Git サーバー",
    role: "補給",
    vm: "Mamiya",
    tags: ["git", "devops"],
    status: "running",
  },
  {
    name: "Proxmox Backup Server",
    description: "バックアップ管理",
    role: "後方支援",
    vm: "Hayasui",
    tags: ["backup", "infra"],
    status: "running",
  },
  // 他のサービスを追加...
];
```

### ServiceTable コンポーネント

```tsx
// src/components/server/ServiceTable.tsx
import { useState, useMemo } from "react";
import type { Service } from "../../types/server";

interface ServiceTableProps {
  services: Service[];
}

type SortKey = "name" | "vm" | "role" | "status";
type SortOrder = "asc" | "desc";

export function ServiceTable({ services }: ServiceTableProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  // 全タグを重複なく抽出
  const allTags = useMemo(() => {
    const tagSet = new Set(services.flatMap((s) => s.tags));
    return Array.from(tagSet).sort();
  }, [services]);

  // タグの選択/解除
  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  // ソートキーの切り替え（同じキーなら昇順/降順を反転）
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }

  // フィルタリング → ソートの順で処理
  const filteredServices = useMemo(() => {
    let result = services;

    // テキスト検索フィルタ
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query),
      );
    }

    // タグフィルタ（選択されたタグを全て持つサービスのみ表示）
    if (selectedTags.length > 0) {
      result = result.filter((s) =>
        selectedTags.every((tag) => s.tags.includes(tag)),
      );
    }

    // ソート
    result = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const comparison = aVal.localeCompare(bVal, "ja");
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [services, searchQuery, selectedTags, sortKey, sortOrder]);

  // ソート方向のインジケーター
  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortOrder === "asc" ? " ▲" : " ▼";
  }

  return (
    <div className="service-table-container">
      {/* 検索 */}
      <input
        type="text"
        className="service-search"
        placeholder="サービスを検索..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* タグフィルター */}
      <div className="tag-filters">
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`tag-button ${selectedTags.includes(tag) ? "active" : ""}`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        ))}
        {selectedTags.length > 0 && (
          <button className="tag-clear" onClick={() => setSelectedTags([])}>
            クリア
          </button>
        )}
      </div>

      {/* テーブル */}
      <table className="service-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("name")} className="sortable">
              名前{sortIndicator("name")}
            </th>
            <th>説明</th>
            <th onClick={() => handleSort("role")} className="sortable">
              役割{sortIndicator("role")}
            </th>
            <th onClick={() => handleSort("vm")} className="sortable">
              VM{sortIndicator("vm")}
            </th>
            <th>タグ</th>
            <th onClick={() => handleSort("status")} className="sortable">
              状態{sortIndicator("status")}
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredServices.map((service) => (
            <tr key={service.name}>
              <td className="service-name">{service.name}</td>
              <td>{service.description}</td>
              <td>{service.role}</td>
              <td className="service-vm">{service.vm}</td>
              <td>
                <div className="service-tags">
                  {service.tags.map((tag) => (
                    <span key={tag} className="service-tag">{tag}</span>
                  ))}
                </div>
              </td>
              <td>
                <span className={`service-status service-status-${service.status}`}>
                  {service.status === "running" ? "稼働中" : "停止"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredServices.length === 0 && (
        <p className="no-results">該当するサービスがありません</p>
      )}
    </div>
  );
}
```

### Astro ページへの統合

```astro
---
// src/pages/server/services.astro
import Layout from "../../layouts/Layout.astro";
import Breadcrumb from "../../components/common/Breadcrumb.astro";
import { ServiceTable } from "../../components/server/ServiceTable";
import { services } from "../../data/services";
---

<Layout title="サービス一覧" description="稼働中のサービス一覧">
  <Breadcrumb items={[
    { label: "Server", href: "/server" },
    { label: "Services" },
  ]} />

  <h1>サービス一覧</h1>
  <p>各VMで稼働しているソフトウェアの一覧です。タグやVM名でフィルタリングできます。</p>

  <!-- タグフィルタ・ソートはインタラクティブなので client:load -->
  <ServiceTable client:load services={services} />
</Layout>
```

> **ポイント**: データ（`services`）はビルド時に Astro のフロントマターで読み込み、React コンポーネントに Props として渡しています。フィルタリングやソートの **ロジック** だけがブラウザ上で動きます。

---

## 14.11 この章のまとめ

### 実装の進め方

1. **まずポーリングで動かす** → `setInterval` + `fetch`
2. **UI を完成させる** → ゲージ、カード、レイアウト
3. **WebSocket に移行（任意）** → より低遅延

### 重要なポイント

- **カスタムフック**でデータ取得ロジックを分離
- **クリーンアップ関数**でメモリリークを防止
- **ローディング / エラー / データ表示**の3状態を処理
- **`client:load`** でモニターを即座にレンダリング
- **アクセシビリティ**: `role="progressbar"` で支援技術対応
- **サービス一覧**: `useMemo` でフィルタ・ソートを効率化し、データは Astro から Props で渡す

---

次の章: [第15章: Docker & Docker Compose](./15-docker.md)
