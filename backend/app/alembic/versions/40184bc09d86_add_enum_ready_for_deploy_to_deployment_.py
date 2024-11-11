"""Add enum ready for deploy to Deployment table in status field

Revision ID: 40184bc09d86
Revises: 4f7bee4fb432
Create Date: 2024-11-06 13:38:58.382030

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '40184bc09d86'
down_revision = '4f7bee4fb432'
branch_labels = None
depends_on = None


old_options = ('waiting_upload', 'building', 'deploying', 'success', 'failed')
new_options = ('waiting_upload', 'ready_for_build', 'building', 'deploying', 'success', 'failed')

old_enum = sa.Enum(*old_options, name='deploymentstatus')
new_enum = sa.Enum(*new_options, name='deploymentstatus')
temp_enum = sa.Enum(*new_options, name='temp_deploymentstatus')

table = sa.sql.table('deployment', sa.Column('status', new_enum, nullable=False))

def upgrade() -> None:
    # Create a temporary column with the new enum type
    op.execute("ALTER TYPE deploymentstatus ADD VALUE IF NOT EXISTS 'ready_for_build'")

def downgrade() -> None:
    # Convert 'ready_for_build' to 'waiting_upload'
    op.execute(
        table.update()
        .where(table.c.status == 'ready_for_build')
        .values(status='waiting_upload')
    )
    temp_enum.create(op.get_bind(), checkfirst=False)
    op.execute(
        "ALTER TABLE deployment ALTER COLUMN status TYPE temp_deploymentstatus USING status::text::temp_deploymentstatus"
    )
    new_enum.drop(op.get_bind(), checkfirst=False)
    old_enum.create(op.get_bind(), checkfirst=False)
    op.execute(
        "ALTER TABLE deployment ALTER COLUMN status TYPE deploymentstatus USING status::text::deploymentstatus"
    )
    temp_enum.drop(op.get_bind(), checkfirst=False)
