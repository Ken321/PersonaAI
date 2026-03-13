"""add index on personas.created_at

Revision ID: k0f1g2h3i4j5
Revises: j9e0f1g2h3i4
Create Date: 2026-03-13 00:00:00.000000

"""
from alembic import op

revision = 'k0f1g2h3i4j5'
down_revision = 'j9e0f1g2h3i4'
branch_labels = None
depends_on = None


def upgrade():
    op.create_index('ix_personas_created_at', 'personas', ['created_at'])


def downgrade():
    op.drop_index('ix_personas_created_at', table_name='personas')
