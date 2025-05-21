from datetime import timedelta

from duck import AsyncHTTPRequest
from fastapi_auth.router import AuthRouter
from fastapi_auth.social_providers.github import GitHubProvider
from sqlmodel import Session

from app.api.deps import get_current_user
from app.core import security
from app.core.config import MainSettings
from app.core.db import engine
from app.models import User

from .accounts_storage import AccountsStorage
from .secondary_storage import SecondaryStorage

settings = MainSettings.get_settings()


def create_token(user_id: str) -> tuple[str, int]:
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = security.create_access_token(
        user_id, expires_delta=access_token_expires
    )

    return access_token, settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60


def get_user_from_request(request: AsyncHTTPRequest) -> User | None:
    # TODO: this API should be case insensitive
    authorization_header = request.headers.get("Authorization")

    if not authorization_header:
        return None

    token = authorization_header.split(" ")[1]

    with Session(engine) as session:
        return get_current_user(session, token)


router = AuthRouter(
    secondary_storage=SecondaryStorage(),
    accounts_storage=AccountsStorage(),
    create_token=create_token,
    get_user_from_request=get_user_from_request,
    providers=[
        GitHubProvider(
            client_id=settings.BACKEND_GITHUB_CLIENT_ID,
            client_secret=settings.BACKEND_GITHUB_CLIENT_SECRET,
        )
    ],
    trusted_origins=settings.TRUSTED_ORIGINS,
)
