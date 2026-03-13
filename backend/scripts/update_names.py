"""
全ペルソナの name・display_name を LLM で生成し直すスクリプト。
structured_attributes がある場合はそこから Gender Identity / Specific Age / City を使用。
ない場合は gender / age / city フィールドから代替する。

使用方法: python scripts/update_names.py
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import openai
from sqlalchemy import select

from app.core.config import settings
from app.core.database import AsyncSessionLocal, init_db
from app.models.persona import Persona
from app.api.persona_pool import _generate_name


def _build_taxonomy_from_persona(persona: Persona) -> dict:
    """structured_attributes がない場合に gender/age/city から最小限のタクソノミーを組み立てる。"""
    if persona.structured_attributes:
        return persona.structured_attributes
    return {
        "Demographics": {
            "Gender": {"Gender Identity": persona.gender},
            "Age": {"Specific Age": str(persona.age)},
            "Location": {"City": persona.city},
        }
    }


async def run():
    await init_db()

    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    model = settings.persona_generation_model

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Persona))
        personas = result.scalars().all()

        print(f"対象ペルソナ数: {len(personas)}")

        used_names: list[str] = []
        updated = 0
        failed = 0

        for persona in personas:
            taxonomy = _build_taxonomy_from_persona(persona)
            try:
                new_name = await _generate_name(client, model, taxonomy, exclude_names=used_names)
                if not new_name:
                    raise ValueError("空の名前が返されました")
                persona.name = new_name
                persona.display_name = new_name
                used_names.append(new_name)
                updated += 1
                print(f"  [{updated}/{len(personas)}] {persona.age}歳/{persona.gender} → {new_name}")
            except Exception as e:
                failed += 1
                print(f"  FAILED: id={persona.id} ({persona.age}歳/{persona.gender}): {e}")

        await db.commit()

    print(f"\nDone. Updated: {updated}, Failed: {failed}")


if __name__ == "__main__":
    asyncio.run(run())
