import asyncio
from datetime import datetime
from uuid import UUID

import openai
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.auth import get_current_user
from app.core.config import settings
from app.core.database import get_db, AsyncSessionLocal
from app.models.persona import Persona
from app.models.simulation import Simulation, SimulationFeedback, SimulationSummary
from app.models.user import User
from app.schemas.simulation import (
    SimulationCreate,
    SimulationRead,
    SimulationFeedbackRead,
    SimulationSummaryRead,
)
from app.services.feedback_generator import generate_feedback_for_persona
from app.services.insight_aggregator import generate_summary

router = APIRouter(prefix="/api/simulations", tags=["simulations"])


async def _select_personas(
    persona_count: int,
    db: AsyncSession,
    user_id,
    selected_persona_ids: list[UUID] | None = None,
) -> list[Persona]:
    if selected_persona_ids is not None:
        unique_ids: list[UUID] = []
        seen_ids: set[UUID] = set()
        for persona_id in selected_persona_ids:
            if persona_id in seen_ids:
                continue
            seen_ids.add(persona_id)
            unique_ids.append(persona_id)

        if not unique_ids:
            raise HTTPException(status_code=400, detail="No target personas selected.")

        from sqlalchemy import or_
        result = await db.execute(
            select(Persona).where(
                Persona.id.in_(unique_ids),
                or_(Persona.user_id == user_id, Persona.user_id.is_(None)),
            )
        )
        personas = result.scalars().all()
        persona_by_id = {persona.id: persona for persona in personas}
        missing_ids = [str(persona_id) for persona_id in unique_ids if persona_id not in persona_by_id]
        if missing_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Selected personas not found: {', '.join(missing_ids)}",
            )

        return [persona_by_id[persona_id] for persona_id in unique_ids]

    from sqlalchemy import func as _func
    # カスタムペルソナ（user固有）が1件以上あればそれを使い、なければグローバルデフォルトを使う
    custom_count = (await db.execute(
        select(_func.count(Persona.id)).where(Persona.user_id == user_id)
    )).scalar_one() or 0

    persona_filter = Persona.user_id == user_id if custom_count > 0 else Persona.user_id.is_(None)
    result = await db.execute(
        select(Persona).where(persona_filter).order_by(Persona.ad_attitude, Persona.id)
    )
    all_personas = result.scalars().all()
    if not all_personas:
        raise HTTPException(status_code=400, detail="No personas in pool. Run seed first.")

    # Pick balanced sample across ad_attitude buckets using round-robin
    ad_attitude_values = ["positive", "neutral", "skeptical"]
    role_buckets: dict[str, list[Persona]] = {v: [] for v in ad_attitude_values}
    for p in all_personas:
        key = p.ad_attitude or "neutral"
        if key not in role_buckets:
            role_buckets[key] = []
        role_buckets[key].append(p)

    role_targets = {
        "positive": 0.40,
        "neutral": 0.45,
        "skeptical": 0.15,
    }

    selected: list[Persona] = []
    for role, ratio in role_targets.items():
        n = max(1, round(persona_count * ratio))
        bucket = role_buckets.get(role, [])
        selected.extend(bucket[:n])

    return selected[:persona_count]


async def _run_simulation_background(
    simulation_id: UUID,
    personas: list,
    article_content: str,
    media_description: str,
) -> None:
    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)

    async def run_one(persona: Persona) -> SimulationFeedback | None:
        async with AsyncSessionLocal() as task_db:
            try:
                result = await generate_feedback_for_persona(
                    simulation_id, persona, article_content, task_db, client,
                    media_description=media_description,
                )
                # 完了件数を atomic にインクリメント
                await task_db.execute(
                    update(Simulation)
                    .where(Simulation.id == simulation_id)
                    .values(completed_feedback_count=Simulation.completed_feedback_count + 1)
                )
                await task_db.commit()
                return result
            except Exception as e:
                print(f"Feedback error for persona {persona.id}: {e}")
                return None

    results = await asyncio.gather(*[run_one(p) for p in personas])
    successful = [f for f in results if f is not None]

    async with AsyncSessionLocal() as db:
        # Generate summary
        if successful:
            result = await db.execute(
                select(SimulationFeedback)
                .where(SimulationFeedback.simulation_id == simulation_id)
                .options(selectinload(SimulationFeedback.persona))
            )
            loaded_feedbacks = result.scalars().all()
            await generate_summary(simulation_id, loaded_feedbacks, db, client)

        simulation = await db.get(Simulation, simulation_id)
        if simulation:
            simulation.status = "completed"
            simulation.completed_at = datetime.utcnow()
            await db.commit()


@router.post("/", response_model=SimulationRead)
async def create_simulation(
    request: SimulationCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    personas = await _select_personas(
        request.persona_count,
        db,
        current_user.id,
        request.selected_persona_ids,
    )

    simulation = Simulation(
        user_id=current_user.id,
        article_id=request.article_id,
        article_content=request.article_content,
        article_category=request.article_category,
        persona_count=len(personas),
        completed_feedback_count=0,
        status="running",
    )
    db.add(simulation)
    await db.commit()
    await db.refresh(simulation)

    background_tasks.add_task(
        _run_simulation_background,
        simulation.id,
        personas,
        request.article_content,
        request.media_description or "",
    )

    return simulation


@router.get("/{simulation_id}", response_model=SimulationRead)
async def get_simulation(
    simulation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    simulation = await db.get(Simulation, simulation_id)
    if not simulation or str(simulation.user_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Simulation not found")
    return simulation


@router.get("/{simulation_id}/feedbacks", response_model=list[SimulationFeedbackRead])
async def get_feedbacks(
    simulation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    simulation = await db.get(Simulation, simulation_id)
    if not simulation or str(simulation.user_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Simulation not found")

    result = await db.execute(
        select(SimulationFeedback).where(SimulationFeedback.simulation_id == simulation_id)
    )
    return result.scalars().all()


@router.get("/{simulation_id}/summary", response_model=SimulationSummaryRead)
async def get_summary(
    simulation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    simulation = await db.get(Simulation, simulation_id)
    if not simulation or str(simulation.user_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Simulation not found")

    result = await db.execute(
        select(SimulationSummary).where(SimulationSummary.simulation_id == simulation_id)
    )
    summary = result.scalar_one_or_none()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not yet available")
    return summary
