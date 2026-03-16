# 第18章: Cloudflare Tunnel & Web Analytics

## この章で学ぶこと

- Cloudflare Tunnel の仕組みと設定
- ポート開放なしでの安全な公開方法
- Cloudflare Web Analytics の導入
- プライバシーポリシーの記述

---

## 18.1 Cloudflare Tunnel とは

Cloudflare Tunnel（旧称 Argo Tunnel）は、自宅サーバーを**ポート開放なし・固定IP なし**でインターネットに公開する仕組みです。

### 従来の方式 vs Cloudflare Tunnel

```
従来の方式:
  インターネット → ルーターのポート開放(80/443) → サーバー
  問題:
    ・ポートを開ける = 攻撃の入口を作る
    ・固定IPが必要（または DDNS）
    ・DDoS 攻撃を直接受ける

Cloudflare Tunnel:
  インターネット → Cloudflare Edge → ── Tunnel ──→ サーバー
  利点:                                   (outbound)
    ・ポート開放不要（サーバー側から外向きに接続するだけ）
    ・Cloudflare の DDoS 防御が自動適用
    ・SSL 証明書も自動（Cloudflare が管理）
```

**キーポイント**: Tunnel は「内側から外側への接続（アウトバウンド）」です。ファイアウォールに穴を開ける必要がありません。

---

## 18.2 Cloudflare Tunnel のセットアップ

### 前提条件

1. Cloudflare アカウントを作成済み
2. ドメイン（meg4ne.net）の DNS を Cloudflare に移管済み

### 手順 1: cloudflared のインストール

```bash
# 自宅サーバー（VM）で実行
# Debian/Ubuntu の場合
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

### 手順 2: Cloudflare にログイン

```bash
cloudflared tunnel login
# ブラウザが開くので、ドメインを選択して認証
# → ~/.cloudflared/cert.pem が生成される
```

### 手順 3: Tunnel の作成

```bash
cloudflared tunnel create meg4ne-tunnel
# → Tunnel ID が表示される（例: a1b2c3d4-...）
# → ~/.cloudflared/ に認証ファイルが生成される
```

### 手順 4: 設定ファイルの作成

```yaml
# ~/.cloudflared/config.yml
tunnel: a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx  # Tunnel ID
credentials-file: /home/user/.cloudflared/a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json

ingress:
  # meg4ne.net へのリクエストを Nginx コンテナに転送
  - hostname: meg4ne.net
    service: http://localhost:80

  # ワイルドカード（上記に該当しないリクエスト）
  - service: http_status:404
```

### 手順 5: DNS レコードの設定

```bash
cloudflared tunnel route dns meg4ne-tunnel meg4ne.net
# → Cloudflare DNS に CNAME レコードが自動追加される
# meg4ne.net → a1b2c3d4-xxxx.cfargotunnel.com
```

### 手順 6: Tunnel の起動

```bash
# 手動起動（テスト用）
cloudflared tunnel run meg4ne-tunnel

# システムサービスとして登録（自動起動）
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

---

## 18.3 Docker Compose での cloudflared

Docker Compose でまとめて管理する方法もあります。

```yaml
# docker-compose.yml に追加
services:
  # ... 他のサービス ...

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: meg4ne-cloudflared
    restart: unless-stopped
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - web
```

Cloudflare の Zero Trust ダッシュボードで Tunnel を作成し、トークンを `.env` に設定する方法が最も簡単です。

```bash
# .env
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoixxx...
```

---

## 18.4 通信の流れ

```
ユーザーのブラウザ
    │
    ▼
Cloudflare Edge（最寄りのデータセンター）
    │  ・SSL 終端
    │  ・DDoS 防御
    │  ・CDN キャッシュ
    │
    ▼（暗号化されたトンネル）
cloudflared（自宅サーバー上）
    │
    ▼
Nginx（:80）
    │
    ├──▶ フロントエンド（Astro）
    └──▶ API サーバー（Hono）
```

---

## 18.5 Cloudflare Web Analytics

要件定義書の記載:
> **ツール**: Cloudflare Web Analytics (プライバシー重視)
> **義務**: サイト内にプライバシーポリシーを記述し、解析ツールの利用を明示する。

### なぜ Cloudflare Web Analytics なのか

| ツール | Cookie | 個人追跡 | GDPR |
|---|---|---|---|
| **Google Analytics** | 使用する | する | 同意バナー必要 |
| **Cloudflare Web Analytics** | 使用しない | しない | 同意不要 |

Cloudflare Web Analytics は**Cookie を使わず、個人を追跡しない**プライバシー重視のアナリティクスです。

### 導入方法

1. Cloudflare ダッシュボード → Web Analytics → サイトを追加
2. トラッキングスニペットが生成される

```html
<!-- Layout.astro の </body> 直前に配置 -->
<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "your-token-here"}'
></script>
```

### Astro での実装

```astro
---
// src/layouts/Layout.astro（抜粋）
interface Props {
  title: string;
}

const { title } = Astro.props;

// 本番環境のみアナリティクスを読み込む
const analyticsToken = import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN;
const isProd = import.meta.env.PROD;
---

<html lang="ja">
<head>
  <!-- ... -->
</head>
<body>
  <slot />

  {isProd && analyticsToken && (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${analyticsToken}"}`}
    />
  )}
</body>
</html>
```

```bash
# .env
PUBLIC_CF_ANALYTICS_TOKEN=your-token-here
```

**`import.meta.env.PROD`** は Astro がビルド時に自動で設定する値で、本番ビルド時に `true` になります。開発中はアナリティクスが動作しません。

---

## 18.6 プライバシーポリシー

要件定義書で義務付けられているプライバシーポリシーを実装します。

```astro
---
// src/pages/privacy.astro
import Layout from "../layouts/Layout.astro";
---

<Layout title="プライバシーポリシー">
  <article class="privacy-policy">
    <h1>プライバシーポリシー</h1>

    <p>最終更新日: 2026年XX月XX日</p>

    <section>
      <h2>1. はじめに</h2>
      <p>
        当サイト（meg4ne.net、以下「本サイト」）は、個人が運営するポートフォリオサイトです。
        本サイトでは、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
      </p>
    </section>

    <section>
      <h2>2. アクセス解析について</h2>
      <p>
        本サイトでは、サイトの改善を目的として
        <strong>Cloudflare Web Analytics</strong> を使用しています。
      </p>
      <p>本ツールには以下の特徴があります：</p>
      <ul>
        <li>Cookie を使用しません</li>
        <li>個人を識別する情報を収集しません</li>
        <li>ページビュー数やリファラーなどの集計データのみを取得します</li>
      </ul>
      <p>
        詳細は
        <a href="https://www.cloudflare.com/web-analytics/" target="_blank" rel="noopener noreferrer">
          Cloudflare Web Analytics
        </a>
        の公式ページをご参照ください。
      </p>
    </section>

    <section>
      <h2>3. 外部サービスへのリンク</h2>
      <p>
        本サイトには外部サービス（GitHub, Qiita, Zenn, note 等）へのリンクが含まれます。
        リンク先のサイトにおけるプライバシーポリシーについては、各サービスの規定をご確認ください。
      </p>
    </section>

    <section>
      <h2>4. お問い合わせ</h2>
      <p>
        本ポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。
      </p>
      <ul>
        <li>GitHub: <a href="https://github.com/あなたのユーザー名">@あなたのユーザー名</a></li>
      </ul>
    </section>

    <section>
      <h2>5. 改定について</h2>
      <p>
        本ポリシーは、必要に応じて改定することがあります。
        改定した場合は、本ページにて更新日を明記します。
      </p>
    </section>
  </article>
</Layout>

<style>
  .privacy-policy {
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.8;
  }

  .privacy-policy h2 {
    margin-top: var(--space-xl);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--space-xs);
  }

  .privacy-policy ul {
    padding-left: 1.5rem;
  }

  .privacy-policy li {
    margin-bottom: var(--space-xs);
  }
</style>
```

フッターにプライバシーポリシーへのリンクを追加するのも忘れないようにしましょう:

```astro
<!-- Footer.astro 内 -->
<footer>
  <nav>
    <a href="/privacy">プライバシーポリシー</a>
  </nav>
  <p>&copy; 2026 megane</p>
</footer>
```

---

## 18.7 Cloudflare の追加設定

Cloudflare ダッシュボードで以下を有効化すると、追加のセキュリティとパフォーマンスが得られます。

### 推奨設定

| 設定 | 場所 | 値 | 効果 |
|---|---|---|---|
| **SSL/TLS** | SSL/TLS → Overview | Full | Cloudflare↔サーバー間も暗号化（Tunnel 使用時は Full で十分。strict は正式な SSL 証明書が Nginx に必要） |
| **Always Use HTTPS** | SSL/TLS → Edge Certificates | ON | HTTP を HTTPS にリダイレクト |
| **Auto Minify** | Speed → Optimization | HTML, CSS, JS | アセットの軽量化 |
| **Brotli** | Speed → Optimization | ON | gzip より高効率な圧縮 |
| **Browser Cache TTL** | Caching → Configuration | Respect Existing Headers | Nginx の設定を優先 |

---

## 18.8 この章のまとめ

### Cloudflare Tunnel の利点

1. **ポート開放不要** → ファイアウォールの穴を開けない
2. **固定IP不要** → 一般的な家庭回線でOK
3. **DDoS防御** → Cloudflare のエッジネットワークが防壁
4. **SSL自動管理** → 証明書の更新を気にしなくてよい

### Web Analytics の特徴

- Cookie 不使用 → 同意バナー不要
- 個人追跡なし → プライバシーに優しい
- 軽量スクリプト → パフォーマンスへの影響が最小限

### プライバシーポリシーの要点

- アナリティクスの使用を明示
- Cookie 不使用であることを記載
- 外部リンク先の責任範囲を明確化
- 問い合わせ先の提示

---

次の章: [第19章: パフォーマンスと SEO](./19-performance-seo.md)
