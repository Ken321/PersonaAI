"""
タクソノミー属性とナラティブから、フィルタリング用の属性を抽出する。
表示用の名前と一行サマリーも生成する。
"""

import json

from openai import AsyncOpenAI

from app.prompts.extraction_prompts import EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT

_REQUIRED_KEYS = [
    "age", "gender", "region_type", "occupation_category",
    "info_style", "ad_attitude", "disposable_income", "sns_activity",
    "display_name", "one_line_summary",
]

_DEFAULTS: dict = {
    "age": 30,
    "gender": "その他",
    "region_type": "metro",
    "occupation_category": "会社員",
    "info_style": "news_app",
    "ad_attitude": "neutral",
    "disposable_income": "medium",
    "sns_activity": "medium",
    "display_name": "山田太郎",
    "one_line_summary": "詳細不明のペルソナ。",
}


class AttributeExtractor:
    def __init__(self, client: AsyncOpenAI, model: str):
        self.client = client
        self.model = model

    async def extract(self, taxonomy_attributes: dict, narrative: str) -> dict:
        # LLMに渡すJSONが大きくなりすぎないよう先頭100属性に絞る
        trimmed = dict(list(taxonomy_attributes.items())[:100])

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": EXTRACTION_USER_PROMPT.format(
                            taxonomy_json=json.dumps(trimmed, ensure_ascii=False, indent=2),
                            narrative=narrative,
                        ),
                    },
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
            )
            result = json.loads(response.choices[0].message.content or "{}")
        except Exception:
            result = {}

        # 必須キーが欠けていればデフォルト値で補完
        for key in _REQUIRED_KEYS:
            if key not in result or result[key] is None:
                result[key] = _DEFAULTS[key]

        # age は整数に強制変換
        try:
            result["age"] = int(result["age"])
        except (TypeError, ValueError):
            result["age"] = _DEFAULTS["age"]

        return result
