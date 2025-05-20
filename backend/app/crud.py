import uuid
from datetime import datetime
from typing import Any

from sqlmodel import Session, select

from app.api.utils.users import verify_and_generate_slug_username
from app.core.security import get_password_hash, verify_password
from app.models import (
    Role,
    SocialAccount,
    Team,
    User,
    UserBase,
    UserCreate,
    UserTeamLink,
    UserUpdate,
    WaitingListUser,
    WaitingListUserCreate,
)


def create_user(
    *, session: Session, user_create: UserCreate, is_verified: bool
) -> User:
    username_slug = verify_and_generate_slug_username(
        user_create.email.split("@")[0], session
    )

    db_obj = User.model_validate(
        user_create,
        update={
            "hashed_password": get_password_hash(user_create.password),
            "username": username_slug,
            "is_verified": is_verified,
        },
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def create_user_without_password(
    *, session: Session, email: str, full_name: str, is_verified: bool
) -> User:
    username_slug = verify_and_generate_slug_username(email.split("@")[0], session)

    db_obj = User.model_validate(
        UserBase(email=email, full_name=full_name),
        update={"is_verified": is_verified, "username": username_slug},
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(
    *,
    session: Session,
    db_user: User,
    user_in: UserUpdate,
) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data: dict[str, Any] = {}
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
    if not db_user.hashed_password:
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


def get_user_team_link(
    *, session: Session, user_id: uuid.UUID, team_id: uuid.UUID
) -> UserTeamLink | None:
    statement = select(UserTeamLink).where(
        UserTeamLink.user_id == user_id,
        Team.id == UserTeamLink.team_id,
        Team.id == team_id,
    )

    return session.exec(statement).first()


def add_to_waiting_list(
    *,
    session: Session,
    user_in: WaitingListUserCreate,
    registered_from_cli: bool = False,
) -> WaitingListUser:
    db_obj = WaitingListUser.model_validate(
        user_in, update={"registered_from_cli": registered_from_cli}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def create_social_account(
    *,
    session: Session,
    user_id: uuid.UUID,
    provider: str,
    provider_user_id: str,
    access_token: str | None,
    refresh_token: str | None,
    access_token_expires_at: datetime | None,
    refresh_token_expires_at: datetime | None,
    scope: str | None,
) -> SocialAccount:
    db_obj = SocialAccount(
        user_id=user_id,
        provider=provider,
        provider_user_id=provider_user_id,
        access_token=access_token,
        refresh_token=refresh_token,
        access_token_expires_at=access_token_expires_at,
        refresh_token_expires_at=refresh_token_expires_at,
        scope=scope,
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)

    return db_obj


def update_social_account(
    *,
    social_account_id: uuid.UUID,
    session: Session,
    access_token: str | None,
    refresh_token: str | None,
    access_token_expires_at: datetime | None,
    refresh_token_expires_at: datetime | None,
    scope: str | None,
) -> SocialAccount:
    db_obj = session.exec(
        select(SocialAccount).where(SocialAccount.id == social_account_id)
    ).first()

    if not db_obj:
        raise ValueError("Social account not found")

    db_obj.access_token = access_token
    db_obj.refresh_token = refresh_token
    db_obj.access_token_expires_at = access_token_expires_at
    db_obj.refresh_token_expires_at = refresh_token_expires_at
    db_obj.scope = scope

    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)

    return db_obj
