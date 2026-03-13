"""
Batch APIを使ったペルソナプール生成スクリプト（約50%コスト削減）

ワークフロー:
  1. submit  : バッチジョブを投入してjob IDを保存
  2. status  : ジョブの進捗を確認
  3. collect : 完了後に結果を取得してDBに保存

使用方法:
  python scripts/seed_personas_batch.py submit [--indices 0,1,2]
  python scripts/seed_personas_batch.py status --batch-id <batch_id>
  python scripts/seed_personas_batch.py collect --batch-id <batch_id>
"""

import asyncio
import argparse
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.seed_personas import PERSONA_TEMPLATES
from app.prompts.persona_generation import (
    PERSONA_GENERATION_SYSTEM_PROMPT,
    PERSONA_GENERATION_USER_PROMPT,
)


def build_batch_requests(templates: list[dict]) -> list[dict]:
    """各テンプレートをBatch APIリクエスト形式に変換"""
    requests = []
    for i, t in enumerate(templates):
        user_prompt = PERSONA_GENERATION_USER_PROMPT.format(
            age=t["age"],
            gender=t["gender"],
            city=t["city"],
            prefecture=t["prefecture"],
            occupation=t["occupation"],
            personal_values=t["personal_values"],
            life_attitude=t["life_attitude"],
            life_story=t["life_story"],
            interests=t["interests"],
        )
        requests.append({
            "custom_id": f"persona-{i}",
            "method": "POST",
            "url": "/v1/chat/completions",
            "body": {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": PERSONA_GENERATION_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                "max_tokens": 1500,
            },
        })
    return requests


async def cmd_submit(indices: list[int] | None):
    import openai
    from app.core.config import settings

    templates = PERSONA_TEMPLATES
    if indices:
        templates = [PERSONA_TEMPLATES[i] for i in indices if i < len(PERSONA_TEMPLATES)]

    requests = build_batch_requests(templates)

    # JSOLファイルをメモリ上で構築
    jsonl_content = "\n".join(json.dumps(r, ensure_ascii=False) for r in requests)
    jsonl_bytes = jsonl_content.encode("utf-8")

    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)

    print(f"Uploading {len(requests)} requests...")
    file_obj = await client.files.create(
        file=("batch_input.jsonl", jsonl_bytes, "application/jsonl"),
        purpose="batch",
    )
    print(f"File uploaded: {file_obj.id}")

    batch = await client.batches.create(
        input_file_id=file_obj.id,
        endpoint="/v1/chat/completions",
        completion_window="24h",
    )
    print(f"\nBatch submitted!")
    print(f"  Batch ID : {batch.id}")
    print(f"  Status   : {batch.status}")
    print(f"\n次のコマンドで状況確認:")
    print(f"  python scripts/seed_personas_batch.py status --batch-id {batch.id}")

    # batch IDをファイルに保存しておく
    state_path = os.path.join(os.path.dirname(__file__), ".batch_state.json")
    state = {"batch_id": batch.id, "template_indices": list(range(len(templates))) if not indices else indices}
    with open(state_path, "w") as f:
        json.dump(state, f)
    print(f"\n(Batch IDは {state_path} にも保存しました)")


async def cmd_status(batch_id: str):
    import openai
    from app.core.config import settings

    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    batch = await client.batches.retrieve(batch_id)

    print(f"Batch ID : {batch.id}")
    print(f"Status   : {batch.status}")
    if batch.request_counts:
        print(f"Requests : total={batch.request_counts.total}, "
              f"completed={batch.request_counts.completed}, "
              f"failed={batch.request_counts.failed}")
    if batch.status == "completed":
        print(f"\n完了しています！以下で結果を取得してDBに保存できます:")
        print(f"  python scripts/seed_personas_batch.py collect --batch-id {batch.id}")
    elif batch.status in ("failed", "expired", "cancelled"):
        print(f"\nバッチが失敗/期限切れ/キャンセルされました: {batch.errors}")
    else:
        print(f"\nまだ処理中です。しばらくしてから再確認してください。")


async def cmd_collect(batch_id: str):
    import openai
    from app.core.config import settings
    from app.core.database import AsyncSessionLocal, init_db
    from app.models.persona import Persona, AgeGroup, RegionType, InfoSensitivity, FeedbackRole

    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    batch = await client.batches.retrieve(batch_id)

    if batch.status != "completed":
        print(f"バッチはまだ完了していません (status: {batch.status})")
        return

    print("結果ファイルをダウンロード中...")
    content = await client.files.content(batch.output_file_id)
    lines = content.text.strip().split("\n")

    # custom_id → narrative のマップを作る
    results: dict[str, str] = {}
    errors = []
    for line in lines:
        item = json.loads(line)
        custom_id = item["custom_id"]
        if item.get("error"):
            errors.append({"id": custom_id, "error": item["error"]})
            continue
        narrative = item["response"]["body"]["choices"][0]["message"]["content"]
        results[custom_id] = narrative

    print(f"成功: {len(results)}, 失敗: {len(errors)}")
    if errors:
        print("失敗したリクエスト:", errors)

    await init_db()
    created = 0
    async with AsyncSessionLocal() as db:
        for custom_id, narrative in results.items():
            idx = int(custom_id.split("-")[1])
            t = PERSONA_TEMPLATES[idx]
            persona = Persona(
                age=t["age"],
                gender=t["gender"],
                city=t["city"],
                prefecture=t["prefecture"],
                occupation=t["occupation"],
                personal_values=t["personal_values"],
                life_attitude=t["life_attitude"],
                life_story=t["life_story"],
                interests=t["interests"],
                age_group=AgeGroup(t["age_group"]),
                region_type=RegionType(t["region_type"]),
                info_sensitivity=InfoSensitivity(t["info_sensitivity"]),
                feedback_role=FeedbackRole(t["feedback_role"]),
                narrative=narrative,
                generated_by="gpt-4o-mini-batch",
            )
            db.add(persona)
            created += 1
        await db.commit()

    print(f"\n{created} 件のペルソナをDBに保存しました。")


def main():
    parser = argparse.ArgumentParser(description="Batch APIでペルソナプールを生成")
    subparsers = parser.add_subparsers(dest="command", required=True)

    sub_submit = subparsers.add_parser("submit", help="バッチジョブを投入")
    sub_submit.add_argument("--indices", type=str, help="カンマ区切りのインデックス (例: 0,1,2)")

    sub_status = subparsers.add_parser("status", help="バッチジョブの状況確認")
    sub_status.add_argument("--batch-id", type=str, help="Batch ID (省略時は保存済みIDを使用)")

    sub_collect = subparsers.add_parser("collect", help="完了済みバッチの結果をDBに保存")
    sub_collect.add_argument("--batch-id", type=str, help="Batch ID (省略時は保存済みIDを使用)")

    args = parser.parse_args()

    # batch IDが省略された場合は保存済みファイルから読む
    state_path = os.path.join(os.path.dirname(__file__), ".batch_state.json")

    def get_batch_id():
        if hasattr(args, "batch_id") and args.batch_id:
            return args.batch_id
        if os.path.exists(state_path):
            with open(state_path) as f:
                return json.load(f)["batch_id"]
        print("--batch-id を指定してください")
        sys.exit(1)

    if args.command == "submit":
        indices = None
        if args.indices:
            indices = [int(x.strip()) for x in args.indices.split(",")]
        asyncio.run(cmd_submit(indices))
    elif args.command == "status":
        asyncio.run(cmd_status(get_batch_id()))
    elif args.command == "collect":
        asyncio.run(cmd_collect(get_batch_id()))


if __name__ == "__main__":
    main()
