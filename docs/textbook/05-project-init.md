# 第5章: プロジェクト初期化と構成

## この章で学ぶこと

- Astro プロジェクトの作成手順
- React インテグレーションの追加
- ディレクトリ構成の設計と各ディレクトリの役割
- ESLint / Prettier の設定（コード品質ツール）
- package.json のスクリプト設計

---

## 5.1 Astro プロジェクトの作成

### 既存リポジトリへの Astro 導入

あなたのリポジトリには既に `index.html` や `docs/` があります。Astro プロジェクトを初期化すると、これらを Astro の構成に移行することになります。

```bash
# 現在のディレクトリで Astro プロジェクトを作成
# ※ 既存ファイルがある場合、上書き確認が出る
pnpm create astro@latest .

# 対話型セットアップが始まる:
# - How would you like to start a new project? → Empty（空プロジェクト）
# - Do you plan to write TypeScript? → Yes
# - How strict should TypeScript be? → Strict（推奨）
# - Install dependencies? → Yes
# - Initialize a git repository? → No（既にある）
```

> **なぜ Empty テンプレートを選ぶのか？**: テンプレートを使うと便利ですが、構造を理解せずに進んでしまいます。学習目的なので、白紙から自分で構築しましょう。

### React インテグレーションの追加

```bash
# Astro 公式の React インテグレーションを追加
pnpm astro add react

# これにより以下が自動で行われる:
# 1. @astrojs/react, react, react-dom のインストール
# 2. astro.config.mjs に react() の追加
# 3. tsconfig.json に JSX 設定の追加
```

### 初期ファイルの移行

Astro プロジェクトが作成されたら、既存の `index.html` の内容を `src/pages/index.astro` に移行します：

```astro
---
// src/pages/index.astro
// 既存の index.html の内容を Astro 形式に変換
---

<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>meganeのホームページ</title>
  </head>
  <body>
    <h1>meganeだよ！！</h1>
    <p>電気通信大学にいるよ！！！</p>
    <p>モデルを作ってるよ！！！！</p>
    <p>自宅サーバーを運用しているよ！！！！</p>
  </body>
</html>
```

そして、元の `index.html` は削除します（Astro が `src/pages/index.astro` からビルドするため）。

---

## 5.2 ディレクトリ構成の設計

Astro プロジェクトの標準的な構成に、要件定義書の要素を反映したディレクトリ設計です：

```
meg4ne.net/
├── .github/                    # GitHub 設定
│   ├── workflows/              # GitHub Actions ワークフロー
│   │   └── ci.yml              # CI パイプライン
│   ├── dependabot.yml          # 依存関係の自動更新設定
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .vscode/                    # VS Code 設定（チーム共有）
│   ├── settings.json
│   └── extensions.json
│
├── docs/                       # ドキュメント
│   ├── requirements.md         # 要件定義書
│   └── textbook/               # この教科書
│
├── public/                     # 静的アセット（そのままコピーされる）
│   ├── assets/                 # 画像・3Dモデル等
│   │   ├── images/             # 写真・スクリーンショット
│   │   └── models/             # .glb ファイル
│   ├── favicon.svg             # ファビコン
│   └── robots.txt              # 検索エンジン制御
│
├── src/                        # ソースコード本体
│   ├── components/             # UI コンポーネント
│   │   ├── common/             # 共通コンポーネント
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Navigation.astro
│   │   │   └── ThemeToggle.tsx  # React（インタラクティブ）
│   │   ├── server/             # サーバー関連
│   │   │   ├── ServerMonitor.tsx
│   │   │   ├── ServiceTable.tsx
│   │   │   └── ResourceGauge.tsx
│   │   ├── works/              # 制作物関連
│   │   │   └── WorkCard.astro
│   │   ├── viewer/             # 3Dビューワー
│   │   │   └── ModelViewer.tsx
│   │   └── blog/               # ブログ関連
│   │       └── BlogPanel.tsx
│   │
│   ├── layouts/                # レイアウトコンポーネント
│   │   └── Layout.astro        # 共通レイアウト（html, head, body）
│   │
│   ├── pages/                  # ページ（ファイルベースルーティング）
│   │   ├── index.astro         # /
│   │   ├── about.astro         # /about
│   │   ├── works.astro         # /works
│   │   ├── links.astro         # /links
│   │   ├── privacy.astro       # /privacy（プライバシーポリシー）
│   │   ├── computer/
│   │   │   ├── index.astro     # /computer
│   │   │   ├── network.astro   # /computer/network
│   │   │   └── naming.astro    # /computer/naming
│   │   ├── server/
│   │   │   ├── index.astro     # /server
│   │   │   ├── monitor.astro   # /server/monitor
│   │   │   └── services.astro  # /server/services
│   │   ├── activities/
│   │   │   ├── index.astro     # /activities
│   │   │   └── gallery.astro   # /activities/gallery
│   │   └── blog/
│   │       ├── index.astro     # /blog
│   │       └── [slug].astro    # /blog/:slug
│   │
│   ├── content/                # コンテンツ（Markdown）
│   │   ├── config.ts           # Content Collections 設定
│   │   └── blog/               # 運用記の Markdown ファイル
│   │       ├── first-post.md
│   │       └── server-update.md
│   │
│   ├── styles/                 # グローバルスタイル
│   │   ├── global.css          # 全体のリセット・基盤スタイル
│   │   ├── themes/
│   │   │   ├── standard.css    # 通常テーマ（黒ベース）
│   │   │   └── terminal.css    # ターミナル風テーマ
│   │   └── variables.css       # CSS カスタムプロパティ（色、サイズ等）
│   │
│   ├── hooks/                  # React カスタム Hooks
│   │   ├── useServerStatus.ts
│   │   └── useTheme.ts
│   │
│   ├── lib/                    # ユーティリティ関数
│   │   ├── formatBytes.ts      # バイト数のフォーマット
│   │   ├── fetchRSS.ts         # RSS フィード取得
│   │   └── api.ts              # API クライアント
│   │
│   ├── types/                  # 型定義
│   │   ├── server.ts           # サーバー関連の型
│   │   ├── content.ts          # コンテンツ関連の型
│   │   └── theme.ts            # テーマ関連の型
│   │
│   └── data/                   # 静的データ（JSON / TS）
│       ├── profile.ts          # プロフィール情報
│       ├── skills.ts           # 技術スタック
│       ├── computers.ts        # 計算機構成
│       └── ships.ts            # ネーミングコンベンション
│
├── server/                     # バックエンド API（別パッケージ）
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts            # エントリポイント
│   │   ├── routes/
│   │   │   └── servers.ts      # サーバーモニター API
│   │   └── lib/
│   │       ├── proxmox.ts      # Proxmox API クライアント
│   │       └── sanitize.ts     # データサニタイズ
│   └── Dockerfile
│
├── docker/                     # Docker 関連設定
│   ├── nginx/
│   │   └── nginx.conf
│   └── Dockerfile.frontend     # フロントエンド用
│
├── astro.config.mjs            # Astro 設定
├── tsconfig.json               # TypeScript 設定
├── package.json                # パッケージ管理
├── pnpm-lock.yaml              # 依存関係ロックファイル
├── .prettierrc                 # Prettier 設定
├── eslint.config.js            # ESLint 設定（Flat Config）
├── .editorconfig               # エディタ設定
├── .gitignore                  # Git 除外設定
├── .env.example                # 環境変数テンプレート（秘密情報は含めない）
├── docker-compose.yml          # Docker Compose 設定
└── README.md
```

### 各ディレクトリの役割を理解する

| ディレクトリ | 役割 | 重要な注意 |
|---|---|---|
| `public/` | ビルド時にそのままコピーされるファイル | 画像は Astro Image で最適化する場合は `src/` に置く |
| `src/pages/` | URL に対応するページ | ファイル名 = URL パス |
| `src/components/` | 再利用可能なUIパーツ | `.astro` = 静的、`.tsx` = インタラクティブ |
| `src/layouts/` | ページの共通レイアウト | `<head>` や `<footer>` を統一 |
| `src/content/` | Markdown コンテンツ | Content Collections で型安全に管理 |
| `src/styles/` | CSS ファイル | テーマ定義やグローバルスタイル |
| `src/data/` | TypeScript で書く静的データ | プロフィールやスキル情報 |
| `src/types/` | 型定義 | フロントとバックで共有可能 |
| `src/lib/` | ユーティリティ関数 | バイト変換やAPI呼び出しなど |
| `server/` | バックエンドAPI | フロントとは別パッケージ |

---

## 5.3 ESLint の設定

ESLint は「**コードの品質をチェック**」するツール（Linter）です。バグの原因になる書き方や、一貫性のないコードスタイルを自動検出します。

### なぜ Linter が必要か

```typescript
// ESLint が検出してくれる問題の例:

// 1. 未使用の変数（使わないなら消すべき）
const unusedVariable = "hello";  // ← 警告

// 2. == ではなく === を使うべき
if (status == "online") { ... }  // ← 警告（型の不一致で予期しない結果になる）

// 3. console.log の消し忘れ
console.log("debug:", data);  // ← 本番コードに残すべきでない

// 4. React Hooks のルール違反
if (condition) {
  useState(0);  // ← エラー（Hooks は条件分岐の中で使ってはいけない）
}
```

### Flat Config（ESLint v9+）のセットアップ

```bash
# ESLint と関連パッケージをインストール
pnpm add -D eslint @eslint/js typescript-eslint eslint-plugin-astro eslint-plugin-react-hooks@^5.0.0
```

> **注意**: `eslint-plugin-react-hooks` は v5 以降で Flat Config に対応しています。v5 未満を使う場合は互換レイヤーが必要になるため、必ず v5 以上を指定してください。`eslint-plugin-react` は Flat Config 対応が不完全な場合があるため、ここでは `react-hooks` のみを使用しています。

> **`-D` フラグ**: `devDependencies`（開発時のみ使うパッケージ）としてインストールします。ESLint は本番環境では不要なので。

```javascript
// eslint.config.js（ESLint v9+ の Flat Config 形式）
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // 基本的な JavaScript ルール
  js.configs.recommended,

  // TypeScript ルール
  ...tseslint.configs.recommended,

  // Astro ルール
  ...astro.configs.recommended,

  // React Hooks 設定
  {
    files: ["**/*.{tsx,jsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // プロジェクト全体の追加ルール
  {
    rules: {
      "no-console": "warn",  // console.log を警告（本番では消すべき）
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },  // _ で始まる引数は無視
      ],
    },
  },

  // 除外設定
  {
    ignores: ["dist/", ".astro/", "node_modules/"],
  },
];
```

---

## 5.4 Prettier の設定

Prettier は「**コードの自動整形**」を行うツール（Formatter）です。ESLint とは役割が異なります。

| ツール | 役割 | 例 |
|---|---|---|
| **ESLint** | コードの品質（バグ防止） | 未使用変数の検出、Hooks ルールの遵守 |
| **Prettier** | コードの見た目（統一性） | インデント、引用符、行の長さ |

```bash
# Prettier と Astro 用プラグインをインストール
pnpm add -D prettier prettier-plugin-astro
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-astro"],
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"
      }
    }
  ]
}
```

**各設定の意味：**

| 設定 | 値 | 意味 |
|---|---|---|
| `semi` | `true` | 文末にセミコロンを付ける |
| `singleQuote` | `false` | ダブルクォートを使う（`"hello"`） |
| `tabWidth` | `2` | インデントはスペース2つ |
| `trailingComma` | `"all"` | 末尾カンマを付ける（Git 差分がきれいになる） |
| `printWidth` | `100` | 1行あたりの最大文字数 |

### 末尾カンマ（trailingComma）がなぜ大切か

```javascript
// trailingComma なし → 要素を追加すると2行変更される
const skills = [
  "TypeScript",
- "React"
+ "React",       ← この行も差分に出る
+ "Docker"
];

// trailingComma あり → 追加した1行だけが差分になる
const skills = [
  "TypeScript",
  "React",
+ "Docker",      ← この行だけ差分
];
```

Git の差分がきれいになり、コードレビューが楽になります。

```
# .prettierignore（Prettier が整形しないファイル）
dist/
.astro/
node_modules/
pnpm-lock.yaml
```

---

## 5.5 package.json のスクリプト設計

`package.json` の `scripts` にコマンドを定義し、`pnpm <script名>` で実行できるようにします：

```json
{
  "name": "meg4ne-net",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "check": "astro check",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "ci": "pnpm lint && pnpm format:check && pnpm type-check && pnpm build"
  }
}
```

**各スクリプトの役割：**

| スクリプト | コマンド | 役割 |
|---|---|---|
| `dev` | `pnpm dev` | 開発サーバー起動（ホットリロード付き） |
| `build` | `pnpm build` | 本番ビルド（HTML/CSS/JS 生成） |
| `preview` | `pnpm preview` | ビルド結果のプレビュー |
| `check` | `pnpm check` | Astro の型チェック |
| `lint` | `pnpm lint` | ESLint によるコード品質チェック |
| `lint:fix` | `pnpm lint:fix` | ESLint の自動修正 |
| `format` | `pnpm format` | Prettier によるコード整形 |
| `format:check` | `pnpm format:check` | 整形されていないコードの検出 |
| `type-check` | `pnpm type-check` | TypeScript の型チェック |
| `ci` | `pnpm ci` | CI で実行する全チェック |

> **`ci` スクリプト**: 要件定義書で「チェック項目: build, lint, type-check, format-check」と指定されています。これをローカルで事前に実行して問題がないことを確認してから Push するのがベストプラクティスです。

---

## 5.6 環境変数の管理

### .env ファイルの設計

要件定義書で「APIキーや個人情報の管理に注意する（`.env`利用など）」と明記されています。

```bash
# .env.example（Git に含める。値は空またはダミー）
# このファイルを .env にコピーして、実際の値を入れて使う

# Proxmox API（監視用API が使う）
PROXMOX_API_URL=https://your-proxmox:8006
PROXMOX_API_TOKEN_ID=user@pam!token-name
PROXMOX_API_TOKEN_SECRET=your-api-token-secret

# サイト設定
SITE_URL=https://meg4ne.net
```

```bash
# .env（Git に含めない！.gitignore に記載済み）
PROXMOX_API_URL=https://192.168.1.100:8006
PROXMOX_API_TOKEN_ID=monitor@pve!readonly
PROXMOX_API_TOKEN_SECRET=abcdef12-3456-7890-abcd-ef1234567890
SITE_URL=https://meg4ne.net
```

### Astro での環境変数の使い方

```typescript
// サーバーサイド（フロントマターやAPIルート）でアクセス
// import.meta.env.変数名
const apiUrl = import.meta.env.PROXMOX_API_URL;

// ⚠️ クライアントサイド（ブラウザ）で使いたい場合は PUBLIC_ プレフィックスが必要
// ただし、ブラウザに公開されるので秘密情報は絶対に PUBLIC_ にしない！
const siteUrl = import.meta.env.PUBLIC_SITE_URL;  // OK（公開情報）
// const token = import.meta.env.PUBLIC_API_TOKEN;  // ❌ 絶対ダメ！
```

---

## 5.7 この章のまとめと確認項目

### 実行チェックリスト

以下の操作が全て成功すれば、プロジェクトの初期化は完了です：

```bash
# 1. 開発サーバーが起動するか
pnpm dev
# → http://localhost:4321 でページが表示される

# 2. ビルドが成功するか
pnpm build
# → dist/ ディレクトリに HTML ファイルが生成される

# 3. Lint が通るか
pnpm lint
# → エラーが出ない

# 4. 型チェックが通るか
pnpm type-check
# → エラーが出ない

# 5. フォーマットチェックが通るか
pnpm format:check
# → エラーが出ない
```

### この章で作成・設定したファイル

```
meg4ne.net/
├── src/
│   └── pages/
│       └── index.astro       # 最初のページ
├── astro.config.mjs          # Astro 設定
├── tsconfig.json             # TypeScript 設定
├── package.json              # パッケージ＆スクリプト
├── eslint.config.js          # ESLint 設定（Flat Config 形式）
├── .prettierrc               # Prettier 設定
├── .prettierignore           # Prettier 除外
├── .env.example              # 環境変数テンプレート
└── .gitignore                # Git 除外（更新）
```

### 重要なポイントの復習

1. **Empty テンプレートから始める** → 構造を理解しながら構築する
2. **ディレクトリ設計は最初に考える** → 後から変更するとインポートパスの修正が大変
3. **ESLint（品質）と Prettier（整形）は両方使う** → 役割が異なる
4. **`ci` スクリプトをローカルで実行してから Push** → CI の失敗を未然に防ぐ
5. **`PUBLIC_` プレフィックスのない環境変数はクライアントに露出しない** → セキュリティの基本

---

次の章: [第6章: レイアウトとルーティング](./06-layout-routing.md)
