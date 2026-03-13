"""
DeepPersonaの手法に基づくタクソノミー巡回。
taxonomy.jsonを幅優先探索で巡回し、10属性ずつバッチでLLMに問いかけて値を生成する。

巡回アルゴリズム：
1. ツリーの全リーフノード（末端属性）をリストアップ
2. リストをシャッフル（ランダム性確保）
3. ロングテールのカテゴリ（ノード数が少ないカテゴリ）を優先
4. 10個ずつバッチでLLMに問いかけ
5. attribute_richness個に達したら終了
"""

import json
import os
import random
from typing import AsyncGenerator

from openai import AsyncOpenAI

from app.prompts.taxonomy_prompts import (
    TAXONOMY_BATCH_SYSTEM_PROMPT,
    TAXONOMY_BATCH_USER_PROMPT,
)

_TAXONOMY_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "taxonomy.json")

# 必ず生成する属性（category, subcategory, attribute の組）
# attribute_richness に関わらず先頭バッチに含まれ、重複してサンプリングされることはない
PINNED_ATTRIBUTES: list[tuple[str, str, str]] = [
    ("Demographics", "Gender", "Sex Assigned at Birth"),
    ("Demographics", "Gender", "Gender Identity"),
    ("Demographics", "Gender", "Gender Expression Style"),
    ("Demographics", "Age", "Specific Age"),
    ("Demographics", "Age", "Life Stage"),
    ("Demographics", "Location", "City"),
    ("Demographics", "Location", "Prefecture"),
]


class TaxonomyWalker:
    def __init__(self, client: AsyncOpenAI, model: str):
        self.client = client
        self.model = model
        self.taxonomy = self._load_taxonomy()

    def _load_taxonomy(self) -> dict:
        with open(_TAXONOMY_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def _collect_leaf_nodes(self) -> list[dict]:
        """
        タクソノミーツリーの全リーフノードを収集する。
        各ノードは {"category": str, "subcategory": str, "attribute": str} の形式。
        """
        leaves = []
        for category, subcategories in self.taxonomy.items():
            for subcategory, attributes in subcategories.items():
                if isinstance(attributes, list):
                    for attribute in attributes:
                        leaves.append({
                            "category": category,
                            "subcategory": subcategory,
                            "attribute": attribute,
                        })
                elif isinstance(attributes, dict):
                    for sub2, attrs2 in attributes.items():
                        if isinstance(attrs2, list):
                            for attribute in attrs2:
                                leaves.append({
                                    "category": category,
                                    "subcategory": f"{subcategory} > {sub2}",
                                    "attribute": attribute,
                                })
        return leaves

    def _shuffle_with_longtail_bias(self, leaves: list[dict]) -> list[dict]:
        """
        ロングテールのカテゴリを優先してシャッフル。
        ノード数が少ないカテゴリほど先にサンプリングされるよう重み付けする。
        """
        category_counts: dict[str, int] = {}
        for leaf in leaves:
            cat = leaf["category"]
            category_counts[cat] = category_counts.get(cat, 0) + 1

        max_count = max(category_counts.values()) if category_counts else 1
        for leaf in leaves:
            leaf["_weight"] = max_count / category_counts[leaf["category"]]

        weighted = sorted(leaves, key=lambda x: -x["_weight"] * random.random())
        return weighted

    async def walk(
        self, anchor: dict, attribute_richness: int
    ) -> AsyncGenerator[dict, None]:
        """
        タクソノミーを巡回して属性を生成する。
        10属性ずつバッチでLLMに問いかける。
        各バッチ完了時に {"type": "batch_complete", "attributes": {...}} を yield する。
        """
        leaves = self._collect_leaf_nodes()

        # ピン留め属性を先頭に固定し、残りからランダムサンプリング
        pinned_keys = {(p[0], p[1], p[2]) for p in PINNED_ATTRIBUTES}
        pinned_leaves = [
            {"category": c, "subcategory": s, "attribute": a}
            for c, s, a in PINNED_ATTRIBUTES
        ]
        remaining = [
            leaf for leaf in leaves
            if (leaf["category"], leaf["subcategory"], leaf["attribute"]) not in pinned_keys
        ]
        shuffled = self._shuffle_with_longtail_bias(remaining)

        # attribute_richness個に絞る（ピン留め分を除いた残り枠）
        remaining_slots = max(0, attribute_richness - len(pinned_leaves))
        target_leaves = pinned_leaves + shuffled[:remaining_slots]

        batch_size = 10
        generated_attributes: dict = {}

        for batch_start in range(0, len(target_leaves), batch_size):
            batch = target_leaves[batch_start : batch_start + batch_size]
            batch_attribute_names = [
                f"{leaf['category']} > {leaf['subcategory']} > {leaf['attribute']}"
                for leaf in batch
            ]

            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": TAXONOMY_BATCH_SYSTEM_PROMPT},
                        {
                            "role": "user",
                            "content": TAXONOMY_BATCH_USER_PROMPT.format(
                                anchor_json=json.dumps(anchor, ensure_ascii=False),
                                existing_attributes_json=json.dumps(
                                    generated_attributes,
                                    ensure_ascii=False,
                                    indent=2,
                                ),
                                batch_attributes="\n".join(
                                    f"- {name}" for name in batch_attribute_names
                                ),
                            ),
                        },
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.9,
                )
                batch_result = json.loads(response.choices[0].message.content or "{}")
            except Exception:
                # バッチが失敗してもスキップして続行する
                batch_result = {}

            generated_attributes.update(batch_result)

            yield {
                "type": "batch_complete",
                "attributes": batch_result,
                "total_so_far": len(generated_attributes),
            }
