"""add what_failed to simulation_feedbacks

Revision ID: l1g2h3i4j5k6
Revises: k0f1g2h3i4j5
Create Date: 2026-03-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'l1g2h3i4j5k6'
down_revision = 'k0f1g2h3i4j5'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('simulation_feedbacks', sa.Column('what_failed', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('simulation_feedbacks', 'what_failed')
