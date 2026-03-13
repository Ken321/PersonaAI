"""replace feedback fields writer focus

Revision ID: g6b7c8d9e0f1
Revises: f5a6b7c8d9e0
Create Date: 2026-03-12 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "g6b7c8d9e0f1"
down_revision = "a7b8c9d0e1f2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column("simulation_feedbacks", "first_impression")
    op.drop_column("simulation_feedbacks", "share_intent")
    op.drop_column("simulation_feedbacks", "behavior_change")
    op.drop_column("simulation_feedbacks", "score_shareability")

    op.add_column("simulation_feedbacks", sa.Column("what_worked", sa.Text(), nullable=True))
    op.add_column("simulation_feedbacks", sa.Column("what_missed", sa.Text(), nullable=True))
    op.add_column("simulation_feedbacks", sa.Column("rewrite_suggestion", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("simulation_feedbacks", "what_worked")
    op.drop_column("simulation_feedbacks", "what_missed")
    op.drop_column("simulation_feedbacks", "rewrite_suggestion")

    op.add_column("simulation_feedbacks", sa.Column("first_impression", sa.Text(), nullable=True))
    op.add_column("simulation_feedbacks", sa.Column("share_intent", sa.JSON(), nullable=True))
    op.add_column("simulation_feedbacks", sa.Column("behavior_change", sa.JSON(), nullable=True))
    op.add_column("simulation_feedbacks", sa.Column("score_shareability", sa.Integer(), nullable=True))
