# meg4ne.net

Astro + React + TypeScript で構築している個人サイトです。プロフィール、自宅サーバー構成、技術記事への導線をまとめています。

## Stack

- Astro 6
- React 18
- TypeScript
- Cloudflare Web Analytics
- npm

## Development

Node.js `22.12.0` 以上を使用します。

```sh
npm install
npm run dev
```

ローカル開発サーバーは既定で `http://localhost:4321` に起動します。

## Checks

```sh
npm run check
npm run lint
npm run format-check
npm run build
```

- `check`: Astro / TypeScript の型チェック
- `lint`: ESLint による静的解析
- `format-check`: Prettier のフォーマット確認
- `build`: 本番用の静的サイト生成

## Content

主要な表示データは [src/data/site.ts](src/data/site.ts) に集約しています。

- プロフィール、技術スタック、リンク
- ブログ記事リンク
- マシン構成、サービス一覧

ページは [src/pages](src/pages) に配置しています。

## Analytics

本番ビルドでは、環境変数 `PUBLIC_CF_ANALYTICS_TOKEN` が設定されている場合のみ Cloudflare Web Analytics のビーコンを読み込みます。解析ツールの利用方針は [src/pages/privacy.astro](src/pages/privacy.astro) に記載しています。

## Deployment

`npm run build` で `dist/` に静的ファイルを生成します。`astro.config.mjs` の `site` は `https://meg4ne.net` に設定されており、ビルド時に sitemap も生成されます。

## Maintenance

Dependabot は npm と GitHub Actions を週次で確認する設定です。依存関係更新のPRでは、上記の Checks を通してからマージします。
