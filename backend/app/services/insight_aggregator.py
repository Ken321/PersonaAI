import json
from collections import defaultdict
from typing import Any

import openai
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.simulation import SimulationFeedback, SimulationSummary
from app.models.persona import Persona
from app.prompts.insight_generation import INSIGHT_GENERATION_PROMPT


def _avg(values: list[int | None]) -> float | None:
    nums = [v for v in values if v is not None]
    return round(sum(nums) / len(nums), 2) if nums else None


def _aggregate_scores(feedbacks: list[SimulationFeedback]) -> dict[str, Any]:
    score_fields = [
        "score_relevance",
        "score_credibility",
        "score_engagement",
        "score_purchase_intent",
    ]
    overall = {
        field.replace("score_", ""): _avg([getattr(f, field) for f in feedbacks])
        for field in score_fields
    }

    by_role: dict[str, dict] = defaultdict(lambda: defaultdict(list))
    by_region: dict[str, dict] = defaultdict(lambda: defaultdict(list))

    for fb in feedbacks:
        persona: Persona = fb.persona
        role_key = persona.ad_attitude or "neutral"
        region_key = persona.region_type.value

        for field in score_fields:
            val = getattr(fb, field)
            key = field.replace("score_", "")
            by_role[role_key][key].append(val)
            by_region[region_key][key].append(val)

    def avg_dict(d: dict) -> dict:
        return {k: {sk: _avg(sv) for sk, sv in v.items()} for k, v in d.items()}

    return {
        "overall": overall,
        "by_role": avg_dict(by_role),
        "by_region": avg_dict(by_region),
    }


def _build_aggregated_json(feedbacks: list[SimulationFeedback]) -> str:
    items = []
    for fb in feedbacks:
        persona: Persona = fb.persona
        items.append({
            "persona_summary": f"{persona.age}歳/{persona.gender}/{persona.region_type.value}/{persona.ad_attitude or 'neutral'}",
            "honest_reaction": fb.honest_reaction,
            "what_worked": fb.what_worked,
            "media_fit": fb.media_fit,
            "title_feedback": fb.title_feedback,
            "rewrite_suggestion": fb.rewrite_suggestion,
            "scores": {
                "relevance": fb.score_relevance,
                "credibility": fb.score_credibility,
                "engagement": fb.score_engagement,
                "purchase_intent": fb.score_purchase_intent,
            },
        })
    return json.dumps(items, ensure_ascii=False, indent=2)


async def generate_summary(
    simulation_id,
    feedbacks: list[SimulationFeedback],
    db: AsyncSession,
    client: openai.AsyncOpenAI,
    model: str = "",
) -> SimulationSummary:
    if not model:
        model = settings.insight_generation_model
    agg = _aggregate_scores(feedbacks)
    aggregated_json = _build_aggregated_json(feedbacks)

    prompt = INSIGHT_GENERATION_PROMPT.format(
        persona_count=len(feedbacks),
        aggregated_feedbacks_json=aggregated_json,
    )

    response = await client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content or "{}"
    insights = json.loads(raw)

    summary = SimulationSummary(
        simulation_id=simulation_id,
        overall_scores=agg["overall"],
        scores_by_role=agg["by_role"],
        scores_by_region=agg["by_region"],
        key_insights=insights.get("key_insights", []),
        improvement_suggestions=insights.get("improvement_suggestions", []),
    )
    db.add(summary)
    await db.commit()
    await db.refresh(summary)
    return summary
