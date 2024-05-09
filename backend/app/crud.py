from typing import Any

from sqlalchemy.sql import and_
from sqlmodel import Session, col, or_, select

from app.core.security import get_password_hash, verify_password
from app.models import (
    Invitation,
    Role,
    Team,
    User,
    UserCreate,
    UserTeamLink,
    UserUpdate,
)


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def add_user_to_team(
    *,
    session: Session,
    user: User,
    team: Team,
    role: Role,
) -> UserTeamLink:
    user_org_link = UserTeamLink(user=user, team=team, role=role)
    session.add(user_org_link)
    session.commit()
    session.refresh(user_org_link)
    return user_org_link


def get_user_team_link_by_user_id_and_team_id(
    *, session: Session, user_id: int | None, team_id: int | None
) -> UserTeamLink | None:
    statement = select(UserTeamLink).where(
        UserTeamLink.team_id == team_id,
        UserTeamLink.user_id == user_id,
    )
    user_team_link = session.exec(statement).first()
    return user_team_link


def get_invitation_by_user_id_or_email_and_team_id(
    *, session: Session, team_id: int, user_id: int | None, email: str | None
) -> Invitation | None:
    invitation = session.exec(
        select(Invitation).where(
            or_(
                and_(
                    col(Invitation.email) == email,
                    col(Invitation.team_id) == team_id,
                ),
                and_(
                    col(Invitation.invited_user_id) == user_id,
                    col(Invitation.team_id) == team_id,
                ),
            )
        )
    ).first()
    return invitation


def get_user_by_id_or_email(
    *, session: Session, user_id: int | None, email: str | None
) -> User | None:
    statement = select(User).where(
        or_(col(User.id) == user_id, col(User.email) == email)
    )
    user = session.exec(statement).first()
    return user
