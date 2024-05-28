"""merge heads

Revision ID: 4df8ae4a83c0
Revises: 2e7525f9d21b, a17996bd5bff
Create Date: 2024-05-27 21:08:39.515178

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '4df8ae4a83c0'
down_revision = ('2e7525f9d21b', 'a17996bd5bff')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
