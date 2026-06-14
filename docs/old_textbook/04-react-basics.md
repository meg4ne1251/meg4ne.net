# 第4章: React 入門

## この章で学ぶこと

- React の基本思想（宣言的UI）
- JSX / TSX の書き方
- コンポーネントと Props
- State（状態管理）と Hooks
- イベント処理
- このプロジェクトで React を使う具体的な場面

---

## 4.1 React とは何か

React は Meta（旧Facebook）が開発した **UI ライブラリ** です。「**宣言的（Declarative）**」にUIを記述できるのが最大の特徴です。

### 命令的 vs 宣言的

```javascript
// 命令的（Vanilla JavaScript）
// 「どうやって」UIを変更するかを手順として書く
const element = document.getElementById("status");
if (isOnline) {
  element.textContent = "稼働中";
  element.classList.remove("offline");
  element.classList.add("online");
} else {
  element.textContent = "停止中";
  element.classList.remove("online");
  element.classList.add("offline");
}
```

```tsx
// 宣言的（React）
// 「どう見えるべきか」を記述する。変更は React が自動で行う
function StatusBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <span className={isOnline ? "online" : "offline"}>
      {isOnline ? "稼働中" : "停止中"}
    </span>
  );
}
```

**Reactの方がシンプルな理由**: 「状態（データ）が変わったら、UIはこう見えるべき」と書くだけで、DOM の差分計算と更新は React が自動で行ってくれます。

### このプロジェクトで React を使う場面

要件定義書から抽出した、React が必要な箇所：

1. **テーマ切り替えボタン** - ユーザーのクリックでテーマを変更
2. **サーバーリソースモニター** - WebSocket でリアルタイムデータを受信・表示
3. **3Dモデルビューワー** - Three.js との連携、ユーザー操作（視点移動）
4. **サービス一覧のソート・フィルター** - タグ付けとソートのインタラクション
5. **ギャラリーのライトボックス** - 画像のクリックで拡大表示

---

## 4.2 JSX / TSX

### JSX とは

JSX は「**JavaScript の中に HTML を書ける構文**」です。TypeScript で書く場合はファイル拡張子が `.tsx` になります。

```tsx
// これが JSX（HTML のように見えるが、実は JavaScript）
const element = <h1>Hello, World!</h1>;

// ↑ は内部的にこう変換される
const element = React.createElement("h1", null, "Hello, World!");
```

### JSX の基本ルール

```tsx
function Example() {
  const name = "megane";

  return (
    // ルール1: 複数の要素は1つの親要素で囲む
    // <> と </> は Fragment（余計な DOM を作らない空のラッパー）
    <>
      {/* ルール2: JavaScript の式は {} で囲む */}
      <h1>Hello, {name}!</h1>

      {/* ルール3: class は className と書く（class は JS の予約語） */}
      <div className="container">

        {/* ルール4: style はオブジェクトで書く（文字列ではない） */}
        <p style={{ color: "red", fontSize: "1.2rem" }}>
          重要なメッセージ
        </p>

        {/* ルール5: 全てのタグは閉じる（HTML では省略可能な <br> も <br /> と書く） */}
        <br />
        <img src="/avatar.png" alt="アバター" />

        {/* ルール6: for は htmlFor と書く（for も JS の予約語） */}
        <label htmlFor="email">メール</label>
        <input id="email" type="email" />
      </div>
    </>
  );
}
```

---

## 4.3 コンポーネントと Props

### 関数コンポーネント

React コンポーネントは「UI の部品」を作る関数です。名前は**大文字始まり**にします。

```tsx
// src/components/SkillBadge.tsx

// Props（外部から受け取るデータ）の型定義
interface SkillBadgeProps {
  name: string;
  category: "language" | "framework" | "tool" | "3d";
}

// 関数コンポーネント
function SkillBadge({ name, category }: SkillBadgeProps) {
  // カテゴリごとに色を変える
  const colors: Record<string, string> = {
    language: "#61dafb",
    framework: "#764abc",
    tool: "#ff6b35",
    "3d": "#00d4aa",
  };

  return (
    <span
      style={{
        backgroundColor: colors[category],
        padding: "0.3rem 0.8rem",
        borderRadius: "4px",
        color: "#000",
        fontSize: "0.85rem",
        fontWeight: "bold",
      }}
    >
      {name}
    </span>
  );
}

// エクスポート（他のファイルから使えるようにする）
export default SkillBadge;
```

**使い方：**

```tsx
// 他のコンポーネントやページから
import SkillBadge from "./SkillBadge";

function SkillList() {
  return (
    <div>
      <SkillBadge name="TypeScript" category="language" />
      <SkillBadge name="React" category="framework" />
      <SkillBadge name="Docker" category="tool" />
      <SkillBadge name="Blender" category="3d" />
    </div>
  );
}
```

### children Props

```tsx
// 子要素を受け取るコンポーネント
interface CardProps {
  title: string;
  children: React.ReactNode;  // 子要素の型
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

// 使い方
<Card title="CPU使用率">
  <p>現在: 45.2%</p>
  <div className="progress-bar" />
</Card>
```

---

## 4.4 State（状態管理）

### useState Hook

「**状態（State）**」とは、コンポーネント内で時間とともに**変わりうるデータ**です。React では `useState` Hook を使って管理します。

```tsx
import { useState } from "react";

function ThemeToggle() {
  // useState は [現在の値, 更新する関数] を返す
  // "standard" は初期値
  const [theme, setTheme] = useState<"standard" | "terminal">("standard");

  const toggleTheme = () => {
    // setTheme で値を更新すると、コンポーネントが再描画される
    setTheme(theme === "standard" ? "terminal" : "standard");
  };

  return (
    <button onClick={toggleTheme}>
      現在のテーマ: {theme === "standard" ? "通常" : "ターミナル"}
    </button>
  );
}
```

### なぜ普通の変数ではダメなのか

```tsx
// ❌ これは動かない
function BadCounter() {
  let count = 0;

  return (
    <button onClick={() => { count++; }}>
      Count: {count}  {/* 画面は更新されない！ */}
    </button>
  );
}

// ✅ useState を使う
function GoodCounter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}  {/* クリックのたびに画面が更新される */}
    </button>
  );
}
```

**理由**: React は `setState`（`setCount`など）が呼ばれた時だけコンポーネントを再描画します。普通の変数を変更しても React はそれを検知できません。

### State の更新は「不変（Immutable）」に

```tsx
// ❌ 直接変更してはいけない
const [services, setServices] = useState(["Nginx", "Docker"]);
services.push("Gitea");  // ← 配列を直接変更している
setServices(services);    // ← React は変更を検知できない（同じ参照だから）

// ✅ 新しい配列を作って渡す
setServices([...services, "Gitea"]);  // スプレッド構文で新しい配列を作成
```

---

## 4.5 副作用（useEffect Hook）

「**副作用（Side Effect）**」とは、コンポーネントの描画以外の処理です。API通信、イベントリスナーの登録、タイマーのセットなどが該当します。

```tsx
import { useState, useEffect } from "react";

interface ServerStatus {
  cpuUsage: number;
  memoryUsage: number;
}

function ServerMonitor() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // useEffect: コンポーネントの描画後に実行される
  useEffect(() => {
    // API からサーバーステータスを取得
    async function fetchStatus() {
      try {
        const response = await fetch("/api/server/status");
        if (!response.ok) throw new Error("取得失敗");
        const data: ServerStatus = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "不明なエラー");
      }
    }

    fetchStatus();

    // 5秒ごとにデータを更新
    const interval = setInterval(fetchStatus, 5000);

    // クリーンアップ関数: コンポーネントが画面から消える時に実行
    // タイマーを止めないとメモリリークになる
    return () => clearInterval(interval);
  }, []);  // [] = マウント時に1回だけ実行

  if (error) return <p className="error">エラー: {error}</p>;
  if (!status) return <p>読み込み中...</p>;

  return (
    <div className="monitor">
      <p>CPU: {(status.cpuUsage * 100).toFixed(1)}%</p>
      <p>Memory: {(status.memoryUsage * 100).toFixed(1)}%</p>
    </div>
  );
}
```

### useEffect の依存配列

```tsx
// 1. マウント時に1回だけ実行
useEffect(() => {
  console.log("コンポーネントが表示された");
}, []);  // 空配列

// 2. 特定の値が変わるたびに実行
useEffect(() => {
  console.log(`テーマが ${theme} に変わった`);
  document.body.className = `theme-${theme}`;
}, [theme]);  // theme が変わるたびに実行

// 3. 毎回の描画後に実行（通常は使わない）
useEffect(() => {
  console.log("毎回実行される");
});  // 依存配列なし
```

> **よくある間違い**: 依存配列に入れるべき変数を入れ忘れると、古い値を参照し続けるバグ（stale closure）が発生します。ESLint の `react-hooks/exhaustive-deps` ルールがこれを検出してくれます。

---

## 4.6 イベント処理

```tsx
function InteractiveDemo() {
  const [inputValue, setInputValue] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // クリックイベント
  const handleClick = (tag: string) => {
    setSelectedTag(tag);
  };

  // 入力変更イベント
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // フォーム送信イベント
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();  // デフォルトのフォーム送信（ページリロード）を防ぐ
    console.log("送信:", inputValue);
  };

  const tags = ["web", "server", "docker", "network"];

  return (
    <div>
      {/* タグフィルター */}
      <div className="tags">
        {tags.map((tag) => (
          <button
            key={tag}   // リスト内の各要素には一意の key が必要
            className={tag === selectedTag ? "active" : ""}
            onClick={() => handleClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 検索フォーム */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="サービスを検索..."
        />
        <button type="submit">検索</button>
      </form>
    </div>
  );
}
```

### key プロパティ

リスト（`.map()` で描画するもの）の各要素には `key` が必要です：

```tsx
// ✅ 一意な key を設定
{services.map((service) => (
  <ServiceCard key={service.id} name={service.name} />
))}

// ❌ index を key にしない（ソートやフィルタでバグの原因になる）
{services.map((service, index) => (
  <ServiceCard key={index} name={service.name} />
))}
```

**なぜ key が必要か**: React は key を使って「どの要素が変わったか」を効率的に判定します。key がないと、リスト全体を再描画するため非効率になります。

---

## 4.7 カスタム Hook

同じロジックを複数のコンポーネントで使い回したい場合、**カスタム Hook** として切り出します。

```tsx
// src/hooks/useServerStatus.ts
import { useState, useEffect } from "react";

interface ServerStatus {
  nodeName: string;
  cpuUsage: number;
  memoryUsed: number;
  memoryTotal: number;
  status: "online" | "offline" | "unknown";
}

// カスタム Hook は use から始める命名規則
export function useServerStatus(refreshInterval: number = 5000) {
  const [servers, setServers] = useState<ServerStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;  // コンポーネントが生きているか確認用

    async function fetchStatus() {
      try {
        const response = await fetch("/api/servers/status");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: ServerStatus[] = await response.json();

        // コンポーネントが既にアンマウントされていたら state を更新しない
        if (isMounted) {
          setServers(data);
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "不明なエラー");
          setIsLoading(false);
        }
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshInterval]);

  return { servers, isLoading, error };
}
```

**使い方：**

```tsx
// どのコンポーネントからでも使える
function ServerDashboard() {
  const { servers, isLoading, error } = useServerStatus(3000);

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;

  return (
    <div>
      {servers.map((server) => (
        <div key={server.nodeName}>
          <h3>{server.nodeName}</h3>
          <p>CPU: {(server.cpuUsage * 100).toFixed(1)}%</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 4.8 React コンポーネントを Astro で使う

第3章で学んだ `client:*` ディレクティブを使って、React コンポーネントを Astro ページに組み込みます：

```astro
---
// src/pages/server/monitor.astro
import Layout from "../../layouts/Layout.astro";
import ServerMonitor from "../../components/ServerMonitor";  // .tsx
---

<Layout title="サーバーモニター">
  <h1>リアルタイムサーバーモニター</h1>
  <p>各ノードのリソース使用状況をリアルタイムで表示します。</p>

  <!-- client:load で即座に JavaScript をロード -->
  <ServerMonitor client:load />
</Layout>
```

### 注意点: Astro から React に Props を渡す

```astro
---
// Astro のフロントマターで定義したデータを React に渡せる
const initialTheme = "standard";
const apiEndpoint = "/api/servers/status";
---

<!-- ただし、渡せるのはシリアライズ可能な値のみ -->
<!-- ✅ 文字列、数値、配列、オブジェクト -->
<ServerMonitor
  client:load
  endpoint={apiEndpoint}
  refreshInterval={3000}
/>

<!-- ❌ 関数やクラスインスタンスは渡せない -->
```

---

## 4.9 この章のまとめと確認項目

### 理解度チェック

1. `useState` と普通の変数の違いは？
   → `useState` の setter を呼ぶと React がコンポーネントを再描画する

2. `useEffect` の依存配列が空 `[]` のとき、いつ実行される？
   → コンポーネントのマウント時（初回描画時）に1回だけ

3. `useEffect` のクリーンアップ関数は何のために使う？
   → タイマーやイベントリスナーなどを解除してメモリリークを防ぐ

4. リスト描画で `key` が必要な理由は？
   → React が差分を効率的に検出するため

5. カスタム Hook の命名規則は？
   → `use` から始まる名前にする（例: `useServerStatus`）

### 重要なポイントの復習

1. **React は宣言的UI** → 「どう見えるべきか」を書くだけで、DOMの更新は自動
2. **Props はコンポーネントへの入力** → 親から子に渡す読み取り専用のデータ
3. **State は変化するデータ** → `useState` で管理し、setter で更新
4. **useEffect は副作用の管理** → API通信やタイマーの設定
5. **カスタム Hook でロジックを共有** → 同じ処理を複数コンポーネントで使い回す

---

次の章: [第5章: プロジェクト初期化と構成](./05-project-init.md)
