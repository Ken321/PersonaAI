# PersonaAI

UXリサーチツールのモックアップ。ペルソナチャット・ジャーニーマップ・メンタルモデル・ストーリーボード・ユーザビリティテストを含む。

## 構成

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 18 + Vite + Tailwind CSS |
| バックエンド | FastAPI + Python 3.11+ |
| DB | PostgreSQL 16 |

---

## ローカル起動手順

> **Docker は不要です。** DBは Railway のクラウドPostgreSQLに直接接続します。

### 1. フロントエンド

```bash
# 依存パッケージのインストール（初回のみ）
npm install

# 開発サーバー起動（http://localhost:5173）
npm run dev
```

モックデータはフロントエンドに内包されているため、バックエンドなしでも画面確認は可能です。

### 2. バックエンド（ローカル起動 → 本番DBに接続）

DBは `backend/.env` に設定された **Railway** のクラウドPostgreSQLを参照します。ローカルにDBを立てる必要はありません。

```bash
cd backend

# 仮想環境の作成・有効化（初回のみ）
python3 -m venv .venv
source .venv/bin/activate

# 依存パッケージのインストール（初回のみ）
pip install -e .

# サーバー起動（http://localhost:8000）
uvicorn app.main:app --reload
```

#### backend/.env の内容（要確認）

| 変数 | 説明 |
|---|---|
| `OPENAI_API_KEY` | OpenAI APIキー |
| `DATABASE_URL` | Railway PostgreSQL（本番DB）の接続URL |
| `DATABASE_URL_SYNC` | 同期接続用URL（Alembicなど用） |
| `ALLOWED_ORIGINS` | CORSを許可するオリジン |

`.env` ファイルは `.gitignore` で管理し、リポジトリにコミットしないこと。

---

## DBマイグレーション

DBスキーマを変更した場合（モデルにカラムを追加した等）は、Alembicでマイグレーションを実行してください。

### マイグレーションファイルの作成（スキーマ変更後）

```bash
cd backend
source .venv/bin/activate

# マイグレーションファイルを手動作成（内容は backend/alembic/versions/ 以下の既存ファイルを参考に）
# ファイル名例: backend/alembic/versions/xxxx_description.py
```

### 本番DBへの適用（head への更新）

```bash
cd backend
source .venv/bin/activate

# 現在の適用済みバージョンを確認
alembic current

# 最新（head）まで適用
alembic upgrade head
```

> DBは `backend/.env` の `DATABASE_URL_SYNC` が指す **Railway 本番DB** に直接適用されます。実行前に内容を必ず確認してください。

### バージョンだけを合わせたい場合（カラムがすでにDBに存在する場合）

```bash
# SQLを実行せずにバージョン記録だけ更新する
alembic stamp head
```

---

## 主要スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | フロント開発サーバー起動 |
| `npm run build` | フロントのプロダクションビルド |
| `npm run preview` | ビルド済みフロントのプレビュー |

---

## ディレクトリ構成

```
PersonaAI/
├── index.jsx               # エントリーポイント
├── src/
│   └── PluginConnectPage.jsx  # メインUI（ペルソナ・ジャーニーマップ等）
├── backend/
│   ├── app/
│   │   └── main.py         # FastAPI アプリ
│   ├── mcp_server.py       # MCP サーバー
│   └── pyproject.toml
├── docker-compose.yml
└── vite.config.js
```
