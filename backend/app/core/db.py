from sqlmodel import Session, create_engine, select

from app.api.utils.teams import generate_team_slug_name
from app.core.config import DBSettings
from app.models import Role, Team, User, UserCreate, UserTeamLink

engine = create_engine(str(DBSettings.get_settings().SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-template/issues/28


def initialize_user(email: str, session: Session) -> User:
    from app import crud

    user_in = UserCreate(
        email=email,
        password="secretsecret",
        full_name=email.split("@")[0].capitalize(),
    )

    user = crud.create_user(session=session, user_create=user_in, is_verified=True)

    team = Team(
        name=user.full_name,
        slug=generate_team_slug_name(user.full_name, session),
        owner=user,
        is_personal_team=True,
    )

    user_team_link = UserTeamLink(user=user, team=team, role=Role.admin)
    session.add(user_team_link)
    session.commit()

    return user


def init_db(session: Session) -> None:
    for email in [
        "patrick@fastapilabs.com",
        "alejandra@fastapilabs.com",
        "sebastian@fastapilabs.com",
        "marco@fastapilabs.com",
    ]:
        if session.exec(select(User).where(User.email == email)).first():
            continue

        initialize_user(email, session)
