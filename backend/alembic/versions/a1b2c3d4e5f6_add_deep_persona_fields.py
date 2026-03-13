"""add_deep_persona_fields

Revision ID: a1b2c3d4e5f6
Revises: 8face9e20e12
Create Date: 2026-03-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "8face9e20e12"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("personas", sa.Column("input_age", sa.Integer(), nullable=True))
    op.add_column("personas", sa.Column("input_gender", sa.String(length=20), nullable=True))
    op.add_column("personas", sa.Column("input_region_type", sa.String(length=20), nullable=True))
    op.add_column("personas", sa.Column("input_occupation", sa.String(length=200), nullable=True))
    op.add_column("personas", sa.Column("display_name", sa.String(length=100), nullable=True))
    op.add_column("personas", sa.Column("one_line_summary", sa.String(length=300), nullable=True))
    op.add_column("personas", sa.Column("occupation_category", sa.String(length=50), nullable=True))
    op.add_column("personas", sa.Column("info_style", sa.String(length=30), nullable=True))
    op.add_column("personas", sa.Column("ad_attitude", sa.String(length=20), nullable=True))
    op.add_column("personas", sa.Column("disposable_income", sa.String(length=10), nullable=True))
    op.add_column("personas", sa.Column("sns_activity", sa.String(length=10), nullable=True))
    op.add_column(
        "personas",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )


def downgrade() -> None:
    op.drop_column("personas", "is_active")
    op.drop_column("personas", "sns_activity")
    op.drop_column("personas", "disposable_income")
    op.drop_column("personas", "ad_attitude")
    op.drop_column("personas", "info_style")
    op.drop_column("personas", "occupation_category")
    op.drop_column("personas", "one_line_summary")
    op.drop_column("personas", "display_name")
    op.drop_column("personas", "input_occupation")
    op.drop_column("personas", "input_region_type")
    op.drop_column("personas", "input_gender")
    op.drop_column("personas", "input_age")
