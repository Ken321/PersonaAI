from uuid import UUID
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, model_validator

from app.models.persona import RegionType


class PersonaBase(BaseModel):
    country: Optional[str] = None
    age: int
    gender: str
    city: str
    prefecture: str
    occupation: str
    interests: str
    region_type: RegionType
    name: Optional[str] = None
    display_name: Optional[str] = None
    one_line_summary: Optional[str] = None
    info_style: Optional[str] = None
    ad_attitude: Optional[str] = None


class PersonaRead(PersonaBase):
    id: UUID
    narrative: str
    structured_attributes: Optional[Any] = None
    attribute_count: int
    generated_by: str
    generation_cost_usd: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PersonaListItem(BaseModel):
    id: UUID
    country: Optional[str] = None
    age: int
    gender: str
    city: str
    prefecture: str
    occupation: str
    region_type: RegionType
    name: Optional[str] = None
    display_name: Optional[str] = None
    one_line_summary: Optional[str] = None
    info_style: Optional[str] = None
    ad_attitude: Optional[str] = None
    narrative: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PersonaPoolStats(BaseModel):
    total: int
    by_region_type: dict[str, int]
    by_info_style: dict[str, int]
    by_ad_attitude: dict[str, int]


class GeneratePersonaPoolRequest(BaseModel):
    dry_run: bool = False
    indices: Optional[list[int]] = None


# ---- DeepPersona generation schemas ----

class DeepPersonaGenerateRequest(BaseModel):
    age: Optional[int] = None
    age_range: Optional[str] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    gender: Optional[str] = None
    region_type: Optional[str] = None
    occupation: Optional[str] = None
    prefectures: Optional[list[str]] = None
    occupations: Optional[list[str]] = None
    extra_segments: Optional[list[dict]] = None
    source_text: Optional[str] = None
    count: int = 1
    attribute_richness: int = 200

    @model_validator(mode="after")
    def validate_ranges(self):
        if self.age_min is not None and self.age_max is not None and self.age_min > self.age_max:
            raise ValueError("age_min must be less than or equal to age_max")
        return self


class DeepPersonaSummary(BaseModel):
    id: UUID
    display_name: str
    age: int
    gender: str
    occupation_category: str
    one_line_summary: str

    model_config = {"from_attributes": True}
