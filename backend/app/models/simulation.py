import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, JSON, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    article_id = Column(String(100), nullable=True)
    article_content = Column(Text, nullable=False)
    article_category = Column(String(50), nullable=True)
    persona_count = Column(Integer, nullable=False)
    completed_feedback_count = Column(Integer, default=0, nullable=False)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    feedbacks = relationship("SimulationFeedback", back_populates="simulation")
    summary = relationship("SimulationSummary", back_populates="simulation", uselist=False)


class SimulationFeedback(Base):
    __tablename__ = "simulation_feedbacks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    simulation_id = Column(UUID(as_uuid=True), ForeignKey("simulations.id"), nullable=False)
    persona_id = Column(UUID(as_uuid=True), ForeignKey("personas.id"), nullable=False)

    honest_reaction = Column(Text)
    what_worked = Column(Text)
    what_failed = Column(Text)
    media_fit = Column(Text)
    title_feedback = Column(Text)
    rewrite_suggestion = Column(Text)

    score_relevance = Column(Integer)
    score_credibility = Column(Integer)
    score_engagement = Column(Integer)
    score_purchase_intent = Column(Integer)

    generated_by = Column(String(50))
    input_tokens = Column(Integer)
    output_tokens = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    simulation = relationship("Simulation", back_populates="feedbacks")
    persona = relationship("Persona")


class SimulationSummary(Base):
    __tablename__ = "simulation_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    simulation_id = Column(UUID(as_uuid=True), ForeignKey("simulations.id"), unique=True)

    overall_scores = Column(JSON)
    scores_by_role = Column(JSON)
    scores_by_age_group = Column(JSON)
    scores_by_region = Column(JSON)
    key_insights = Column(JSON)
    improvement_suggestions = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    simulation = relationship("Simulation", back_populates="summary")
