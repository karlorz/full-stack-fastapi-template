from datetime import datetime
from typing import Any
from uuid import UUID

from fastapi_auth.exceptions import FastAPIAuthException
from sqlmodel import Session, select

from app import crud
from app.api.utils.teams import generate_team_slug_name
from app.core.db import engine
from app.models import Role, SocialAccount, Team, User, UserTeamLink
from app.utils import is_signup_allowed


class AccountsStorage:
    def find_user_by_email(self, email: str) -> User | None:
        with Session(engine) as session:
            statement = select(User).where(User.email == email)

            return session.exec(statement).first()

    def find_user_by_id(self, id: Any) -> User | None:
        with Session(engine) as session:
            statement = select(User).where(User.id == id)

            return session.exec(statement).first()

    def find_social_account(
        self,
        *,
        provider: str,
        provider_user_id: str,
    ) -> SocialAccount | None:
        with Session(engine) as session:
            statement = select(SocialAccount).where(
                SocialAccount.provider == provider,
                SocialAccount.provider_user_id == provider_user_id,
            )

            return session.exec(statement).first()

    def create_user(self, *, user_info: dict[str, Any]) -> User:
        email = user_info["email"]

        with Session(engine, expire_on_commit=False) as session:
            if not is_signup_allowed(email, session):
                raise FastAPIAuthException(
                    "email_not_invited",
                    "This email has not yet been invited to join FastAPI Cloud",
                )

            # create user
            user = crud.create_user_without_password(
                session=session,
                email=email,
                full_name=user_info["name"],
                is_verified=True,
            )

            team_slug = generate_team_slug_name(session=session, name=user.username)
            team = Team(
                name=user.full_name, slug=team_slug, owner=user, is_personal_team=True
            )
            user_team_link = UserTeamLink(team=team, user=user, role=Role.admin)

            session.add(user)
            session.add(user_team_link)
            session.commit()

        return user

    def create_social_account(
        self,
        *,
        user_id: UUID,
        provider: str,
        provider_user_id: str,
        access_token: str | None,
        refresh_token: str | None,
        access_token_expires_at: datetime | None,
        refresh_token_expires_at: datetime | None,
        scope: str | None,
        user_info: dict[str, Any],
    ) -> SocialAccount:
        with Session(engine, expire_on_commit=False) as session:
            return crud.create_social_account(
                session=session,
                user_id=user_id,
                provider=provider,
                provider_user_id=provider_user_id,
                access_token=access_token,
                refresh_token=refresh_token,
                access_token_expires_at=access_token_expires_at,
                refresh_token_expires_at=refresh_token_expires_at,
                scope=scope,
                user_info=user_info,
            )

    def update_social_account(
        self,
        social_account_id: UUID,
        *,
        access_token: str | None,
        refresh_token: str | None,
        access_token_expires_at: datetime | None,
        refresh_token_expires_at: datetime | None,
        scope: str | None,
        user_info: dict[str, Any],
    ) -> SocialAccount:
        with Session(engine, expire_on_commit=False) as session:
            return crud.update_social_account(
                session=session,
                social_account_id=social_account_id,
                access_token=access_token,
                refresh_token=refresh_token,
                access_token_expires_at=access_token_expires_at,
                refresh_token_expires_at=refresh_token_expires_at,
                scope=scope,
                user_info=user_info,
            )
