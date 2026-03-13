"""add user_id to all tables

Revision ID: f5a6b7c8d9e0
Revises: e4f5a6b7c8d9
Create Date: 2026-03-12 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "f5a6b7c8d9e0"
down_revision = "e4f5a6b7c8d9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # personas: add user_id
    op.add_column("personas", sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True))
    op.create_index("ix_personas_user_id", "personas", ["user_id"])

    # simulations: add user_id
    op.add_column("simulations", sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True))
    op.create_index("ix_simulations_user_id", "simulations", ["user_id"])

    # persona_chat_sessions: add user_id
    op.add_column("persona_chat_sessions", sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True))
    op.create_index("ix_persona_chat_sessions_user_id", "persona_chat_sessions", ["user_id"])

    # project_settings: replace key PK with user_id PK
    # First delete all existing rows (single "default" row is no longer valid)
    op.execute("DELETE FROM project_settings")
    op.add_column("project_settings", sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True))
    op.drop_constraint("project_settings_pkey", "project_settings", type_="primary")
    op.drop_column("project_settings", "key")
    op.alter_column("project_settings", "user_id", nullable=False)
    op.create_primary_key("project_settings_pkey", "project_settings", ["user_id"])


def downgrade() -> None:
    # project_settings: restore key PK
    op.drop_constraint("project_settings_pkey", "project_settings", type_="primary")
    op.drop_column("project_settings", "user_id")
    op.add_column("project_settings", sa.Column("key", sa.String(100), nullable=False))
    op.create_primary_key("project_settings_pkey", "project_settings", ["key"])

    # persona_chat_sessions
    op.drop_index("ix_persona_chat_sessions_user_id", "persona_chat_sessions")
    op.drop_column("persona_chat_sessions", "user_id")

    # simulations
    op.drop_index("ix_simulations_user_id", "simulations")
    op.drop_column("simulations", "user_id")

    # personas
    op.drop_index("ix_personas_user_id", "personas")
    op.drop_column("personas", "user_id")
