from fastapi import Header, HTTPException


def get_openai_key(x_openai_api_key: str = Header(default="")) -> str:
    """X-OpenAI-Api-Key ヘッダーからAPIキーを取得する。"""
    if not x_openai_api_key:
        raise HTTPException(
            status_code=400,
            detail=(
                "OpenAI APIキーが設定されていません。"
                " アプリの「設定」タブでAPIキーを登録してください。"
            ),
        )
    return x_openai_api_key
