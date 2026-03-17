# システム構成

## 全体像

```
┌─────────────────────────────────────────────────────────────────┐
│                         ユーザー（ブラウザ）                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel（フロントエンド）                          │
│            https://persona-ai-ochre-six.vercel.app              │
│                                                                 │
│  React 18 + Vite + Tailwind CSS                                 │
│  環境変数: VITE_API_BASE=https://backend-production-c03b...      │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS（CORS許可済み）
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Railway（バックエンド）                            │
│         https://backend-production-c03b.up.railway.app          │
│                                                                 │
│  FastAPI + Python 3.12                                          │
│  uvicorn（Dockerfile起動）                                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │ TCP（asyncpg）
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Railway（PostgreSQL 16）                         │
│           caboose.proxy.rlwy.net:40998                          │
│                                                                 │
│  ローカル・本番で共通のDBを参照                                        │
└─────────────────────────────────────────────────────────────────┘
```

## ローカル開発環境

```
ブラウザ(5173)
    │
    ▼
Vite Dev Server (localhost:5173)
    │ /api/* → プロキシ（vite.config.js）
    ▼
FastAPI (localhost:8000)
    │
    ▼
Railway PostgreSQL（本番DBと同じ）
```

ローカルで作成・変更したデータは本番でも即座に反映される（同一DB）。

---

## フロントエンド

| 項目 | 内容 |
|---|---|
| フレームワーク | React 18 |
| ビルドツール | Vite 5 |
| スタイル | Tailwind CSS 3 |
| ホスティング | Vercel |
| デプロイ方法 | `npx vercel --prod --force`（CLI） |

### 主要ファイル

```
src/
├── PluginConnectPage.jsx   # メインUI（約1300行）
│   ├── ペルソナ管理
│   ├── フィードバックシミュレーション
│   ├── プロジェクト設定
│   └── AIチャット
└── LoginPage.jsx           # 認証UI
```

### API呼び出しの仕組み

```javascript
const API_BASE = import.meta.env.VITE_API_BASE || '';
// ローカル: '' → Vite プロキシ → localhost:8000
// 本番:    'https://backend-production-c03b.up.railway.app' → 直接呼び出し
```

---

## バックエンド

| 項目 | 内容 |
|---|---|
| フレームワーク | FastAPI 0.115+ |
| 言語 | Python 3.12 |
| ORM | SQLAlchemy 2.0（async） |
| DBドライバ | asyncpg（非同期） / psycopg2（Alembic用） |
| 認証 | JWT（python-jose）+ bcrypt |
| AI | OpenAI SDK 1.50+ |
| ホスティング | Railway |
| デプロイ方法 | git push → Railway 自動デプロイ |

### APIエンドポイント一覧

| プレフィックス | ファイル | 主な機能 |
|---|---|---|
| `/api/auth` | `auth.py` | login / register / me |
| `/api/persona-pool` | `persona_pool.py` | ペルソナ一覧・生成・削除 |
| `/api/project-settings` | `project.py` | プロジェクト設定の保存・取得 |
| `/api/simulations` | `simulation.py` | フィードバックシミュレーション |
| `/api/persona` | `persona.py` | AIチャットセッション |
| `/api/feedback` | `feedback.py` | フィードバック生成 |
| `/api/scrape` | `scrape.py` | URL記事スクレイピング |
| `/health` | `main.py` | ヘルスチェック |

### 認証フロー

```
1. POST /api/auth/login → JWT発行（有効期限30日）
2. 以降のリクエスト: Authorization: Bearer <token>
3. get_current_user() でJWTをデコードしてuser_idを取得
4. データはuser_idで紐付け
```

---

## データベース

| テーブル | 説明 |
|---|---|
| `users` | ユーザーアカウント |
| `personas` | ペルソナ定義（user_id=NULLはグローバルデフォルト） |
| `project_settings` | ユーザーごとのプロジェクト設定 |
| `simulations` | フィードバックシミュレーション結果 |
| `simulation_feedbacks` | 各ペルソナのフィードバック |
| `chat_sessions` | AIチャットセッション |
| `chat_messages` | チャットメッセージ |

スキーマは起動時に `Base.metadata.create_all()` で自動作成。マイグレーションには Alembic を使用。
