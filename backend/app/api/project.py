from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.project import ProjectSettings
from app.models.user import User

router = APIRouter(prefix="/api/project-settings", tags=["project-settings"])

SEGMENT_SETTINGS_KEY = "_segment_settings"
ARTICLE_FEEDBACK_STATE_KEY = "_article_feedback_state"
ACTIVE_PERSONA_ID_KEY = "_active_persona_id"


def _normalize_storage_payload(value: dict | None) -> dict:
    if isinstance(value, dict):
        return dict(value)
    return {}


def _extract_segment_settings(value: dict | None) -> dict | None:
    payload = _normalize_storage_payload(value)
    has_reserved_keys = any(
        key in payload
        for key in (SEGMENT_SETTINGS_KEY, ARTICLE_FEEDBACK_STATE_KEY, ACTIVE_PERSONA_ID_KEY)
    )
    if has_reserved_keys:
        segment_settings = payload.get(SEGMENT_SETTINGS_KEY)
        return segment_settings if isinstance(segment_settings, dict) else None
    return payload or None


def _extract_article_feedback_state(value: dict | None) -> dict | None:
    payload = _normalize_storage_payload(value)
    article_feedback_state = payload.get(ARTICLE_FEEDBACK_STATE_KEY)
    return article_feedback_state if isinstance(article_feedback_state, dict) else None


def _extract_active_persona_id(value: dict | None) -> str | None:
    payload = _normalize_storage_payload(value)
    active_persona_id = payload.get(ACTIVE_PERSONA_ID_KEY)
    return active_persona_id if isinstance(active_persona_id, str) and active_persona_id else None


def _serialize_project_payload(
    current_value: dict | None,
    *,
    segment_settings: dict | None | object = ...,
    article_feedback_state: dict | None | object = ...,
    active_persona_id: str | None | object = ...,
) -> dict | None:
    existing_payload = _normalize_storage_payload(current_value)
    has_reserved_keys = any(
        key in existing_payload
        for key in (SEGMENT_SETTINGS_KEY, ARTICLE_FEEDBACK_STATE_KEY, ACTIVE_PERSONA_ID_KEY)
    )
    payload = (
        dict(existing_payload)
        if has_reserved_keys
        else ({SEGMENT_SETTINGS_KEY: existing_payload} if existing_payload else {})
    )

    if segment_settings is not ...:
        if segment_settings:
            payload[SEGMENT_SETTINGS_KEY] = segment_settings
        else:
            payload.pop(SEGMENT_SETTINGS_KEY, None)

    if article_feedback_state is not ...:
        if article_feedback_state:
            payload[ARTICLE_FEEDBACK_STATE_KEY] = article_feedback_state
        else:
            payload.pop(ARTICLE_FEEDBACK_STATE_KEY, None)

    if active_persona_id is not ...:
        if active_persona_id:
            payload[ACTIVE_PERSONA_ID_KEY] = active_persona_id
        else:
            payload.pop(ACTIVE_PERSONA_ID_KEY, None)

    return payload or None


class ProjectSettingsUpdate(BaseModel):
    assigned_persona_ids: list[str] | None = None
    segment_settings: dict | None = None
    article_feedback_state: dict | None = None
    active_persona_id: str | None = None
    media_info: dict | None = None


class ProjectSettingsRead(BaseModel):
    assigned_persona_ids: list[str]
    segment_settings: dict | None
    article_feedback_state: dict | None
    active_persona_id: str | None
    media_info: dict | None

    model_config = {"from_attributes": True}


@router.get("/", response_model=ProjectSettingsRead)
async def get_project_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = await db.get(ProjectSettings, current_user.id)
    if not settings:
        return ProjectSettingsRead(
            assigned_persona_ids=[],
            segment_settings=None,
            article_feedback_state=None,
            active_persona_id=None,
            media_info=None,
        )
    return ProjectSettingsRead(
        assigned_persona_ids=settings.assigned_persona_ids or [],
        segment_settings=_extract_segment_settings(settings.segment_settings),
        article_feedback_state=_extract_article_feedback_state(settings.segment_settings),
        active_persona_id=_extract_active_persona_id(settings.segment_settings),
        media_info=settings.media_info,
    )


@router.put("/", response_model=ProjectSettingsRead)
async def update_project_settings(
    body: ProjectSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = await db.get(ProjectSettings, current_user.id)
    if not settings:
        settings = ProjectSettings(user_id=current_user.id)
        db.add(settings)

    if "assigned_persona_ids" in body.model_fields_set:
        settings.assigned_persona_ids = body.assigned_persona_ids
    if "media_info" in body.model_fields_set:
        settings.media_info = body.media_info
    if (
        "segment_settings" in body.model_fields_set
        or "article_feedback_state" in body.model_fields_set
        or "active_persona_id" in body.model_fields_set
    ):
        settings.segment_settings = _serialize_project_payload(
            settings.segment_settings,
            segment_settings=body.segment_settings if "segment_settings" in body.model_fields_set else ...,
            article_feedback_state=(
                body.article_feedback_state if "article_feedback_state" in body.model_fields_set else ...
            ),
            active_persona_id=body.active_persona_id if "active_persona_id" in body.model_fields_set else ...,
        )
    settings.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(settings)
    return ProjectSettingsRead(
        assigned_persona_ids=settings.assigned_persona_ids or [],
        segment_settings=_extract_segment_settings(settings.segment_settings),
        article_feedback_state=_extract_article_feedback_state(settings.segment_settings),
        active_persona_id=_extract_active_persona_id(settings.segment_settings),
        media_info=settings.media_info,
    )
