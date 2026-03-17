# PersonaAI

UXリサーチ AI プラットフォーム。ペルソナ生成・チャット・フィードバックシミュレーション機能を提供。

| レイヤー | 技術 | 本番URL |
|---|---|---|
| フロントエンド | React 18 + Vite + Tailwind CSS | https://persona-ai-ochre-six.vercel.app |
| バックエンド | FastAPI + Python 3.12 | https://backend-production-c03b.up.railway.app |
| データベース | PostgreSQL 16 (Railway) | caboose.proxy.rlwy.net:40998 |

---

## 初回環境構築

### 前提条件
- Node.js 18+
- Python 3.11+
- `backend/.env` ファイル（別途入手）

### 1. フロントエンド

```bash
# リポジトリルートで実行
npm install
```

### 2. バックエンド

```bash
cd backend

# 仮想環境の作成
python3 -m venv .venv

# 仮想環境を有効化
source .venv/bin/activate   # Mac/Linux
# .venv\Scripts\activate    # Windows

# 依存パッケージのインストール
pip install -e .
```

### 3. backend/.env の設定

`backend/.env` を作成し、以下を設定：

```env
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql+asyncpg://postgres:...@caboose.proxy.rlwy.net:40998/railway
DATABASE_URL_SYNC=postgresql+psycopg2://postgres:...@caboose.proxy.rlwy.net:40998/railway
ALLOWED_ORIGINS=http://localhost:5173,https://persona-ai-ochre-six.vercel.app
JWT_SECRET_KEY=（本番と同じ値を設定すること）
```

> `.env` は `.gitignore` により Git 管理対象外です。リポジトリにコミットしないこと。

---

## 起動方法（2回目以降）

ターミナルを2つ開いて、それぞれ実行します。

### ターミナル① — バックエンド

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
# → http://localhost:8000 で起動
```

### ターミナル② — フロントエンド

```bash
# リポジトリルートで実行
npm run dev
# → http://localhost:5173 で起動
```

ブラウザで http://localhost:5173 を開く。

---

## APIドキュメント（ローカル）

バックエンド起動後、http://localhost:8000/docs でSwagger UIが確認できます。

---

## DBマイグレーション

モデルにカラムを追加・変更した場合：

```bash
cd backend
source .venv/bin/activate

# マイグレーションファイルを作成
alembic revision --autogenerate -m "説明"

# 本番DBに適用
alembic upgrade head
```

> DBは `DATABASE_URL_SYNC` が指す Railway 本番DBに直接適用されます。実行前に内容を確認してください。

---

## ディレクトリ構成

```
PersonaAI/
├── src/
│   ├── PluginConnectPage.jsx   # メインUI（ペルソナ・フィードバック等）
│   └── LoginPage.jsx           # ログイン・新規登録画面
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI アプリ・ルーター登録
│   │   ├── api/                # エンドポイント群
│   │   ├── models/             # SQLAlchemy モデル
│   │   ├── services/           # ビジネスロジック
│   │   └── core/               # 設定・DB・認証
│   ├── Dockerfile
│   └── pyproject.toml
├── vercel.json                  # Vercel設定（SPA fallback）
├── vite.config.js               # ローカル用APIプロキシ設定
└── CLAUDE.md                    # AI開発ガイド
```

---

詳細は [docs/](docs/) を参照してください。
