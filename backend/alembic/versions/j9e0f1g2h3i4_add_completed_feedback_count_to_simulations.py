"""add completed_feedback_count to simulations

Revision ID: j9e0f1g2h3i4
Revises: i8d9e0f1g2h3
Create Date: 2026-03-13 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "j9e0f1g2h3i4"
down_revision = "i8d9e0f1g2h3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "simulations",
        sa.Column("completed_feedback_count", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("simulations", "completed_feedback_count")
