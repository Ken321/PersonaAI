import openai
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.persona import Persona, RegionType
from app.prompts.persona_generation import (
    PERSONA_GENERATION_SYSTEM_PROMPT,
    PERSONA_GENERATION_USER_PROMPT,
)


async def generate_persona_narrative(anchor: dict, client: openai.AsyncOpenAI) -> str:
    user_prompt = PERSONA_GENERATION_USER_PROMPT.format(
        age=anchor["age"],
        gender=anchor["gender"],
        city=anchor["city"],
        prefecture=anchor["prefecture"],
        occupation=anchor["occupation"],
        personal_values=anchor["personal_values"],
        life_attitude=anchor["life_attitude"],
        life_story=anchor["life_story"],
        interests=anchor["interests"],
    )

    response = await client.chat.completions.create(
        model=settings.persona_generation_model,
        messages=[
            {"role": "system", "content": PERSONA_GENERATION_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )
    return response.choices[0].message.content or ""


async def create_persona_from_template(
    template: dict,
    db: AsyncSession,
    client: openai.AsyncOpenAI,
    user_id=None,
) -> Persona:
    narrative = await generate_persona_narrative(template, client)

    persona = Persona(
        user_id=user_id,
        country=template.get("country"),
        age=template["age"],
        gender=template["gender"],
        city=template["city"],
        prefecture=template["prefecture"],
        occupation=template["occupation"],
        interests=template.get("interests", ""),
        region_type=RegionType(template["region_type"]),
        narrative=narrative,
        generated_by=settings.persona_generation_model,
    )

    db.add(persona)
    await db.commit()
    await db.refresh(persona)
    return persona
