"""merge heads

Revision ID: a17996bd5bff
Revises: c5cc3b0f01d6, f686be54aec9
Create Date: 2024-05-27 22:37:55.225109

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'a17996bd5bff'
down_revision = ('c5cc3b0f01d6', 'f686be54aec9')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
