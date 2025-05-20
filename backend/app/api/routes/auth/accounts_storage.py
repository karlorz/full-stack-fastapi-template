from typing import Any
from uuid import UUID

from sqlmodel import Session, select

from app import crud
from app.api.utils.teams import generate_team_slug_name
from app.core.db import engine
from app.models import Role, SocialAccount, Team, User, UserTeamLink


class AccountsStorage:
    def find_user(
        self,
        *,
        email: str,
    ) -> User | None:
        with Session(engine) as session:
            statement = select(User).where(User.email == email)

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

    def create_user(self, *, user_info: Any) -> User:
        with Session(engine, expire_on_commit=False) as session:
            # create user
            user = crud.create_user_without_password(
                session=session,
                email=user_info["email"],
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
    ) -> SocialAccount:
        with Session(engine, expire_on_commit=False) as session:
            return crud.create_social_account(
                session=session,
                user_id=user_id,
                provider=provider,
                provider_user_id=provider_user_id,
            )
