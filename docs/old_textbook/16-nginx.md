# 第16章: Nginx リバースプロキシ

## この章で学ぶこと

- リバースプロキシの役割と仕組み
- Nginx の設定ファイル構文
- セキュリティヘッダーの設定
- 静的アセットのキャッシュ制御
- バックエンド更新中のエラーハンドリング

---

## 16.1 リバースプロキシとは

リバースプロキシは「クライアントとアプリケーションの間に立つ仲介者」です。

```
クライアント → Nginx（リバースプロキシ）→ Astro / API サーバー
                     │
          この層で以下を処理:
          ・SSL/TLS 終端
          ・リクエストの振り分け
          ・セキュリティヘッダー付与
          ・静的ファイルのキャッシュ
          ・圧縮（gzip/brotli）
```

### なぜアプリケーションを直接公開しないのか

| 観点 | 直接公開 | Nginx 経由 |
|---|---|---|
| **セキュリティ** | アプリ自身で全対策が必要 | Nginx が防壁として機能 |
| **パフォーマンス** | 静的ファイルも Node.js で処理 | Nginx が高速配信 |
| **運用** | ポート変更＝アプリ修正 | Nginx の設定変更のみ |
| **可用性** | アプリ更新中＝ダウン | エラーページ返却可能 |

---

## 16.2 本プロジェクトのルーティング設計

```
meg4ne.net/             → frontend コンテナ（Astro 静的ファイル）
meg4ne.net/api/*        → api コンテナ（Hono）
meg4ne.net/assets/*     → frontend コンテナ（キャッシュ付き配信）
```

---

## 16.3 メイン設定ファイル

```nginx
# docker/nginx/nginx.conf

# ワーカープロセス数（auto = CPU コア数に合わせる）
worker_processes auto;

# エラーログの出力先
error_log /var/log/nginx/error.log warn;
pid       /var/run/nginx.pid;

events {
    # 1ワーカーあたりの最大同時接続数
    worker_connections 1024;
}

http {
    # ──── 基本設定 ────
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # ログフォーマット
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent"';
    access_log /var/log/nginx/access.log main;

    # パフォーマンス設定
    sendfile    on;   # カーネルのファイル送信機能を使用
    tcp_nopush  on;   # レスポンスヘッダーとボディをまとめて送信
    tcp_nodelay on;   # 小さなパケットも即座に送信

    keepalive_timeout 65;

    # 圧縮（gzip）
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml;

    # サイト設定を読み込み
    include /etc/nginx/conf.d/*.conf;
}
```

---

## 16.4 サイト設定ファイル

```nginx
# docker/nginx/conf.d/default.conf

# ──── アップストリーム定義 ────
# Docker Compose のサービス名で参照できる
upstream frontend {
    server frontend:80;
}

upstream api {
    server api:3001;
}

server {
    listen 80;
    server_name meg4ne.net;

    # ──── セキュリティヘッダー ────
    # クリックジャッキング対策
    add_header X-Frame-Options "SAMEORIGIN" always;

    # XSS フィルター
    add_header X-Content-Type-Options "nosniff" always;

    # Referrer の送信を制限
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # HTTPS のみで接続するよう指示（Cloudflare Tunnel 使用時）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 権限ポリシー
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # ──── API へのプロキシ ────
    location /api/ {
        proxy_pass http://api;
        proxy_http_version 1.1;

        # WebSocket 対応（将来のリアルタイムモニター用）
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 元のクライアント情報を転送
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # タイムアウト設定
        proxy_connect_timeout 10s;
        proxy_send_timeout    30s;
        proxy_read_timeout    30s;
    }

    # ──── 静的アセット（長期キャッシュ） ────
    location /assets/ {
        proxy_pass http://frontend;

        # Astro はファイル名にハッシュを含むため長期キャッシュ可能
        # 例: styles.abc123.css → ファイルが変われば名前も変わる
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # ──── その他の静的ファイル ────
    location / {
        proxy_pass http://frontend;

        # HTML は頻繁に変わる可能性があるため短めのキャッシュ
        add_header Cache-Control "public, max-age=3600";
    }

    # ──── エラーページ ────
    # フロントエンドのコンテナが停止中の場合
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
        internal;
    }
}
```

### セキュリティヘッダーの解説

各ヘッダーの役割を詳しく見ていきましょう。

**`X-Frame-Options: SAMEORIGIN`**
```
自分のサイトのページを他サイトの <iframe> に埋め込むことを禁止。
→ クリックジャッキング攻撃（透明な iframe で騙す）を防止
```

**`X-Content-Type-Options: nosniff`**
```
ブラウザに MIME タイプの推測（sniffing）を禁止させる。
→ 例: テキストファイルを JavaScript として実行する攻撃を防止
```

**`Referrer-Policy: strict-origin-when-cross-origin`**
```
同一サイト内: 完全な URL を送信
他サイトへ:   オリジン（ドメイン名のみ）を送信
HTTP → HTTPS: 何も送信しない
→ URL に含まれる機密情報（トークン等）の漏洩を防止
```

**`Permissions-Policy`**
```
ブラウザの機能（カメラ、マイク、位置情報）へのアクセスを禁止。
当サイトではこれらの機能を使わないため、すべて拒否に設定。
→ 万が一 XSS 攻撃を受けても、これらの機能が悪用されない
```

---

## 16.5 キャッシュ戦略

### Astro のビルド出力

```
dist/
├── index.html                    # → キャッシュ短め（1時間）
├── about/index.html              # → キャッシュ短め
├── assets/
│   ├── styles.a3f8c2.css         # → キャッシュ長期（1年）
│   ├── main.b72e1d.js            # → キャッシュ長期
│   └── hero.c9d4e5.webp          # → キャッシュ長期
└── favicon.ico                   # → キャッシュ中期（1日）
```

```
assets/ 内のファイルにはハッシュ値が含まれている
（例: styles.a3f8c2.css の "a3f8c2" 部分）

ファイルの内容が変わる → ハッシュが変わる → ファイル名が変わる
→ ブラウザは新しいファイルとして認識し、古いキャッシュは自動で使われなくなる

この仕組みがあるから「1年」という長いキャッシュを設定しても安全
```

---

## 16.6 WebSocket プロキシ

第14章のリアルタイムモニターで WebSocket を使う場合、Nginx の設定が必要です。

```nginx
# WebSocket 用の設定（/api/ ブロック内に含まれている）
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

**WebSocket のリクエストフロー:**
```
1. クライアントが HTTP リクエストを送信（Upgrade: websocket ヘッダー付き）
2. Nginx がこのヘッダーを API サーバーに転送
3. API サーバーが 101 Switching Protocols を返す
4. 以降は WebSocket 接続として双方向通信
```

---

## 16.7 メンテナンスモード

デプロイ中やメンテナンス時に表示するページを用意します。

```html
<!-- docker/nginx/html/50x.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>メンテナンス中 | meg4ne.net</title>
  <style>
    body {
      background: #0a0e17;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 { color: #60a5fa; }
    p { color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>503 - Service Temporarily Unavailable</h1>
    <p>メンテナンス中です。しばらくお待ちください。</p>
  </div>
</body>
</html>
```

Docker Compose で Nginx にマウント:

```yaml
# docker-compose.yml（nginx サービスの volumes に追加）
volumes:
  - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  - ./docker/nginx/conf.d:/etc/nginx/conf.d:ro
  - ./docker/nginx/html:/usr/share/nginx/html:ro  # ← 追加
```

---

## 16.8 Nginx の動作確認

```bash
# 設定ファイルの文法チェック（非常に重要！）
docker compose exec nginx nginx -t
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 設定の再読み込み（無停止で反映）
docker compose exec nginx nginx -s reload

# アクセスログの確認
docker compose logs -f nginx
```

**`nginx -t` は必ず実行する**

設定ファイルに文法エラーがあると Nginx が起動しなくなります。変更時は必ず `nginx -t` で検証してから `nginx -s reload` で反映しましょう。

---

## 16.9 この章のまとめ

### Nginx の 4 つの役割

1. **リクエストの振り分け** → `/api/` は API へ、それ以外はフロントエンドへ
2. **セキュリティ** → ヘッダー付与、iframe 制限、MIME sniffing 防止
3. **パフォーマンス** → gzip 圧縮、キャッシュ制御
4. **可用性** → エラーページ表示、WebSocket 対応

### キャッシュ戦略のまとめ

| 対象 | キャッシュ期間 | 理由 |
|---|---|---|
| `/assets/*`（ハッシュ付き） | 1年 | ファイル名変更で自動無効化 |
| HTML ファイル | 1時間 | 内容が更新される可能性がある |
| API レスポンス | キャッシュしない | リアルタイムデータ |

---

次の章: [第17章: CI/CD（GitHub Actions & Watchtower）](./17-cicd.md)
