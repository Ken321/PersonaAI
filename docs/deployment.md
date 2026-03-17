# デプロイ手順

## 構成

| サービス | プラットフォーム | URL |
|---|---|---|
| フロントエンド | Vercel | https://persona-ai-ochre-six.vercel.app |
| バックエンド | Railway | https://backend-production-c03b.up.railway.app |
| データベース | Railway PostgreSQL | caboose.proxy.rlwy.net:40998 |

---

## フロントエンド（Vercel）デプロイ

### 通常のデプロイ

```bash
# プロジェクトルート（PersonaAI/）から実行
npx vercel --prod --force
```

`--force` オプションでビルドキャッシュをクリアし、環境変数を確実にビルドに反映する。

> **注意**: `git push` による自動デプロイは信頼できない場合がある。コードや環境変数を変更した場合は必ず CLI から実行すること。

### Vercel 環境変数

Vercel ダッシュボード → Settings → Environment Variables：

| 変数名 | 値 | 備考 |
|---|---|---|
| `VITE_API_BASE` | `https://backend-production-c03b.up.railway.app` | 末尾スラッシュなし・改行なし |

環境変数を変更した場合は `--force` 付きで再デプロイすること（ビルドキャッシュに古い値が残るため）。

### CLI で環境変数を設定する場合

```bash
# 設定（改行が混入しないよう printf を使う）
printf 'https://backend-production-c03b.up.railway.app' | npx vercel env add VITE_API_BASE production

# 確認
npx vercel env ls

# 削除して再設定
npx vercel env rm VITE_API_BASE production --yes
printf 'https://...' | npx vercel env add VITE_API_BASE production
```

---

## バックエンド（Railway）デプロイ

### 通常のデプロイ

```bash
git push
```

Railway は `main` ブランチへの push を検知して自動ビルド・デプロイする。
ビルドは `backend/Dockerfile` を使用。

### Railway 環境変数

Railway ダッシュボード → サービス → Variables：

| 変数名 | 説明 |
|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:...@caboose.proxy.rlwy.net:40998/railway` |
| `JWT_SECRET_KEY` | JWTの署名鍵（ローカルの `.env` と同じ値） |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://persona-ai-ochre-six.vercel.app` |
| `OPENAI_API_KEY` | OpenAI APIキー |

> **ALLOWED_ORIGINS** に Vercel のドメインが含まれていないと CORS エラーになる。

### Railway ビルド設定

`backend/railway.toml`：
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
```

Railway のルートディレクトリは `backend/` に設定。

---

## デプロイ時のチェックリスト

### フロントエンド変更時

- [ ] コードの変更・コミット
- [ ] `npx vercel --prod --force` でデプロイ
- [ ] https://persona-ai-ochre-six.vercel.app で動作確認

### バックエンド変更時

- [ ] コードの変更・コミット
- [ ] `git push` で Railway 自動デプロイ
- [ ] Railway ダッシュボードでビルドログを確認
- [ ] https://backend-production-c03b.up.railway.app/health で確認

### 環境変数変更時

- [ ] Railway / Vercel の該当サービスで変数を更新
- [ ] **Vercel**: `npx vercel --prod --force` で再ビルド（Vite は環境変数をビルド時に埋め込むため）
- [ ] **Railway**: 変数保存後に自動再デプロイ

---

## トラブルシューティング

### 本番でAPIが404になる

**原因1: `${API_BASE}` を使わずに `/api/...` をハードコードしている**

```javascript
// ❌ これはローカルのViteプロキシのみで動作する
fetch('/api/project-settings/', ...)

// ✅ これが正しい
fetch(`${API_BASE}/api/project-settings/`, ...)
```

**原因2: Vercel の `VITE_API_BASE` がビルドに反映されていない**

```bash
npx vercel --prod --force  # --force でキャッシュをクリア
```

**原因3: `VITE_API_BASE` の値に末尾の改行が混入している**

```bash
# 確認
npx vercel env pull /tmp/check && cat /tmp/check

# 修正: printf で改行なしで再設定
npx vercel env rm VITE_API_BASE production --yes
printf 'https://backend-production-c03b.up.railway.app' | npx vercel env add VITE_API_BASE production
```

### 本番でログインできるのにデータが表示されない

**原因: JWT_SECRET_KEY がローカルと本番で異なる**

`backend/.env` の `JWT_SECRET_KEY` と Railway の `JWT_SECRET_KEY` が同じ値か確認。
異なる場合、一方で発行したトークンが他方で無効になる。

### Railway デプロイ後にAPIが動かない

Railway ダッシュボードのログを確認：
- `ImportError` → `pyproject.toml` の依存関係漏れ
- `DATABASE_URL` 関連エラー → Railway 環境変数の確認
- 起動コマンドのエラー → `railway.toml` の `startCommand` を確認
