"""merge heads

Revision ID: 6eb318701c26
Revises: 30a55259019b, c11162ad75eb
Create Date: 2024-06-15 22:49:55.160840

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '6eb318701c26'
down_revision = ('30a55259019b', 'c11162ad75eb')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
