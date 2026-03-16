# 第2章: TypeScript 入門

## この章で学ぶこと

- TypeScript とは何か、なぜ使うのか
- 基本的な型（プリミティブ型、オブジェクト型、配列型）
- 関数の型付け
- インターフェースと型エイリアス
- ジェネリクスの基礎
- このプロジェクトで特に使う型パターン

---

## 2.1 TypeScript とは何か

TypeScript は、JavaScript に**静的型付け**を追加した言語です。Microsoft が開発しています。

```typescript
// JavaScript：実行するまでバグが分からない
function greet(name) {
  return "Hello, " + name.toUpperCase();
}
greet(42); // 実行時にエラー: name.toUpperCase is not a function

// TypeScript：コードを書いた瞬間にエラーが分かる
function greet(name: string): string {
  return "Hello, " + name.toUpperCase();
}
greet(42); // ← エディタ上で赤線が表示される（コンパイルエラー）
```

### なぜ TypeScript を使うのか

1. **バグの早期発見**: 実行前（コンパイル時）にエラーを検出できる
2. **自動補完が賢くなる**: 型情報により VS Code が正確な補完を提供
3. **ドキュメントとしての型**: 関数の引数や戻り値の型が、そのまま仕様書になる
4. **リファクタリングの安全性**: 変数名や関数名を変更した時、影響範囲を自動検出

要件定義書で「**TypeScript (Hono または Fastify)**」が指定されているのは、フロントエンド（Astro + React）とバックエンド（API）で**型定義を共有**できるためです。例えば、サーバーモニターの API レスポンスの型を一箇所で定義すれば、フロントとバック両方でその型を使い回せます。

### TypeScript の動作の仕組み

```
TypeScript (.ts) ──[tsc / Astroビルド]──→ JavaScript (.js) ──→ ブラウザで実行
                    ↑ ここで型チェック
```

ブラウザは TypeScript を直接理解できないので、TypeScript は最終的に JavaScript に変換（トランスパイル）されます。型の情報は変換時に除去されるため、実行時のパフォーマンスに影響はありません。

---

## 2.2 基本的な型

### プリミティブ型（基本型）

```typescript
// 文字列型
let siteName: string = "meg4ne.net";

// 数値型（整数も小数も同じ number 型）
let cpuUsage: number = 45.2;

// 真偽値型
let isOnline: boolean = true;

// null と undefined
let maybeValue: string | null = null;  // 「文字列 または null」
```

### 型推論（Type Inference）

TypeScript は賢いので、明らかな場合は型を書かなくても推論してくれます：

```typescript
// 型を書かなくても string 型と推論される
let siteName = "meg4ne.net";

// 以下は不要（冗長）
let siteName: string = "meg4ne.net";  // ← 型注釈がなくても同じ
```

**方針**: 推論できる場所は型注釈を省略し、関数の引数や戻り値は明示的に書く。

### 配列型

```typescript
// 方法1: 型名の後ろに []
let skills: string[] = ["TypeScript", "Python", "Docker"];

// 方法2: Array<型名>（ジェネリクス構文）
let scores: Array<number> = [90, 85, 92];

// 実際のプロジェクトでの例：サービス一覧
let services: string[] = ["Nginx", "Gitea", "Proxmox VE"];
```

### オブジェクト型

```typescript
// オブジェクトリテラルの型定義
let server: {
  name: string;
  cpu: number;
  memory: number;
  isRunning: boolean;
} = {
  name: "Kaga",
  cpu: 4,
  memory: 8192,
  isRunning: true,
};
```

---

## 2.3 インターフェースと型エイリアス

オブジェクトの型を毎回書くのは大変です。名前を付けて再利用しましょう。

### interface（インターフェース）

```typescript
// サーバーリソースの型定義
interface ServerResource {
  nodeName: string;
  cpuUsage: number;      // 0.0 ~ 1.0（パーセンテージ）
  memoryUsed: number;    // bytes
  memoryTotal: number;   // bytes
  diskUsed: number;      // bytes
  diskTotal: number;     // bytes
  uptime: number;        // seconds
  status: "running" | "stopped" | "unknown";  // リテラル型の Union
}

// 使い方
function displayResource(resource: ServerResource): void {
  const cpuPercent = (resource.cpuUsage * 100).toFixed(1);
  console.log(`${resource.nodeName}: CPU ${cpuPercent}%`);
}
```

### type（型エイリアス）

```typescript
// type でも同じことができる
type VMStatus = "running" | "stopped" | "paused" | "unknown";

type VirtualMachine = {
  vmid: number;
  name: string;
  status: VMStatus;
  description?: string;  // ? はオプショナル（あってもなくてもいい）
};
```

### interface vs type：どちらを使う？

| 特徴 | interface | type |
|---|---|---|
| オブジェクトの型定義 | ✅ | ✅ |
| extends（拡張） | ✅ `extends` キーワード | ✅ `&`（交差型） |
| Union 型 | ❌ | ✅ `string \| number` |
| 同名定義のマージ | ✅（自動マージ） | ❌（エラー） |

**このプロジェクトでの方針**:
- **オブジェクトの型** → `interface`
- **Union 型やユーティリティ型** → `type`

```typescript
// interface: APIレスポンスなどオブジェクトの形を定義
interface ApiResponse {
  success: boolean;
  data: ServerResource[];
  timestamp: number;
}

// type: Union型（複数の値のいずれか）を定義
type Theme = "standard" | "terminal";
type ButtonVariant = "primary" | "secondary" | "danger";
```

---

## 2.4 関数の型付け

### 基本的な関数の型

```typescript
// 引数と戻り値に型をつける
function calculateMemoryUsage(used: number, total: number): number {
  return (used / total) * 100;
}

// アロー関数（モダンな書き方、React コンポーネントで多用する）
const calculateMemoryUsage = (used: number, total: number): number => {
  return (used / total) * 100;
};

// 戻り値がない関数は void
function logMessage(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`);
}
```

### オプショナル引数とデフォルト値

```typescript
// ? でオプショナル引数
function formatBytes(bytes: number, decimals?: number): string {
  const d = decimals ?? 2;  // ?? は null/undefined の時のデフォルト値
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(d)) + " " + sizes[i];
}

formatBytes(1073741824);     // "1 GB"
formatBytes(1073741824, 3);  // "1.000 GB"

// デフォルト値を設定する書き方もある
function formatBytes(bytes: number, decimals: number = 2): string {
  // ...
}
```

### 非同期関数（Promise）

API通信など、結果が返ってくるまで時間がかかる処理には `async/await` を使います：

```typescript
// Promise<戻り値の型> と書く
async function fetchServerStatus(): Promise<ServerResource[]> {
  const response = await fetch("/api/servers");
  const data = await response.json();
  return data;
}
```

> **なぜ async/await？**: ネットワーク通信は完了まで時間がかかります。`async/await` を使うと、「通信が完了するまで待ってから次の行を実行する」という非同期処理を、同期的なコードのように読みやすく書けます。

---

## 2.5 Union 型と Narrowing

### Union 型

「AまたはB」を表現する型です。テーマ切り替えやステータス管理で頻繁に使います：

```typescript
// テーマ切り替え（要件定義書より）
type Theme = "standard" | "terminal";

function applyTheme(theme: Theme): void {
  if (theme === "standard") {
    // 黒ベースのテーマを適用
    document.body.className = "theme-standard";
  } else {
    // ターミナル風テーマを適用
    document.body.className = "theme-terminal";
  }
}
```

### Narrowing（型の絞り込み）

Union 型の変数を使うとき、TypeScript はどの型かを判別して安全に使わせてくれます：

```typescript
type ApiResult = 
  | { success: true; data: ServerResource[] }
  | { success: false; error: string };

function handleResult(result: ApiResult): void {
  if (result.success) {
    // ここでは result.data が使える（TypeScript が型を絞り込む）
    console.log(`${result.data.length} servers found`);
  } else {
    // ここでは result.error が使える
    console.error(`Error: ${result.error}`);
  }
}
```

---

## 2.6 ジェネリクス（Generics）

「型を引数として受け取る」仕組みです。再利用可能な関数やコンポーネントを作るのに使います。

```typescript
// ジェネリクスなし：型ごとに同じ関数を書く必要がある
function getFirst_string(arr: string[]): string | undefined {
  return arr[0];
}
function getFirst_number(arr: number[]): number | undefined {
  return arr[0];
}

// ジェネリクスあり：1つの関数で全ての型に対応
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

getFirst<string>(["hello", "world"]);  // 戻り値は string | undefined
getFirst<number>([1, 2, 3]);           // 戻り値は number | undefined
getFirst(["hello", "world"]);          // 型引数を省略しても推論される
```

### 実際のプロジェクトでの使用例

```typescript
// APIレスポンスの共通ラッパー
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: number;
}

// サーバーリソース取得時
type ServerListResponse = ApiResponse<ServerResource[]>;
// {
//   success: boolean;
//   data: ServerResource[];
//   timestamp: number;
// }

// VM情報取得時
type VMDetailResponse = ApiResponse<VirtualMachine>;
// {
//   success: boolean;
//   data: VirtualMachine;
//   timestamp: number;
// }
```

---

## 2.7 ユーティリティ型

TypeScript には、既存の型を変換するための組み込みユーティリティ型があります。

```typescript
interface ServerConfig {
  hostname: string;
  port: number;
  ssl: boolean;
  timeout: number;
}

// Partial<T>: 全てのプロパティをオプショナルに
type PartialConfig = Partial<ServerConfig>;
// {
//   hostname?: string;
//   port?: number;
//   ssl?: boolean;
//   timeout?: number;
// }
// → 設定の一部だけを更新する関数の引数に便利

// Pick<T, Keys>: 特定のプロパティだけを抽出
type ServerIdentity = Pick<ServerConfig, "hostname" | "port">;
// {
//   hostname: string;
//   port: number;
// }

// Omit<T, Keys>: 特定のプロパティを除外
type PublicConfig = Omit<ServerConfig, "timeout">;
// {
//   hostname: string;
//   port: number;
//   ssl: boolean;
// }

// Record<Keys, Type>: キーと値の型を指定したオブジェクト
type ServiceStatus = Record<string, "running" | "stopped">;
// {
//   [key: string]: "running" | "stopped";
// }
const status: ServiceStatus = {
  nginx: "running",
  api: "running",
  monitoring: "stopped",
};
```

---

## 2.8 このプロジェクトで使う型の設計例

要件定義書の内容に基づいて、実際にプロジェクトで使うことになる型を見てみましょう：

```typescript
// ===== テーマ関連 =====
type Theme = "standard" | "terminal";

// ===== 自己紹介 =====
interface Profile {
  name: string;
  handleName: string;
  university: string;
  club: string;
  hobbies: string[];
  certifications: string[];
  skills: Skill[];
}

interface Skill {
  name: string;
  category: "language" | "framework" | "tool" | "3d" | "other";
  level?: "beginner" | "intermediate" | "advanced";
}

// ===== 計算機構成 =====
interface PhysicalHost {
  name: string;
  type: "desktop" | "laptop" | "server";
  cpu: string;
  memory: string;
  storage: string;
  description?: string;
}

// ===== サーバーモニター =====
// フロントエンドに公開する「サニタイズ済み」データの型
// ※ IPアドレスやMACアドレスは含めない（セキュリティ要件）
interface SanitizedNodeStatus {
  nodeName: string;       // 艦名（例: "Kaga"）
  role: string;           // 役割（例: "旗艦 = メインルーター"）
  cpuUsage: number;       // 0.0 ~ 1.0
  memoryUsed: number;     // bytes
  memoryTotal: number;    // bytes
  diskUsed: number;       // bytes
  diskTotal: number;      // bytes
  uptime: number;         // seconds
  status: "online" | "offline" | "unknown";
}

// ===== ネーミングコンベンション =====
interface ShipNaming {
  vmName: string;         // VM名（例: "Kaga"）
  shipClass: string;      // 艦種（例: "航空母艦"）
  origin: string;         // 由来（例: "加賀国に由来"）
  role: string;           // サーバーとしての役割
  description: string;    // 解説
}

// ===== 制作物 =====
interface Work {
  title: string;
  description: string;
  tags: string[];
  url?: string;
  repositoryUrl?: string;
  thumbnailPath: string;
  createdAt: string;      // ISO 8601 形式
}

// ===== ブログアクセスパネル =====
type BlogPlatform = "qiita" | "note" | "zenn";

interface BlogPost {
  platform: BlogPlatform;
  title: string;
  url: string;
  publishedAt: string;
  tags?: string[];
}
```

---

## 2.9 tsconfig.json の基本

`tsconfig.json` は TypeScript コンパイラの設定ファイルです。Astro プロジェクトを作成すると自動生成されますが、各設定の意味を理解しておくと、エラーが出た時に対処しやすくなります。

```jsonc
{
  "extends": "astro/tsconfigs/strict",  // Astro推奨の厳格設定を継承
  "compilerOptions": {
    // --- 型チェックの厳格さ ---
    "strict": true,           // 全ての厳格チェックを有効化
    "noUncheckedIndexedAccess": true,  // 配列やオブジェクトのアクセス時に undefined の可能性を考慮

    // --- モジュール解決 ---
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]        // @ で src/ を参照できるエイリアス
    },

    // --- 出力設定 ---
    "jsx": "react-jsx"        // React の JSX 構文を使用
  },
  "include": ["src/**/*", "astro.config.mjs"],
  "exclude": ["node_modules", "dist"]
}
```

> **`strict: true` について**: 初心者は「厳しすぎる」と感じるかもしれませんが、**最初から `strict: true` で始めることを強く推奨**します。後から厳格にするのは大変ですが、最初から厳格なら型の恩恵を最大限に受けられます。

---

## 2.10 この章のまとめと確認項目

### 理解度チェック

以下の質問に答えられれば、この章の内容は十分理解できています：

1. `string | null` はどういう意味？
   → 「文字列型 または null」を取りうる Union 型

2. `interface` と `type` の使い分けは？
   → オブジェクトの形は `interface`、Union型は `type`

3. `?` が付いたプロパティは何を意味する？
   → オプショナル（省略可能）

4. ジェネリクス `<T>` はなぜ使う？
   → 型を引数化して再利用可能なコードを書くため

5. `async/await` はなぜ必要？
   → API通信などの非同期処理を読みやすく書くため

### 重要なポイントの復習

1. **TypeScript はコンパイル時にエラーを検出する** → 実行前にバグを発見
2. **型推論を活用する** → 明らかな場所は型注釈を省略して可読性を上げる
3. **Union 型でステータスやテーマを表現** → 不正な値を型レベルで防ぐ
4. **ジェネリクスで再利用可能な型を作る** → APIレスポンスの共通ラッパーなど
5. **`strict: true` を最初から使う** → 型の恩恵を最大限に受ける

---

次の章: [第3章: Astro 入門](./03-astro-basics.md)
