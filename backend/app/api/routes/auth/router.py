from datetime import timedelta

from fastapi_auth.router import AuthRouter
from fastapi_auth.social_providers.github import GitHubProvider

from app.core import security
from app.core.config import MainSettings

from .accounts_storage import AccountsStorage
from .secondary_storage import SecondaryStorage

settings = MainSettings.get_settings()


def create_token(user_id: str) -> tuple[str, int]:
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = security.create_access_token(
        user_id, expires_delta=access_token_expires
    )

    return access_token, settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60


router = AuthRouter(
    secondary_storage=SecondaryStorage(),
    accounts_storage=AccountsStorage(),
    create_token=create_token,
    providers=[
        GitHubProvider(
            client_id=settings.BACKEND_GITHUB_CLIENT_ID,
            client_secret=settings.BACKEND_GITHUB_CLIENT_SECRET,
        )
    ],
    trusted_origins=settings.TRUSTED_ORIGINS,
)
