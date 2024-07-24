from sqlmodel import Session, create_engine, select

from app import crud
from app.core.config import settings
from app.models import Role, Team, User, UserCreate, UserTeamLink

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # from app.core.engine import engine
    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name=settings.FIRST_SUPERUSER_FULL_NAME,
        )
        user = crud.create_user(session=session, user_create=user_in, is_verified=True)
        team = Team(
            name=user.full_name, slug=user.username, owner=user, is_personal_team=True
        )
        user_team_link = UserTeamLink(user=user, team=team, role=Role.admin)
        session.add(user_team_link)
        session.commit()
