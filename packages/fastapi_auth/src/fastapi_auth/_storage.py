from typing import Any, Iterable

from typing_extensions import Protocol


class SocialAccount(Protocol):
    provider_user_id: str
    provider: str


class User(Protocol):
    id: Any
    email: str

    @property
    def social_accounts(self) -> Iterable[SocialAccount]: ...


class SecondaryStorage(Protocol):
    def set(self, key: str, value: str): ...

    def get(self, key: str) -> str | None: ...

    def delete(self, key: str): ...


class AccountsStorage(Protocol):
    def find_user(
        self,
        *,
        email: str,
    ) -> User | None: ...

    def find_social_account(
        self,
        *,
        provider: str,
        provider_user_id: str,
    ) -> SocialAccount | None: ...

    def create_user(self, *, user_info: Any) -> User: ...

    def create_social_account(
        self,
        *,
        user_id: Any,
        provider: str,
        provider_user_id: str,
    ) -> SocialAccount: ...
