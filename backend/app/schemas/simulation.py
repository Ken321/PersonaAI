from uuid import UUID
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel


class SimulationCreate(BaseModel):
    article_content: str
    article_id: Optional[str] = None
    article_category: Optional[str] = None
    persona_count: int = 20
    selected_persona_ids: Optional[list[UUID]] = None
    media_description: Optional[str] = None


class SimulationRead(BaseModel):
    id: UUID
    article_id: Optional[str] = None
    article_category: Optional[str] = None
    persona_count: int
    completed_feedback_count: int = 0
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SimulationFeedbackRead(BaseModel):
    id: UUID
    simulation_id: UUID
    persona_id: UUID
    honest_reaction: Optional[str] = None
    what_worked: Optional[str] = None
    media_fit: Optional[str] = None
    title_feedback: Optional[str] = None
    rewrite_suggestion: Optional[str] = None
    score_relevance: Optional[int] = None
    score_credibility: Optional[int] = None
    score_engagement: Optional[int] = None
    score_purchase_intent: Optional[int] = None
    generated_by: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SimulationSummaryRead(BaseModel):
    id: UUID
    simulation_id: UUID
    overall_scores: Optional[Any] = None
    scores_by_role: Optional[Any] = None
    scores_by_age_group: Optional[Any] = None
    scores_by_region: Optional[Any] = None
    key_insights: Optional[Any] = None
    improvement_suggestions: Optional[Any] = None
    created_at: datetime

    model_config = {"from_attributes": True}
