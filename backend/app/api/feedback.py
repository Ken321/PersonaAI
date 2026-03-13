from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import openai
from app.core.config import settings

router = APIRouter(prefix="/api/feedback", tags=["feedback"])

MODEL = "gpt-4o-mini"


class FeedbackRequest(BaseModel):
    article_content: str
    persona_name: str
    persona_background: str


@router.post("/stream")
async def stream_feedback(request: FeedbackRequest):
    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)

    system_prompt = (
        f"あなたは {request.persona_name} というペルソナです。\n"
        f"背景: {request.persona_background}\n"
        "以下の記事を読んで、このペルソナとしての率直なフィードバックを日本語で提供してください。\n"
        "・記事の印象（刺さった点・刺さらなかった点）\n"
        "・行動意欲への影響\n"
        "・改善してほしい点"
    )

    async def generate():
        stream = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.article_content},
            ],
            stream=True,
        )
        async for chunk in stream:
            text = chunk.choices[0].delta.content or ""
            if text:
                yield f"data: {text}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
