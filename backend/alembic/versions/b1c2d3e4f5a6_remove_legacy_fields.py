"""remove legacy persona fields

Revision ID: b1c2d3e4f5a6
Revises: a1b2c3d4e5f6
Create Date: 2026-03-10

"""
from alembic import op
import sqlalchemy as sa

revision = 'b1c2d3e4f5a6'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column('personas', 'name')
    op.drop_column('personas', 'personal_values')
    op.drop_column('personas', 'life_attitude')
    op.drop_column('personas', 'life_story')
    op.drop_column('personas', 'age_group')
    op.drop_column('personas', 'info_sensitivity')
    op.drop_column('personas', 'feedback_role')
    op.drop_column('personas', 'input_age')
    op.drop_column('personas', 'input_gender')
    op.drop_column('personas', 'input_region_type')
    op.drop_column('personas', 'input_occupation')


def downgrade() -> None:
    pass
