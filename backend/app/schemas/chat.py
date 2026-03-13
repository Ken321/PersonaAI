from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class PersonaChatPersonaSummary(BaseModel):
    id: UUID
    name: str | None = None
    display_name: str | None = None
    age: int
    gender: str
    occupation: str
    narrative: str
    one_line_summary: str | None = None

    model_config = {"from_attributes": True}


class PersonaChatMessageRead(BaseModel):
    id: UUID
    sender_type: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PersonaChatSessionCreate(BaseModel):
    persona_id: UUID
    title: str | None = None


class PersonaChatSendRequest(BaseModel):
    message: str


class PersonaChatSessionSummary(BaseModel):
    id: UUID
    persona_id: UUID
    title: str
    preview: str | None = None
    message_count: int
    last_message_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    persona: PersonaChatPersonaSummary


class PersonaChatSessionRead(PersonaChatSessionSummary):
    messages: list[PersonaChatMessageRead] = Field(default_factory=list)
