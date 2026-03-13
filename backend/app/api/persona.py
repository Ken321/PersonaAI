from datetime import datetime
from uuid import UUID

import openai
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.auth import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.chat import PersonaChatMessage, PersonaChatSession
from app.models.persona import Persona
from app.models.user import User
from app.schemas.chat import (
    PersonaChatMessageRead,
    PersonaChatPersonaSummary,
    PersonaChatSendRequest,
    PersonaChatSessionCreate,
    PersonaChatSessionRead,
    PersonaChatSessionSummary,
)

router = APIRouter(prefix="/api/persona", tags=["persona"])

MODEL = "gpt-4o-mini"
DEFAULT_CHAT_TITLE = "新しいチャット"


class ChatRequest(BaseModel):
    persona_name: str
    persona_background: str
    message: str
    history: list[dict] = Field(default_factory=list)


def _build_system_prompt(persona_name: str, persona_background: str) -> str:
    return (
        f"あなたは {persona_name} というペルソナです。\n"
        f"背景: {persona_background}\n"
        "ユーザーの質問に対して、このペルソナの視点から日本語で率直に答えてください。"
    )


def _build_chat_title(message: str) -> str:
    normalized = " ".join(message.strip().split())
    if not normalized:
        return DEFAULT_CHAT_TITLE
    return normalized[:40]


def _serialize_persona(persona: Persona) -> PersonaChatPersonaSummary:
    return PersonaChatPersonaSummary.model_validate(persona)


def _serialize_message(message: PersonaChatMessage) -> PersonaChatMessageRead:
    return PersonaChatMessageRead.model_validate(message)


def _serialize_chat_summary(chat: PersonaChatSession) -> PersonaChatSessionSummary:
    last_message = chat.messages[-1] if chat.messages else None
    return PersonaChatSessionSummary(
        id=chat.id,
        persona_id=chat.persona_id,
        title=chat.title,
        preview=last_message.content if last_message else None,
        message_count=len(chat.messages),
        last_message_at=last_message.created_at if last_message else None,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        persona=_serialize_persona(chat.persona),
    )


def _serialize_chat(chat: PersonaChatSession) -> PersonaChatSessionRead:
    summary = _serialize_chat_summary(chat)
    return PersonaChatSessionRead(
        **summary.model_dump(),
        messages=[_serialize_message(message) for message in chat.messages],
    )


def _chat_message_to_openai(message: PersonaChatMessage) -> dict[str, str]:
    if message.sender_type == "persona":
        role = "assistant"
    elif message.sender_type == "user":
        role = "user"
    else:
        role = "system"
    return {"role": role, "content": message.content}


async def _get_chat_or_404(chat_id: UUID, db: AsyncSession, user_id) -> PersonaChatSession:
    result = await db.execute(
        select(PersonaChatSession)
        .where(PersonaChatSession.id == chat_id, PersonaChatSession.user_id == user_id)
        .options(
            selectinload(PersonaChatSession.persona),
            selectinload(PersonaChatSession.messages),
        )
    )
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat session not found.")
    return chat


@router.get("/chats", response_model=list[PersonaChatSessionSummary])
async def list_chats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PersonaChatSession)
        .where(PersonaChatSession.user_id == current_user.id)
        .options(
            selectinload(PersonaChatSession.persona),
            selectinload(PersonaChatSession.messages),
        )
        .order_by(PersonaChatSession.updated_at.desc())
    )
    chats = result.scalars().all()
    return [_serialize_chat_summary(chat) for chat in chats]


@router.post("/chats", response_model=PersonaChatSessionRead, status_code=201)
async def create_chat(
    body: PersonaChatSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    persona = await db.get(Persona, body.persona_id)
    # user_id=NULLのグローバルデフォルト、またはそのユーザーのペルソナならOK
    if not persona or (persona.user_id is not None and str(persona.user_id) != str(current_user.id)):
        raise HTTPException(status_code=404, detail="Persona not found.")

    chat = PersonaChatSession(
        user_id=current_user.id,
        persona_id=persona.id,
        title=(body.title or "").strip() or DEFAULT_CHAT_TITLE,
    )
    db.add(chat)
    await db.commit()

    chat = await _get_chat_or_404(chat.id, db, current_user.id)
    return _serialize_chat(chat)


@router.get("/chats/{chat_id}", response_model=PersonaChatSessionRead)
async def get_chat(
    chat_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = await _get_chat_or_404(chat_id, db, current_user.id)
    return _serialize_chat(chat)


@router.post("/chats/{chat_id}/stream")
async def stream_chat_message(
    chat_id: UUID,
    body: PersonaChatSendRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    message_text = body.message.strip()
    if not message_text:
        raise HTTPException(status_code=400, detail="Message is required.")

    chat = await _get_chat_or_404(chat_id, db, current_user.id)
    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)

    had_messages = len(chat.messages) > 0
    history = [_chat_message_to_openai(message) for message in chat.messages]

    user_message = PersonaChatMessage(
        chat_session_id=chat.id,
        sender_type="user",
        content=message_text,
    )
    db.add(user_message)

    if not had_messages and chat.title == DEFAULT_CHAT_TITLE:
        chat.title = _build_chat_title(message_text)
    chat.updated_at = datetime.utcnow()
    await db.commit()

    persona_name = chat.persona.name or chat.persona.display_name or f"{chat.persona.age}歳・{chat.persona.gender}"
    messages = [
        {"role": "system", "content": _build_system_prompt(persona_name, chat.persona.narrative)},
        *history,
        {"role": "user", "content": message_text},
    ]

    async def generate():
        accumulated = ""
        stream = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            stream=True,
        )
        async for chunk in stream:
            text = chunk.choices[0].delta.content or ""
            if text:
                accumulated += text
                yield f"data: {text}\n\n"

        if accumulated.strip():
            db.add(
                PersonaChatMessage(
                    chat_session_id=chat.id,
                    sender_type="persona",
                    content=accumulated,
                )
            )
            chat.updated_at = datetime.utcnow()
            await db.commit()
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/chat/stream")
async def stream_chat(request: ChatRequest):
    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    messages = [
        {"role": "system", "content": _build_system_prompt(request.persona_name, request.persona_background)},
        *request.history,
        {"role": "user", "content": request.message},
    ]

    async def generate():
        stream = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            stream=True,
        )
        async for chunk in stream:
            text = chunk.choices[0].delta.content or ""
            if text:
                yield f"data: {text}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
