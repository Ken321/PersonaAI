import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class PersonaChatSession(Base):
    __tablename__ = "persona_chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    persona_id = Column(UUID(as_uuid=True), ForeignKey("personas.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False, default="新しいチャット")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    persona = relationship("Persona")
    messages = relationship(
        "PersonaChatMessage",
        back_populates="chat_session",
        cascade="all, delete-orphan",
        order_by="PersonaChatMessage.created_at",
    )


class PersonaChatMessage(Base):
    __tablename__ = "persona_chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("persona_chat_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender_type = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    chat_session = relationship("PersonaChatSession", back_populates="messages")
