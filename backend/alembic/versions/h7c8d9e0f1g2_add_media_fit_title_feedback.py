"""add media_fit and title_feedback, remove what_missed

Revision ID: h7c8d9e0f1g2
Revises: g6b7c8d9e0f1
Create Date: 2026-03-12 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "h7c8d9e0f1g2"
down_revision = "g6b7c8d9e0f1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column("simulation_feedbacks", "what_missed")
    op.add_column("simulation_feedbacks", sa.Column("media_fit", sa.Text(), nullable=True))
    op.add_column("simulation_feedbacks", sa.Column("title_feedback", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("simulation_feedbacks", "media_fit")
    op.drop_column("simulation_feedbacks", "title_feedback")
    op.add_column("simulation_feedbacks", sa.Column("what_missed", sa.Text(), nullable=True))
