from datetime import datetime

from sqlalchemy import Column, JSON, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class ProjectSettings(Base):
    __tablename__ = "project_settings"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    assigned_persona_ids = Column(JSON, default=list)
    segment_settings = Column(JSON, nullable=True)
    media_info = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
