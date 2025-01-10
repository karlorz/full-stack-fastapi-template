"""Add new statuses

Revision ID: 20493afff640
Revises: 40184bc09d86
Create Date: 2025-01-10 12:46:04.301014

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '20493afff640'
down_revision = '40184bc09d86'
branch_labels = None
depends_on = None

old_options = ('waiting_upload', 'ready_for_build', 'building', 'deploying', 'success', 'failed')
new_options = sorted(old_options + ('extracting', 'building_image',))

old_type = sa.Enum(*old_options, name='deploymentstatus')
new_type = sa.Enum(*new_options, name='deploymentstatus')
tmp_type = sa.Enum(*new_options, name='_deploymentstatus')

tcr = sa.sql.table('deployment',
                   sa.Column('status', new_type, nullable=False))

def upgrade():
    # Create a temporary "_deploymentstatus" type, convert and drop the "old" type
    tmp_type.create(op.get_bind(), checkfirst=False)
    op.execute('ALTER TABLE deployment ALTER COLUMN status TYPE _deploymentstatus'
               ' USING status::text::_deploymentstatus')
    old_type.drop(op.get_bind(), checkfirst=False)
    # Create and convert to the "new" status type
    new_type.create(op.get_bind(), checkfirst=False)
    op.execute('ALTER TABLE deployment ALTER COLUMN status TYPE deploymentstatus'
               ' USING status::text::deploymentstatus')
    tmp_type.drop(op.get_bind(), checkfirst=False)

def downgrade():
    # Convert new statuses to a fallback status (e.g., 'created')
    op.execute(tcr.update().where(tcr.c.status.in_(['extracting', 'building_image']))
               .values(status='created'))
    # Create a temporary "_deploymentstatus" type, convert and drop the "new" type
    tmp_type.create(op.get_bind(), checkfirst=False)
    op.execute('ALTER TABLE deployment ALTER COLUMN status TYPE _deploymentstatus'
               ' USING status::text::_deploymentstatus')
    new_type.drop(op.get_bind(), checkfirst=False)
    # Create and convert to the "old" status type
    old_type.create(op.get_bind(), checkfirst=False)
    op.execute('ALTER TABLE deployment ALTER COLUMN status TYPE deploymentstatus'
               ' USING status::text::deploymentstatus')
    tmp_type.drop(op.get_bind(), checkfirst=False)
