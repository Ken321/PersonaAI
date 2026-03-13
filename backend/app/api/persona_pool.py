import json
import logging
import random
from uuid import UUID
from typing import Optional, AsyncGenerator

logger = logging.getLogger(__name__)

import openai
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, or_
from sqlalchemy.orm import load_only
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.persona import Persona, RegionType
from app.models.project import ProjectSettings
from app.models.user import User
from app.schemas.persona import (
    PersonaRead,
    PersonaListItem,
    PersonaPoolStats,
    GeneratePersonaPoolRequest,
    DeepPersonaGenerateRequest,
)
from app.services.persona_generator import create_persona_from_template
from app.services.taxonomy_walker import TaxonomyWalker
from app.services.attribute_extractor import AttributeExtractor
from app.prompts.narrative_prompts import NARRATIVE_SYSTEM_PROMPT, NARRATIVE_USER_PROMPT
from app.prompts.taxonomy_prompts import SOURCE_TEXT_ANALYZE_SYSTEM_PROMPT, SOURCE_TEXT_ANALYZE_USER_PROMPT

router = APIRouter(prefix="/api/persona-pool", tags=["persona-pool"])


def _visible_personas_filter(user_id):
    """ユーザーのカスタムペルソナ + グローバルデフォルト（user_id=NULL）を返すフィルタ。"""
    return or_(Persona.user_id == user_id, Persona.user_id.is_(None))


@router.get("/stats", response_model=PersonaPoolStats)
async def get_pool_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base_filter = _visible_personas_filter(current_user.id)

    total = (await db.execute(select(func.count(Persona.id)).where(base_filter))).scalar_one()

    async def count_by_enum(column):
        rows = (await db.execute(
            select(column, func.count(Persona.id))
            .where(base_filter)
            .group_by(column)
        )).all()
        return {str(row[0].value): row[1] for row in rows}

    async def count_by_str(column):
        rows = (await db.execute(
            select(column, func.count(Persona.id))
            .where(base_filter)
            .group_by(column)
        )).all()
        return {str(row[0]) if row[0] is not None else "unknown": row[1] for row in rows}

    return PersonaPoolStats(
        total=total,
        by_region_type=await count_by_enum(Persona.region_type),
        by_info_style=await count_by_str(Persona.info_style),
        by_ad_attitude=await count_by_str(Persona.ad_attitude),
    )


@router.get("/", response_model=list[PersonaListItem])
async def list_personas(
    region_type: Optional[RegionType] = None,
    info_style: Optional[str] = None,
    ad_attitude: Optional[str] = None,
    limit: int = Query(default=100, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ユーザーのカスタムペルソナ + グローバルデフォルト（user_id=NULL）を常に両方返す
    # load_only: structured_attributes（大きいJSON）を除外してDB転送量を削減
    q = select(Persona).options(load_only(
        Persona.id, Persona.country, Persona.age, Persona.gender,
        Persona.city, Persona.prefecture, Persona.occupation,
        Persona.region_type, Persona.name, Persona.display_name,
        Persona.one_line_summary, Persona.info_style, Persona.ad_attitude,
        Persona.narrative, Persona.created_at,
    )).where(_visible_personas_filter(current_user.id))

    if region_type:
        q = q.where(Persona.region_type == region_type)
    if info_style:
        q = q.where(Persona.info_style == info_style)
    if ad_attitude:
        q = q.where(Persona.ad_attitude == ad_attitude)
    q = q.order_by(Persona.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(q)
    return result.scalars().all()


def _is_accessible(persona: Persona, user_id) -> bool:
    """user_id=NULLのグローバルデフォルト、またはそのユーザーのペルソナならアクセス可。"""
    return persona.user_id is None or str(persona.user_id) == str(user_id)


@router.get("/{persona_id}", response_model=PersonaRead)
async def get_persona(
    persona_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    persona = await db.get(Persona, persona_id)
    if not persona or not _is_accessible(persona, current_user.id):
        raise HTTPException(status_code=404, detail="Persona not found")
    return persona


@router.delete("/{persona_id}", status_code=204)
async def delete_persona(
    persona_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    persona = await db.get(Persona, persona_id)
    # グローバルデフォルト（user_id=NULL）はユーザーが削除不可
    if not persona or persona.user_id is None or str(persona.user_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Persona not found")
    await db.delete(persona)
    await db.commit()


@router.post("/regenerate/{persona_id}", response_model=PersonaRead)
async def regenerate_persona(
    persona_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    persona = await db.get(Persona, persona_id)
    # グローバルデフォルト（user_id=NULL）は再生成不可
    if not persona or persona.user_id is None or str(persona.user_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Persona not found")

    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    template = {
        "age": persona.age,
        "gender": persona.gender,
        "city": persona.city,
        "prefecture": persona.prefecture,
        "occupation": persona.occupation,
        "interests": persona.interests,
        "region_type": persona.region_type.value,
    }

    from app.services.persona_generator import generate_persona_narrative
    persona.narrative = await generate_persona_narrative(template, client)
    persona.generated_by = settings.persona_generation_model
    await db.commit()
    await db.refresh(persona)
    return persona


@router.post("/generate")
async def generate_pool(
    request: GeneratePersonaPoolRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from scripts.seed_personas import PERSONA_TEMPLATES

    templates = PERSONA_TEMPLATES
    if request.indices is not None:
        templates = [PERSONA_TEMPLATES[i] for i in request.indices if i < len(PERSONA_TEMPLATES)]

    if request.dry_run:
        return {
            "dry_run": True,
            "would_generate": len(templates),
            "templates": [
                {
                    "index": i,
                    "age": t["age"],
                    "gender": t["gender"],
                    "city": t["city"],
                    "prefecture": t["prefecture"],
                    "occupation": t["occupation"],
                    "age_group": t["age_group"],
                    "region_type": t["region_type"],
                    "info_sensitivity": t["info_sensitivity"],
                    "feedback_role": t["feedback_role"],
                }
                for i, t in enumerate(templates)
            ],
        }

    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    created = []
    errors = []

    for i, template in enumerate(templates):
        try:
            persona = await create_persona_from_template(template, db, client, user_id=current_user.id)
            created.append(str(persona.id))
        except Exception as e:
            errors.append({"index": i, "error": str(e)})

    return {
        "generated": len(created),
        "errors": errors,
        "persona_ids": created,
    }


# ---- DeepPersona SSE generation endpoint ----

def _sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def _pick_random_choice(values: Optional[list[str]]) -> Optional[str]:
    cleaned = [value.strip() for value in values or [] if isinstance(value, str) and value.strip()]
    if not cleaned:
        return None
    return random.choice(cleaned)


def _sample_age(age_min: Optional[int], age_max: Optional[int]) -> Optional[int]:
    if age_min is None and age_max is None:
        return None
    lower = age_min if age_min is not None else 18
    upper = age_max if age_max is not None else 69
    if lower > upper:
        lower, upper = upper, lower
    return random.randint(lower, upper)


def _sample_age_from_range(age_range: Optional[str]) -> Optional[int]:
    age_ranges = {
        "18-24": (18, 24),
        "25-34": (25, 34),
        "35-44": (35, 44),
        "45+": (45, 69),
    }
    bounds = age_ranges.get(age_range or "")
    if not bounds:
        return None
    return random.randint(bounds[0], bounds[1])


def _resolve_anchor(request: DeepPersonaGenerateRequest) -> dict:
    resolved_age = request.age
    if resolved_age is None:
        resolved_age = _sample_age(request.age_min, request.age_max)
    if resolved_age is None:
        resolved_age = _sample_age_from_range(request.age_range)

    resolved_prefecture = _pick_random_choice(request.prefectures)
    resolved_occupation = _pick_random_choice(request.occupations) or request.occupation

    return {
        "age": resolved_age if resolved_age is not None else random.randint(18, 69),
        "age_range": request.age_range,
        "age_min": request.age_min,
        "age_max": request.age_max,
        "gender": request.gender if request.gender else random.choice(["男性", "女性"]),
        "region_type": request.region_type if request.region_type else random.choice(["metro", "regional", "rural"]),
        "prefecture": resolved_prefecture,
        "prefectures": request.prefectures,
        "occupation": resolved_occupation,
        "occupations": request.occupations,
        "extra_segments": request.extra_segments or [],
    }


async def _generate_name(
    client: openai.AsyncOpenAI,
    model: str,
    taxonomy_attributes: dict,
    exclude_names: list[str] | None = None,
) -> str:
    """必須タクソノミー属性（Gender, Age, Location）をもとに日本人名を生成する。"""
    gender_section = taxonomy_attributes.get("Demographics", {}).get("Gender", {})
    # 名前の性別判定は出生時の性別を優先し、なければ Gender Identity にフォールバック
    sex_for_name = gender_section.get("Sex Assigned at Birth") or gender_section.get("Gender Identity", "")
    specific_age = taxonomy_attributes.get("Demographics", {}).get("Age", {}).get("Specific Age", "")
    city = taxonomy_attributes.get("Demographics", {}).get("Location", {}).get("City", "")

    exclude_clause = ""
    if exclude_names:
        names_list = "、".join(exclude_names)
        exclude_clause = f"\n- 以下の名前はすでに使用済みなので避けること: {names_list}"

    prompt = (
        f"以下の属性を持つ日本在住の人物のフルネーム（姓＋名）を1つだけ生成してください。\n"
        f"- 出生時の性別: {sex_for_name}\n"
        f"- 年齢: {specific_age}\n"
        f"- 居住地: {city}"
        f"{exclude_clause}\n\n"
        f"名前だけをそのまま返してください（例: 田中さくら）。説明や記号は不要です。"
    )
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.9,
            max_tokens=30,
        )
        return (response.choices[0].message.content or "").strip()
    except Exception:
        return ""


async def _generate_narrative(client: openai.AsyncOpenAI, model: str, taxonomy_attributes: dict) -> str:
    logger.debug(
        "taxonomy_attributes (count=%d): %s",
        len(taxonomy_attributes),
        json.dumps(taxonomy_attributes, ensure_ascii=False),
    )

    # 値が文字列でないキーをフラット化して警告ログ
    non_str_keys = [k for k, v in taxonomy_attributes.items() if not isinstance(v, str)]
    if non_str_keys:
        logger.warning("taxonomy_attributes has non-string values for keys: %s", non_str_keys)
        # 文字列に変換してフォールバック
        taxonomy_attributes = {
            k: json.dumps(v, ensure_ascii=False) if not isinstance(v, str) else v
            for k, v in taxonomy_attributes.items()
        }

    try:
        attributes_json = json.dumps(taxonomy_attributes, ensure_ascii=False, indent=2)
    except Exception:
        logger.exception("json.dumps failed for taxonomy_attributes")
        raise

    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": NARRATIVE_SYSTEM_PROMPT},
            {"role": "user", "content": NARRATIVE_USER_PROMPT.format(
                attributes_json=attributes_json
            )},
        ],
        temperature=0.9,
    )
    return response.choices[0].message.content or ""


def _get_taxonomy_value(taxonomy_attributes: dict, *path: str) -> str:
    current = taxonomy_attributes
    for key in path:
        if not isinstance(current, dict):
            current = None
            break
        current = current.get(key)

    if isinstance(current, str) and current.strip():
        return current.strip()

    flat_key = " > ".join(path)
    flat_value = taxonomy_attributes.get(flat_key)
    if isinstance(flat_value, str) and flat_value.strip():
        return flat_value.strip()

    return ""


async def _analyze_source_text(
    client: openai.AsyncOpenAI,
    model: str,
    source_text: str,
) -> dict:
    """source_text をGPTで解析し、DeepPersonaGenerateRequest 互換のセグメント情報を返す。"""
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SOURCE_TEXT_ANALYZE_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": SOURCE_TEXT_ANALYZE_USER_PROMPT.format(
                        source_text=source_text
                    ),
                },
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        return json.loads(response.choices[0].message.content or "{}")
    except Exception:
        return {}


async def _deep_persona_stream(
    request: DeepPersonaGenerateRequest,
    db: AsyncSession,
    user_id,
) -> AsyncGenerator[str, None]:
    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    model = settings.persona_generation_model
    walker = TaxonomyWalker(client, model)
    extractor = AttributeExtractor(client, model)

    # 既存ペルソナの名前を取得（重複回避用）
    existing_rows = (await db.execute(select(Persona.name, Persona.display_name))).all()
    used_names: list[str] = [
        row[0] or row[1] for row in existing_rows if row[0] or row[1]
    ]

    # source_text がある場合、GPTで解析してセグメント情報をリクエストに反映
    if request.source_text:
        yield _sse({
            "persona_index": 1,
            "total_count": request.count,
            "step": "analyzing",
            "step_detail": "テキストを解析中...",
            "attribute_count": 0,
            "attribute_richness": request.attribute_richness,
        })
        analyzed = await _analyze_source_text(client, model, request.source_text)
        if not request.age_min and analyzed.get("age_min"):
            request.age_min = analyzed["age_min"]
        if not request.age_max and analyzed.get("age_max"):
            request.age_max = analyzed["age_max"]
        if not request.gender and analyzed.get("gender"):
            request.gender = analyzed["gender"]
        if not request.region_type and analyzed.get("region_type"):
            request.region_type = analyzed["region_type"]
        if not request.prefectures and analyzed.get("prefectures"):
            request.prefectures = analyzed["prefectures"]
        if not request.occupations and analyzed.get("occupations"):
            request.occupations = analyzed["occupations"]
        extra = analyzed.get("extra_segments", [])
        if extra:
            request.extra_segments = (request.extra_segments or []) + extra

    for i in range(request.count):
        persona_index = i + 1
        anchor = _resolve_anchor(request)

        # Step 1: Taxonomy walking
        yield _sse({
            "persona_index": persona_index,
            "total_count": request.count,
            "step": "taxonomy_walking",
            "step_detail": f"属性を生成中... (0/{request.attribute_richness})",
            "attribute_count": 0,
            "attribute_richness": request.attribute_richness,
        })

        taxonomy_attributes: dict = {}
        async for progress in walker.walk(anchor, request.attribute_richness):
            if progress["type"] == "batch_complete":
                taxonomy_attributes.update(progress["attributes"])
                yield _sse({
                    "persona_index": persona_index,
                    "total_count": request.count,
                    "step": "taxonomy_walking",
                    "step_detail": f"属性を生成中... ({len(taxonomy_attributes)}/{request.attribute_richness})",
                    "attribute_count": len(taxonomy_attributes),
                    "attribute_richness": request.attribute_richness,
                })

        # Step 2: Name generation
        yield _sse({
            "persona_index": persona_index,
            "total_count": request.count,
            "step": "name_generation",
            "step_detail": "名前を生成中...",
            "attribute_count": len(taxonomy_attributes),
            "attribute_richness": request.attribute_richness,
        })

        persona_name = await _generate_name(client, model, taxonomy_attributes, exclude_names=used_names)

        # Step 3: Narrative generation
        yield _sse({
            "persona_index": persona_index,
            "total_count": request.count,
            "step": "narrative_generation",
            "step_detail": "ナラティブを生成中...",
            "attribute_count": len(taxonomy_attributes),
            "attribute_richness": request.attribute_richness,
        })

        narrative = await _generate_narrative(client, model, taxonomy_attributes)

        # Step 3: Attribute extraction
        yield _sse({
            "persona_index": persona_index,
            "total_count": request.count,
            "step": "attribute_extraction",
            "step_detail": "フィルタ属性を抽出中...",
            "attribute_count": len(taxonomy_attributes),
            "attribute_richness": request.attribute_richness,
        })

        extracted = await extractor.extract(taxonomy_attributes, narrative)

        # Map region_type to RegionType enum (best effort)
        rt_map = {"metro": RegionType.METRO, "regional": RegionType.REGIONAL_CITY, "rural": RegionType.RURAL}
        region_enum = rt_map.get(extracted.get("region_type", "metro"), RegionType.METRO)

        # Map occupation_category to nearest old field for simulation compatibility
        occ_cat = extracted.get("occupation_category", "会社員")

        info_style = extracted.get("info_style", "news_app")
        ad_att = extracted.get("ad_attitude", "neutral")
        city = _get_taxonomy_value(taxonomy_attributes, "Demographics", "Location", "City")
        prefecture = _get_taxonomy_value(taxonomy_attributes, "Demographics", "Location", "Prefecture") or anchor.get("prefecture") or "東京都"
        occupation = _get_taxonomy_value(taxonomy_attributes, "Career and Work", "Employment", "Job Title") or anchor.get("occupation") or occ_cat

        # 名前を統一: _generate_name の結果を優先し、fallback はエクストラクターの display_name
        final_name = persona_name or extracted["display_name"]

        persona = Persona(
            user_id=user_id,
            age=extracted["age"],
            gender=extracted["gender"],
            city=city,
            prefecture=prefecture,
            occupation=occupation,
            interests="",
            region_type=region_enum,
            narrative=narrative,
            # DeepPersona fields
            name=final_name,
            structured_attributes=taxonomy_attributes,
            attribute_count=len(taxonomy_attributes),
            display_name=final_name,
            one_line_summary=extracted["one_line_summary"],
            occupation_category=occ_cat,
            info_style=info_style,
            ad_attitude=ad_att,
            disposable_income=extracted.get("disposable_income", "medium"),
            sns_activity=extracted.get("sns_activity", "medium"),
            is_active=True,
            generated_by=model,
        )
        db.add(persona)
        await db.commit()
        await db.refresh(persona)

        # 新規作成したペルソナをプロジェクトに自動追加
        project_settings = await db.get(ProjectSettings, user_id)
        if project_settings is None:
            project_settings = ProjectSettings(
                user_id=user_id,
                assigned_persona_ids=[str(persona.id)],
            )
            db.add(project_settings)
        else:
            current_ids = list(project_settings.assigned_persona_ids or [])
            if str(persona.id) not in current_ids:
                current_ids.append(str(persona.id))
                project_settings.assigned_persona_ids = current_ids
        await db.commit()

        used_names.append(final_name)

        yield _sse({
            "persona_index": persona_index,
            "total_count": request.count,
            "step": "completed",
            "persona": {
                "id": str(persona.id),
                "display_name": persona.name,
                "age": persona.age,
                "gender": persona.gender,
                "occupation_category": persona.occupation_category,
                "one_line_summary": persona.one_line_summary,
            },
        })

    yield _sse({"done": True})


@router.post("/generate-stream")
async def generate_personas_stream(
    request: DeepPersonaGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    DeepPersona手法でペルソナを生成する（SSEストリーミング）。
    フロントエンドは EventSource で接続し、progress / completed / done イベントを受け取る。
    """
    return StreamingResponse(
        _deep_persona_stream(request, db, current_user.id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
