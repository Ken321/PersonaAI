import json

import openai
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.persona import Persona
from app.models.simulation import SimulationFeedback
from app.prompts.insight_generation import (
    FEEDBACK_SYSTEM_PROMPT, FEEDBACK_USER_PROMPT,
    MEDIA_FIT_WITH_CONTEXT, MEDIA_FIT_WITHOUT_CONTEXT,
)
from app.prompts.feedback_roles import ROLE_INSTRUCTIONS


async def generate_feedback_for_persona(
    simulation_id,
    persona: Persona,
    article_content: str,
    db: AsyncSession,
    client: openai.AsyncOpenAI,
    media_description: str = "",
) -> SimulationFeedback:
    role_instruction = ROLE_INSTRUCTIONS.get(persona.ad_attitude or "neutral", "")

    system_prompt = FEEDBACK_SYSTEM_PROMPT.format(
        narrative=persona.narrative,
        role_instruction=role_instruction,
    )

    if media_description:
        media_section = f"\n【このメディアについて】\n{media_description}\n\n"
        media_fit_instruction = MEDIA_FIT_WITH_CONTEXT
    else:
        media_section = "\n"
        media_fit_instruction = MEDIA_FIT_WITHOUT_CONTEXT

    user_prompt = FEEDBACK_USER_PROMPT.format(
        article_content=article_content,
        media_section=media_section,
        media_fit_instruction=media_fit_instruction,
    )

    response = await client.chat.completions.create(
        model=settings.feedback_generation_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content or "{}"
    data = json.loads(raw)

    scores = data.get("scores", {})

    feedback = SimulationFeedback(
        simulation_id=simulation_id,
        persona_id=persona.id,
        honest_reaction=data.get("honest_reaction"),
        what_worked=data.get("what_worked"),
        media_fit=data.get("media_fit"),
        title_feedback=data.get("title_feedback"),
        rewrite_suggestion=data.get("rewrite_suggestion"),
        score_relevance=scores.get("relevance"),
        score_credibility=scores.get("credibility"),
        score_engagement=scores.get("engagement"),
        score_purchase_intent=scores.get("purchase_intent"),
        generated_by=settings.feedback_generation_model,
        input_tokens=response.usage.prompt_tokens if response.usage else None,
        output_tokens=response.usage.completion_tokens if response.usage else None,
    )
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    return feedback
