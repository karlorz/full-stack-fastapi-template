"""Add max length for string(varchar) fields in User, teams, UserTeamLink and invitations models

Revision ID: c11162ad75eb
Revises: 4df8ae4a83c0
Create Date: 2024-06-15 22:25:10.088206

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'c11162ad75eb'
down_revision = '4df8ae4a83c0'
branch_labels = None
depends_on = None


def upgrade():
    # Adjust the length of the role field in the UserTeamLink table
    op.alter_column('userteamlink', 'role',
               existing_type=sa.VARCHAR(),
               type_=sa.String(length=255),
               existing_nullable=False)

    # Adjust the length of the email field in the User table
    op.alter_column('user', 'email',
               existing_type=sa.VARCHAR(),
               type_=sa.String(length=255),
               existing_nullable=False)

    # Adjust the length of the full_name field in the User table
    op.alter_column('user', 'full_name',
               existing_type=sa.VARCHAR(),
               type_=sa.String(length=255),
               existing_nullable=False)

    # Adjust the length of the username field in the User table
    op.alter_column('user', 'username',
               existing_type=sa.VARCHAR(),
               type_=sa.String(length=255),
               existing_nullable=False)

    # Adjust the length of the role field in the Invitation table
    op.alter_column('invitation', 'role',
               existing_type=sa.VARCHAR(),
               type_=sa.String(length=255),
               existing_nullable=False)

    # Adjust the length of the email field in the Invitation table
    op.alter_column('invitation', 'email',
               existing_type=sa.VARCHAR(),
               type_=sa.String(length=255),
               existing_nullable=False)

    # Adjust the length of the status field in the Invitation table
    op.alter_column('invitation', 'status',
               existing_type=sa.VARCHAR(),
               type_=sa.String(length=255),
               existing_nullable=False)

    # Adjust the length of the name field in the Team table
    op.alter_column('team', 'name',
               existing_type=sa.VARCHAR(),
               type_=sa.String(length=255),
               existing_nullable=False)

    # Adjust the length of the description field in the Team table
    op.alter_column('team', 'description',
               existing_type=sa.VARCHAR(),
               type_=sa.String(length=255),
               existing_nullable=True)

    # Adjust the length of the slug field in the Team table
    op.alter_column('team', 'slug',
               existing_type=sa.VARCHAR(),
               type_=sa.String(length=255),
               existing_nullable=False)


def downgrade():
    # Revert the length of the role field in the UserTeamLink table
    op.alter_column('userteamlink', 'role',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(),
               existing_nullable=False)

    # Revert the length of the email field in the User table
    op.alter_column('user', 'email',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(),
               existing_nullable=False)

    # Revert the length of the full_name field in the User table
    op.alter_column('user', 'full_name',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(),
               existing_nullable=False)

    # Revert the length of the username field in the User table
    op.alter_column('user', 'username',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(),
               existing_nullable=False)

    # Revert the length of the role field in the Invitation table
    op.alter_column('invitation', 'role',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(),
               existing_nullable=False)

    # Revert the length of the email field in the Invitation table
    op.alter_column('invitation', 'email',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(),
               existing_nullable=False)

    # Revert the length of the status field in the Invitation table
    op.alter_column('invitation', 'status',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(),
               existing_nullable=False)

    # Revert the length of the name field in the Team table
    op.alter_column('team', 'name',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(),
               existing_nullable=False)

    # Revert the length of the description field in the Team table
    op.alter_column('team', 'description',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(),
               existing_nullable=True)

    # Revert the length of the slug field in the Team table
    op.alter_column('team', 'slug',
               existing_type=sa.String(length=255),
               type_=sa.VARCHAR(),
               existing_nullable=False)
