import uuid
import enum
from datetime import datetime

from sqlalchemy import Column, String, Integer, JSON, Text, DateTime, Boolean, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class RegionType(str, enum.Enum):
    METRO = "metro"
    REGIONAL_CITY = "regional"
    RURAL = "rural"


class Persona(Base):
    __tablename__ = "personas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)

    country = Column(String(50), nullable=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    city = Column(String(100), nullable=False)
    prefecture = Column(String(50), nullable=False)
    occupation = Column(String(200), nullable=False)
    interests = Column(Text, nullable=False)

    region_type = Column(SAEnum(RegionType), nullable=False)

    narrative = Column(Text, nullable=False)
    structured_attributes = Column(JSON, nullable=True)
    attribute_count = Column(Integer, default=0)

    # DeepPersona: display and summary fields
    name = Column(String(100), nullable=True)
    display_name = Column(String(100), nullable=True)
    one_line_summary = Column(String(300), nullable=True)

    # DeepPersona: filter attributes extracted from narrative + taxonomy
    occupation_category = Column(String(50), nullable=True)  # 会社員/自営業/フリーランス/etc.
    info_style = Column(String(30), nullable=True)            # sns/news_app/traditional_media/word_of_mouth
    ad_attitude = Column(String(20), nullable=True)           # positive/neutral/skeptical
    disposable_income = Column(String(10), nullable=True)     # high/medium/low
    sns_activity = Column(String(10), nullable=True)          # high/medium/low

    # Soft-delete flag
    is_active = Column(Boolean, default=True, nullable=False)

    # Default persona flag: True = system-provided default (shown only when user has no custom personas)
    is_default = Column(Boolean, default=False, nullable=False)

    generated_by = Column(String(50), nullable=False)
    generation_cost_usd = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
