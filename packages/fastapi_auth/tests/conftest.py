import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Iterable

import pytest
from fastapi_auth._context import Context
from fastapi_auth._issuer import AuthorizationCodeGrantData, Issuer
from fastapi_auth._storage import AccountsStorage, SecondaryStorage

pytestmark = pytest.mark.asyncio


@dataclass
class SocialAccount:
    id: str
    provider_user_id: str
    provider: str
    access_token: str | None = None
    refresh_token: str | None = None
    access_token_expires_at: datetime | None = None
    refresh_token_expires_at: datetime | None = None
    scope: str | None = None


@dataclass
class User:
    id: str
    email: str
    social_accounts: Iterable[SocialAccount]


class MemoryStorage(SecondaryStorage):
    def __init__(self):
        self.data = {}

    def set(self, key: str, value: str):
        self.data[key] = value

    def get(self, key: str) -> str | None:
        return self.data.get(key)

    def delete(self, key: str):
        del self.data[key]


class MemoryAccountsStorage:
    def __init__(self):
        self.data = {
            "test": User(
                id="test",
                email="test@example.com",
                social_accounts=[
                    SocialAccount(
                        id=str(uuid.uuid4()),
                        provider="test",
                        provider_user_id="test",
                    )
                ],
            )
        }

    def find_user(
        self,
        email: str,
    ) -> User | None:
        return next((user for user in self.data.values() if user.email == email), None)

    def create_user(self, *, user_info: Any) -> User:
        if user_info["email"] in self.data:
            raise ValueError("User already exists")

        user = User(id=user_info["id"], email=user_info["email"], social_accounts=[])

        self.data[user_info["id"]] = user

        return user

    def find_social_account(
        self,
        provider: str,
        provider_user_id: str,
    ) -> SocialAccount | None:
        for user in self.data.values():
            for social_account in user.social_accounts:
                if (
                    social_account.provider == provider
                    and social_account.provider_user_id == provider_user_id
                ):
                    return social_account
        return None

    def create_social_account(
        self,
        *,
        user_id: str,
        provider: str,
        provider_user_id: str,
        access_token: str | None,
        refresh_token: str | None,
        access_token_expires_at: datetime | None,
        refresh_token_expires_at: datetime | None,
        scope: str | None,
    ) -> SocialAccount:
        if user_id not in self.data:
            raise ValueError("User does not exist")

        user = self.data[user_id]

        social_account = SocialAccount(
            id=str(uuid.uuid4()),
            provider=provider,
            provider_user_id=provider_user_id,
            access_token=access_token,
            refresh_token=refresh_token,
            access_token_expires_at=access_token_expires_at,
            refresh_token_expires_at=refresh_token_expires_at,
            scope=scope,
        )

        user.social_accounts.append(social_account)

        self.data[user_id] = user

        return social_account

    def update_social_account(
        self,
        social_account_id: str,
        *,
        access_token: str | None,
        refresh_token: str | None,
        access_token_expires_at: datetime | None,
        refresh_token_expires_at: datetime | None,
        scope: str | None,
    ) -> SocialAccount:
        social_account = next(
            (
                social_account
                for user in self.data.values()
                for social_account in user.social_accounts
                if social_account.id == social_account_id
            ),
            None,
        )

        if social_account is None:
            raise ValueError("Social account does not exist")

        social_account.access_token = access_token
        social_account.refresh_token = refresh_token
        social_account.access_token_expires_at = access_token_expires_at
        social_account.refresh_token_expires_at = refresh_token_expires_at
        social_account.scope = scope

        return social_account


@pytest.fixture
def secondary_storage() -> SecondaryStorage:
    return MemoryStorage()


@pytest.fixture
def accounts_storage() -> AccountsStorage:
    return MemoryAccountsStorage()


@pytest.fixture
def context(
    secondary_storage: SecondaryStorage, accounts_storage: AccountsStorage
) -> Context:
    return Context(
        secondary_storage=secondary_storage,
        accounts_storage=accounts_storage,
        create_token=lambda id: (f"token-{id}", 0),
        trusted_origins=["valid-frontend.com"],
    )


@pytest.fixture
def issuer() -> Issuer:
    return Issuer()


@pytest.fixture
def expired_code(secondary_storage: SecondaryStorage) -> str:
    code = "test"
    secondary_storage.set(
        f"oauth:code:{code}",
        AuthorizationCodeGrantData(
            user_id="test",
            expires_at=datetime.now(tz=timezone.utc) - timedelta(seconds=1),
            client_id="test",
            redirect_uri="test",
            code_challenge="test",
            code_challenge_method="S256",
        ).model_dump_json(),
    )
    return code


@pytest.fixture
def valid_code(secondary_storage: SecondaryStorage) -> str:
    code = "test"
    # For code verifier "test", the S256 code challenge is "n4bQgYhMfWWaL-qgxVrQFaO_TxsrC4Is0V1sFbDwCgg"
    secondary_storage.set(
        f"oauth:code:{code}",
        AuthorizationCodeGrantData(
            user_id="test",
            expires_at=datetime.now(tz=timezone.utc) + timedelta(seconds=10),
            client_id="test",
            redirect_uri="test",
            code_challenge="n4bQgYhMfWWaL-qgxVrQFaO_TxsrC4Is0V1sFbDwCgg",
            code_challenge_method="S256",
        ).model_dump_json(),
    )
    return code
