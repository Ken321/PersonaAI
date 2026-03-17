# PersonaAI — Claude開発ガイド

## プロジェクト概要

UXリサーチ AI プラットフォーム。ペルソナ生成・チャット・フィードバックシミュレーションを提供。

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 18 + Vite + Tailwind CSS（Vercel） |
| バックエンド | FastAPI + SQLAlchemy + asyncpg（Railway） |
| データベース | PostgreSQL 16（Railway、ローカル・本番共通） |
| AI | OpenAI API（gpt-5-mini） |
| 認証 | JWT（python-jose）+ bcrypt |

---

## 重要：API呼び出しのルール

フロントエンドの API 呼び出しは **必ず `${API_BASE}` を使うこと**。

```javascript
// ✅ 正しい
fetch(`${API_BASE}/api/project-settings/`, { headers: authHeaders() })

// ❌ 間違い（本番で404になる）
fetch('/api/project-settings/', { headers: authHeaders() })
```

`API_BASE` は `src/PluginConnectPage.jsx` および `src/LoginPage.jsx` で以下のように定義：

```javascript
const API_BASE = import.meta.env.VITE_API_BASE || '';
```

- **ローカル**：`VITE_API_BASE` 未設定 → `''` → Vite プロキシ経由（`vite.config.js`）
- **本番**：`VITE_API_BASE=https://backend-production-c03b.up.railway.app` → Railway に直接アクセス

---

## ローカル開発環境

```
ブラウザ(5173) → Vite Dev Server → [プロキシ /api/*] → FastAPI(8000) → Railway PostgreSQL
```

Vite プロキシ設定（`vite.config.js`）：
```javascript
proxy: {
  '/api': { target: 'http://localhost:8000', changeOrigin: true }
}
```

## 本番環境

```
ブラウザ → Vercel(persona-ai-ochre-six.vercel.app) → Railway Backend(backend-production-c03b.up.railway.app) → Railway PostgreSQL
```

Vercel と Railway は**同じ Railway PostgreSQL**を参照。ローカルも同じDBを参照するため、ローカルで作成したデータは本番でも見える。

---

## 環境変数

### backend/.env（ローカル）

| 変数 | 説明 |
|---|---|
| `OPENAI_API_KEY` | OpenAI APIキー |
| `DATABASE_URL` | `postgresql+asyncpg://...@caboose.proxy.rlwy.net:40998/railway` |
| `DATABASE_URL_SYNC` | `postgresql+psycopg2://...`（Alembic用） |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://persona-ai-ochre-six.vercel.app` |
| `JWT_SECRET_KEY` | 本番と同じ値を設定すること（異なると認証が通らない） |

### Railway（本番バックエンド）

| 変数 | 説明 |
|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://...@caboose.proxy.rlwy.net:40998/railway` |
| `JWT_SECRET_KEY` | JWTの署名鍵（ローカルと同じ値） |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://persona-ai-ochre-six.vercel.app` |
| `OPENAI_API_KEY` | OpenAI APIキー |

### Vercel（本番フロントエンド）

| 変数 | 説明 |
|---|---|
| `VITE_API_BASE` | `https://backend-production-c03b.up.railway.app`（末尾スラッシュなし・改行なし） |

> `VITE_API_BASE` はビルド時に埋め込まれる。変更後は `npx vercel --prod --force` で再ビルドが必要。

---

## 主要ファイル

| ファイル | 役割 |
|---|---|
| `src/PluginConnectPage.jsx` | メインUI（約1300行）。ペルソナ・フィードバック・シミュレーション |
| `src/LoginPage.jsx` | ログイン・新規登録画面 |
| `backend/app/main.py` | FastAPI アプリ本体・全ルーター登録 |
| `backend/app/api/auth.py` | 認証（login/register/me） |
| `backend/app/api/persona_pool.py` | ペルソナ管理・DeepPersona生成 |
| `backend/app/api/project.py` | プロジェクト設定（assigned personas等） |
| `backend/app/api/simulation.py` | フィードバックシミュレーション |
| `backend/app/core/config.py` | 環境変数の読み込み（pydantic-settings） |
| `backend/app/core/security.py` | JWT生成・検証、パスワードハッシュ |
| `backend/Dockerfile` | Railway デプロイ用（`pyproject.toml` + `app/` をコピー） |

---

## デプロイ手順

詳細は `docs/deployment.md` を参照。

### フロントエンド（Vercel）

```bash
# プロジェクトルートから実行
npx vercel --prod --force
```

> `git push` では自動デプロイが動作しない場合がある。CLI から直接デプロイすること。
> `--force` でビルドキャッシュをクリアし、環境変数を確実に反映。

### バックエンド（Railway）

Railway は `backend/` ディレクトリの変更を git push で自動デプロイ。
手動デプロイが必要な場合は Railway ダッシュボードから実行。

---

## 既知の注意点

- **Vercel の `vercel.json` リライト**は現在機能していない（原因不明）。`VITE_API_BASE` で直接 Railway を呼び出す方式を採用。
- **JWT_SECRET_KEY** はローカルと本番で必ず同じ値にすること。異なるとトークンが無効になりデータが表示されない。
- **`VITE_API_BASE`** に末尾の改行や空白が入るとURLが壊れる。`printf` や Vercel CLI で設定する際は注意。
