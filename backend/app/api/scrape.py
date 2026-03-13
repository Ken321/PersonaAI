import httpx
import trafilatura
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl

router = APIRouter(prefix="/api/scrape", tags=["scrape"])

# ブラウザに偽装するヘッダー（多くのサイトがボットをブロックするため）
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
}


class ScrapeRequest(BaseModel):
    url: HttpUrl


class ScrapeResponse(BaseModel):
    title: str
    content: str
    url: str


@router.post("/", response_model=ScrapeResponse)
async def scrape_url(request: ScrapeRequest):
    url_str = str(request.url)

    try:
        async with httpx.AsyncClient(
            headers=_HEADERS,
            follow_redirects=True,
            timeout=15.0,
        ) as client:
            response = await client.get(url_str)
            response.raise_for_status()
            html = response.text
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="URLの取得がタイムアウトしました。")
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"URLの取得に失敗しました（HTTP {e.response.status_code}）。",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"URLの取得中にエラーが発生しました: {e}")

    # trafilatura で本文・タイトルを抽出
    # include_comments=False, include_tables=True で記事本文に集中
    extracted = trafilatura.extract(
        html,
        url=url_str,
        include_comments=False,
        include_tables=True,
        no_fallback=False,  # フォールバック戦略も使う
        favor_precision=False,  # リコール優先（短い記事を取りこぼさない）
    )

    # タイトルを取得
    metadata = trafilatura.extract_metadata(html, default_url=url_str)
    title = (metadata.title if metadata and metadata.title else "") or ""

    if not extracted:
        raise HTTPException(
            status_code=422,
            detail="記事本文を抽出できませんでした。このサイトはスクレイピングをブロックしているか、本文が少ない可能性があります。",
        )

    # タイトル + 本文を結合してフィードバック用コンテンツとする
    content = f"# {title}\n\n{extracted}" if title else extracted

    return ScrapeResponse(title=title, content=content, url=url_str)
