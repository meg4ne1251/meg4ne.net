# 第13章: BFF アーキテクチャと API 設計

## この章で学ぶこと

- BFF（Backend For Frontend）アーキテクチャの役割と必要性
- Hono フレームワークでの API サーバー構築
- Proxmox API との連携と認証
- データサニタイズ（機密情報の除去）
- JSON レスポンス設計

---

## 13.1 BFF アーキテクチャとは何か

### なぜ直接 Proxmox API を叩かないのか

```
❌ 危険な構成:
ブラウザ → Proxmox API（直接アクセス）
  問題1: API トークンがブラウザの開発者ツールで丸見え
  問題2: IP アドレス・MAC アドレス等の内部情報が漏洩
  問題3: トークンが奪われると Proxmox が操作される可能性

✅ BFF 構成:
ブラウザ → BFF(監視用API) → Proxmox API
  利点1: API トークンはサーバー側にのみ存在
  利点2: BFF がデータをサニタイズしてから返す
  利点3: BFF と Proxmox 間は内部ネットワーク通信
```

要件定義書にはこう書かれています：

> クライアントサイド（ブラウザ）にAPIトークンやサーバーの内部構成情報を一切露出させないため。
> 万が一Webサーバーが侵害されても、Proxmox本体への管理権限（root等）は奪われない設計とする（APIトークンには PVEAuditor 権限のみを付与）。

---

## 13.2 Hono フレームワーク

### Hono を選ぶ理由

| フレームワーク | 特徴 |
|---|---|
| **Express** | 最も有名だが古い設計。TypeScript サポートが弱い |
| **Fastify** | 高速。プラグインシステムが充実 |
| **Hono** | 超軽量・超高速。TypeScript ファースト。Web標準 API 基盤 |

要件定義書では「Hono または Fastify」とありますが、Hono は TypeScript との親和性が非常に高く、学習コストも低いため本教科書では **Hono** を採用します。

### プロジェクトのセットアップ

```bash
# プロジェクトルートで server ディレクトリを作成
mkdir -p server/src
cd server

# server ディレクトリ用の package.json を作成
pnpm init

# Hono と関連パッケージをインストール
pnpm add hono @hono/node-server
pnpm add -D typescript @types/node tsx
```

### TypeScript 設定

```json
// server/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### package.json のスクリプト

```json
// server/package.json
{
  "name": "meg4ne-api",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## 13.3 API サーバーの基本構造

```typescript
// server/src/index.ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { monitorRouter } from "./routes/monitor";

const app = new Hono();

// ミドルウェア
app.use("*", logger());  // リクエストログの出力
app.use(
  "*",
  cors({
    origin: ["http://localhost:4321"],  // Astro の開発サーバー
    allowMethods: ["GET"],              // 読み取り専用
  }),
);

// ルーティング
app.route("/api/monitor", monitorRouter);

// ヘルスチェックエンドポイント
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// サーバーの起動
const port = Number(process.env.API_PORT) || 3001;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🚀 API Server running on http://localhost:${info.port}`);
});
```

### 各部分の解説

**ミドルウェア**とは、リクエストが到達する前に「共通の処理」を挟む仕組みです。

```
リクエスト → [logger] → [cors] → [ルート処理] → レスポンス
               │            │
               │            └─ 許可されたオリジンか確認
               └─ リクエストの内容をログに出力
```

**CORS（Cross-Origin Resource Sharing）** は、異なるオリジン（ドメイン:ポート）間での通信を制御する仕組みです。

```
Astro（localhost:4321）→ API（localhost:3001）
異なるポート = 異なるオリジン → CORS 設定が必要
```

---

## 13.4 環境変数の管理

```bash
# server/.env（このファイルは Git に含めない！）
PROXMOX_API_URL=https://192.168.x.x:8006
PROXMOX_TOKEN_ID=monitor@pve!meg4ne-monitor
PROXMOX_TOKEN_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PROXMOX_NODE_NAME=your-node-name
API_PORT=3001
```

```typescript
// server/src/config.ts
// 環境変数を一箇所で管理し、型安全にする

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません`);
  }
  return value;
}

export const config = {
  proxmox: {
    apiUrl: requireEnv("PROXMOX_API_URL"),
    tokenId: requireEnv("PROXMOX_TOKEN_ID"),
    tokenSecret: requireEnv("PROXMOX_TOKEN_SECRET"),
    nodeName: requireEnv("PROXMOX_NODE_NAME"),
  },
  api: {
    port: Number(process.env.API_PORT) || 3001,
  },
} as const;
```

### なぜ `requireEnv` を使うのか

環境変数が設定されていない場合、値は `undefined` になります。このまま使うとランタイムエラーや予期しない動作の原因になります。

```typescript
// ❌ 起動してしまうが、API 呼び出し時にようやくエラー
const url = process.env.PROXMOX_API_URL;  // undefined かもしれない

// ✅ 起動時にすぐエラーで気付ける
const url = requireEnv("PROXMOX_API_URL");  // 未設定なら即座に例外
```

---

## 13.5 Proxmox API クライアント

### PVEAuditor トークンの作成

Proxmox の Web UI で以下の手順でトークンを作成します：

1. データセンター → 権限 → API トークン → 追加
2. ユーザー: `monitor@pve`（専用ユーザーを作成）
3. トークン ID: `meg4ne-monitor`
4. 権限の分離: チェックを外す
5. 作成後、ロール `PVEAuditor`（読み取り専用）を割り当て

**PVEAuditor** は Proxmox に組み込まれた「読み取り専用」ロールです。サーバーの再起動や仮想マシンの削除はできません。

```typescript
// server/src/lib/proxmox.ts
import { config } from "../config";

interface ProxmoxRequestOptions {
  path: string;
}

/**
 * Proxmox API への認証付きリクエスト
 */
export async function proxmoxFetch<T>(
  options: ProxmoxRequestOptions,
): Promise<T> {
  const url = `${config.proxmox.apiUrl}/api2/json${options.path}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `PVEAPIToken=${config.proxmox.tokenId}=${config.proxmox.tokenSecret}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Proxmox API エラー: ${response.status} ${response.statusText}`,
    );
  }

  const json = (await response.json()) as { data: T };
  return json.data;
}
```

### 自己署名証明書への対応

Proxmox VE はデフォルトで自己署名証明書を使用しています。Node.js の `fetch` は自己署名証明書を拒否するため、内部ネットワークでの通信時に対処が必要です。

```bash
# 方法1: 環境変数で証明書検証を無効化（開発・内部ネットワーク用）
# server/.env に追加
NODE_TLS_REJECT_UNAUTHORIZED=0
```

```typescript
// 方法2: Node.js 18+ の場合、fetch のオプションで指定
// ※ Node.js のカスタム fetch を使う場合
import https from "node:https";

const agent = new https.Agent({ rejectUnauthorized: false });
// undici の場合は dispatcher オプションを使用
```

> **セキュリティ上の注意**: `NODE_TLS_REJECT_UNAUTHORIZED=0` は全ての HTTPS 接続の証明書検証を無効にします。これは**内部ネットワークでの BFF → Proxmox 通信にのみ**使用してください。BFF 自体は Nginx の背後で動作するため、外部通信には影響しません。
> より安全な方法は、Proxmox の CA 証明書をエクスポートして Node.js に信頼させることです（`NODE_EXTRA_CA_CERTS` 環境変数）。

### Proxmox API の認証方式

```
Authorization: PVEAPIToken=ユーザー名@レルム!トークンID=シークレット

例:
Authorization: PVEAPIToken=monitor@pve!meg4ne-monitor=xxxxxxxx-xxxx-...
```

---

## 13.6 データのサニタイズ

**サニタイズ**とは、元データから不要・危険な情報を取り除くことです。
これが BFF の最も重要な役割です。

### Proxmox が返す「生データ」（危険）

```json
{
  "vmid": 100,
  "name": "kaga",
  "status": "running",
  "cpu": 0.0523,
  "maxcpu": 4,
  "mem": 2147483648,
  "maxmem": 8589934592,
  "disk": 10737418240,
  "maxdisk": 53687091200,
  "netin": 123456789,
  "netout": 987654321,
  "pid": 12345,
  "uptime": 86400,
  "ha": { "managed": 0 },
  "template": 0,
  "tags": "",
  "lock": "",
  "serial": 1,
  "agent": { "network": { "result": [
    { "name": "eth0", "ip-addresses": [
      { "ip-address": "192.168.1.100", "ip-address-type": "ipv4" },
      { "mac-address": "AA:BB:CC:DD:EE:FF" }
    ]}
  ]}}
}
```

### サニタイズ後のデータ（安全）

```json
{
  "name": "kaga",
  "status": "running",
  "cpuUsage": 5.23,
  "memoryUsage": 25.0,
  "diskUsage": 20.0,
  "uptime": 86400
}
```

**何を除去したか:**
- `vmid` → 内部 ID は不要
- `pid` → プロセス ID は不要
- `agent.network` → IP アドレス・MAC アドレスは**絶対に公開してはいけない**
- `ha`, `template`, `lock`, `serial` → 管理用情報は不要

### サニタイズ関数の実装

```typescript
// server/src/lib/sanitize.ts

// Proxmox から返される生の VM データの型
interface RawVMStatus {
  vmid: number;
  name: string;
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  netin: number;
  netout: number;
  uptime: number;
  [key: string]: unknown;  // 他のフィールドも来る可能性がある
}

// フロントエンドに返す安全なデータの型
export interface SanitizedVM {
  name: string;
  status: "running" | "stopped" | "paused" | "unknown";
  cpuUsage: number;       // パーセンテージ（0-100）
  memoryUsage: number;    // パーセンテージ（0-100）
  diskUsage: number;      // パーセンテージ（0-100）
  uptime: number;         // 秒数
}

/**
 * 生データから安全なデータに変換する
 * ホワイトリスト方式: 必要なフィールドだけを「選んで」取り出す
 */
export function sanitizeVM(raw: RawVMStatus): SanitizedVM {
  return {
    name: raw.name,
    status: normalizeStatus(raw.status),
    cpuUsage: roundPercent(raw.cpu * 100),
    memoryUsage: roundPercent((raw.mem / raw.maxmem) * 100),
    diskUsage: roundPercent((raw.disk / raw.maxdisk) * 100),
    uptime: raw.uptime,
  };
}

function normalizeStatus(status: string): SanitizedVM["status"] {
  switch (status) {
    case "running":
      return "running";
    case "stopped":
      return "stopped";
    case "paused":
      return "paused";
    default:
      return "unknown";
  }
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;  // 小数点2桁
}
```

### ホワイトリスト方式 vs ブラックリスト方式

```typescript
// ❌ ブラックリスト方式（危険: 新しい危険なフィールドを見落とす可能性）
function sanitize(raw: any) {
  delete raw.pid;
  delete raw.agent;
  delete raw.vmid;
  // 将来 Proxmox が新しいフィールドを追加したら...?
  return raw;
}

// ✅ ホワイトリスト方式（安全: 明示的に選んだものだけ返す）
function sanitize(raw: any) {
  return {
    name: raw.name,
    status: raw.status,
    cpuUsage: raw.cpu * 100,
    // 知らないフィールドは自動的に除外される
  };
}
```

---

## 13.7 API ルーターの実装

```typescript
// server/src/routes/monitor.ts
import { Hono } from "hono";
import { proxmoxFetch } from "../lib/proxmox";
import { sanitizeVM, type SanitizedVM } from "../lib/sanitize";
import { config } from "../config";

export const monitorRouter = new Hono();

// ノード全体のステータス
interface NodeStatus {
  cpu: number;
  memory: { total: number; used: number; free: number };
  uptime: number;
  kversion: string;
  [key: string]: unknown;
}

// サニタイズ済みノードステータス
interface SanitizedNodeStatus {
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
}

function sanitizeNodeStatus(raw: NodeStatus): SanitizedNodeStatus {
  return {
    cpuUsage: Math.round(raw.cpu * 100 * 100) / 100,
    memoryUsage: Math.round(
      (raw.memory.used / raw.memory.total) * 100 * 100,
    ) / 100,
    uptime: raw.uptime,
  };
}

/**
 * GET /api/monitor/node
 * ノード（物理サーバー）のリソース状況
 */
monitorRouter.get("/node", async (c) => {
  try {
    const raw = await proxmoxFetch<NodeStatus>({
      path: `/nodes/${config.proxmox.nodeName}/status`,
    });

    const sanitized = sanitizeNodeStatus(raw);

    return c.json({
      success: true,
      data: sanitized,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("ノードステータス取得エラー:", error);
    return c.json(
      {
        success: false,
        error: "サーバー情報の取得に失敗しました",
      },
      500,
    );
  }
});

/**
 * GET /api/monitor/vms
 * 仮想マシン一覧（サニタイズ済み）
 */
monitorRouter.get("/vms", async (c) => {
  try {
    const rawVMs = await proxmoxFetch<Array<Record<string, unknown>>>({
      path: `/nodes/${config.proxmox.nodeName}/qemu`,
    });

    const sanitized: SanitizedVM[] = rawVMs.map((vm) =>
      sanitizeVM(vm as any),
    );

    return c.json({
      success: true,
      data: sanitized,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("VM一覧取得エラー:", error);
    return c.json(
      {
        success: false,
        error: "仮想マシン情報の取得に失敗しました",
      },
      500,
    );
  }
});
```

### レスポンス設計のポイント

すべてのレスポンスに共通の構造を持たせることで、フロントエンド側の処理が楽になります。

```typescript
// 成功時
{
  "success": true,
  "data": { ... },         // 実際のデータ
  "timestamp": "2026-..."  // データの取得時刻
}

// 失敗時
{
  "success": false,
  "error": "人間が読めるエラーメッセージ"
}
```

**なぜ `timestamp` を含めるのか？**

リアルタイムモニターでは「このデータがいつ時点のものか」が重要です。
ネットワーク遅延で古いデータが届くこともあるため、タイムスタンプで判断できるようにします。

---

## 13.8 エラーハンドリング

ユーザーに表示するエラーメッセージは**内部情報を含まない**ようにします。

```typescript
// ❌ 危険: 内部構成を公開してしまう
return c.json({
  error: "192.168.1.50:8006 への接続がタイムアウトしました",
});

// ✅ 安全: 一般的なメッセージ
return c.json({
  error: "サーバー情報の取得に失敗しました",
});
```

内部の詳細は `console.error` でサーバー側のログに残して、フロントエンドには抽象的なメッセージだけを返します。

---

## 13.9 ディレクトリ構成まとめ

```
server/
├── src/
│   ├── index.ts           # エントリーポイント
│   ├── config.ts          # 環境変数の管理
│   ├── lib/
│   │   ├── proxmox.ts     # Proxmox API クライアント
│   │   └── sanitize.ts    # データサニタイズ関数
│   └── routes/
│       └── monitor.ts     # /api/monitor エンドポイント
├── .env                   # 環境変数（Gitに含めない）
├── package.json
└── tsconfig.json
```

---

## 13.10 開発時の動作確認

```bash
# サーバーを起動（ホットリロード付き）
cd server
pnpm dev

# 別のターミナルで API をテスト
curl http://localhost:3001/health
# → {"status":"ok","timestamp":"2026-..."}

curl http://localhost:3001/api/monitor/node
# → {"success":true,"data":{"cpuUsage":12.5,...},"timestamp":"..."}
```

---

## 13.11 この章のまとめ

### BFF の 3 つの責務

1. **認証の隔離** → API トークンをブラウザに渡さない
2. **データのサニタイズ** → IP アドレス・MAC アドレスを除去
3. **エラーの抽象化** → 内部構成を漏らさないエラーメッセージ

### Hono の利点

- TypeScript ファーストで型安全
- ミドルウェア（CORS, logger 等）が簡潔
- `@hono/node-server` で Node.js 上でも動作
- Web 標準 API（`fetch`, `Request`, `Response`）がベース

### セキュリティの原則

- **ホワイトリスト方式**: 必要なデータだけを選んで返す
- **最小権限**: PVEAuditor（読み取り専用）のみ
- **エラーの抽象化**: 内部情報をユーザーに見せない

---

次の章: [第14章: リアルタイムサーバーモニター](./14-realtime-monitor.md)
