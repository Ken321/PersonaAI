"""
グローバルデフォルトペルソナ投入スクリプト

user_id = NULL のグローバルデフォルトを DB に1回だけ投入する。
すべてのユーザーが自分のカスタムペルソナを作るまでの間、このデフォルトが表示される。

使用方法:
  cd backend
  python scripts/seed_default_personas.py --check      # 現在の状態を確認
  python scripts/seed_default_personas.py --execute    # 投入実行（既存があればスキップ）
  python scripts/seed_default_personas.py --reset      # 削除して再投入
"""

import asyncio
import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select, func


async def run(execute: bool = False, reset: bool = False):
    from app.core.database import AsyncSessionLocal, init_db
    from app.models.persona import Persona
    from app.data.default_personas import DEFAULT_PERSONA_TEMPLATES

    await init_db()

    async with AsyncSessionLocal() as db:
        existing_count = (await db.execute(
            select(func.count(Persona.id)).where(Persona.user_id.is_(None))
        )).scalar_one()

        if not execute and not reset:
            print(f"グローバルデフォルトペルソナ: {existing_count} 件")
            for t in DEFAULT_PERSONA_TEMPLATES:
                print(f"  - {t['name']} ({t['age']}歳・{t['occupation']})")
            return

        if reset and existing_count > 0:
            result = await db.execute(select(Persona).where(Persona.user_id.is_(None)))
            for p in result.scalars().all():
                await db.delete(p)
            await db.commit()
            print(f"既存の {existing_count} 件を削除しました。")
            existing_count = 0

        if existing_count > 0:
            print(f"既にグローバルデフォルトが {existing_count} 件存在します。スキップします。")
            print("  再投入する場合は --reset を使用してください。")
            return

        from app.models.persona import RegionType
        created = 0
        for t in DEFAULT_PERSONA_TEMPLATES:
            persona = Persona(
                user_id=None,
                name=t["name"],
                display_name=t["display_name"],
                one_line_summary=t["one_line_summary"],
                country=t.get("country"),
                age=t["age"],
                gender=t["gender"],
                city=t["city"],
                prefecture=t["prefecture"],
                occupation=t["occupation"],
                interests=t["interests"],
                region_type=t["region_type"],
                narrative=t["narrative"],
                occupation_category=t.get("occupation_category"),
                info_style=t.get("info_style"),
                ad_attitude=t.get("ad_attitude"),
                disposable_income=t.get("disposable_income"),
                sns_activity=t.get("sns_activity"),
                generated_by=t.get("generated_by", "default"),
                is_default=True,
                is_active=True,
            )
            db.add(persona)
            created += 1

        await db.commit()
        print(f"グローバルデフォルトペルソナ {created} 件を投入しました。")
        for t in DEFAULT_PERSONA_TEMPLATES:
            print(f"  + {t['name']} ({t['age']}歳・{t['occupation']})")


def main():
    parser = argparse.ArgumentParser(description="Seed global default personas")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--check", action="store_true", help="現在の状態を確認（デフォルト動作）")
    group.add_argument("--execute", action="store_true", help="投入実行")
    group.add_argument("--reset", action="store_true", help="削除して再投入")
    args = parser.parse_args()

    asyncio.run(run(execute=args.execute or args.reset, reset=args.reset))


if __name__ == "__main__":
    main()
