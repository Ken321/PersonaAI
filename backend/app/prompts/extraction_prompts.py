EXTRACTION_SYSTEM_PROMPT = """あなたは、人物プロフィールからフィルタリング用の属性を正確に抽出する専門家です。
与えられた構造化属性とナラティブから、指定されたフォーマットでJSONを返してください。
選択肢から最も近いものを1つ選んでください。推測が必要な場合はナラティブの文脈から判断してください。
必ず全フィールドを埋め、省略しないこと。"""

EXTRACTION_USER_PROMPT = """以下の人物の構造化属性とナラティブから、フィルタリング用の属性を抽出してJSONで返してください。

【構造化属性】
{taxonomy_json}

【ナラティブ】
{narrative}

【抽出フォーマット】
{{
  "age": 数値（整数）,
  "gender": "男性" または "女性" または "その他"（構造化属性の "Sex Assigned at Birth" から判定。ない場合はナラティブから推定）,
  "region_type": "metro" または "regional" または "rural",
  "occupation_category": "会社員" または "自営業" または "フリーランス" または "学生" または "主婦主夫" または "パートアルバイト" または "経営者役員" または "退職者",
  "info_style": "sns" または "news_app" または "traditional_media" または "word_of_mouth",
  "ad_attitude": "positive" または "neutral" または "skeptical",
  "disposable_income": "high" または "medium" または "low",
  "sns_activity": "high" または "medium" または "low",
  "display_name": "自然な日本人の架空の氏名（例：田中美咲、佐藤健太）",
  "one_line_summary": "この人物を一文で表す要約（50〜120文字、具体的な特徴を含めること。例：渋谷のIT企業で働く28歳。カフェ巡りとヨガが趣味で、PRっぽい記事は読み飛ばす堅実派。）"
}}

必ず上記の全フィールドを含むJSONのみを返してください。説明文は不要です。"""
