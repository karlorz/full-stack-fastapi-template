from collections.abc import Generator
from datetime import timedelta
from typing import Any

import pytest
from fastapi.testclient import TestClient
from redis import Redis
from sqlmodel import Session, delete

from app.api.deps import get_redis
from app.core import security
from app.core.config import CommonSettings, MainSettings
from app.core.db import engine, init_db, initialize_user
from app.main import app
from app.models import (
    App,
    Deployment,
    Invitation,
    Team,
    User,
    UserTeamLink,
    WaitingListUser,
)
from app.tests.utils.user import authentication_token_from_email

settings = MainSettings.get_settings()


@pytest.fixture(scope="module", autouse=True)
def db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        init_db(session)
        try:
            yield session
        finally:
            models = [
                UserTeamLink,
                Invitation,
                Deployment,
                App,
                User,
                Team,
                WaitingListUser,
            ]
            for model in models:
                statement = delete(model)
                session.exec(statement)  # type: ignore
            session.commit()


@pytest.fixture(scope="module")
def user(db: Session) -> User:
    return initialize_user("test-user@example.com", db)


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def logged_in_client(client: TestClient, user: User) -> TestClient:
    access_token = security.create_access_token(user.id, timedelta(minutes=30))

    client.headers.update({"Authorization": f"Bearer {access_token}"})

    return client


@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )


@pytest.fixture(scope="module")
def redis() -> Generator["Redis[Any]", None, None]:
    yield from get_redis()


@pytest.fixture(scope="function", autouse=True)
def common_settings() -> CommonSettings:
    return CommonSettings(
        ENVIRONMENT="local",
        DEPLOYMENTS_DOMAIN="fastapicloud.club",
        BUILDER_API_KEY="peWaQz7UE5uqQcAUpchvq1tyDyq918zaCed84tJJEB8=",
        DEPLOYMENTS_BUCKET_NAME="fastapicloud-deployments",
        BUILDER_API_URL="http://localhost:8001",
    )


@pytest.fixture(scope="function", autouse=True)
def override_get_common_settings(
    common_settings: CommonSettings,
) -> Generator[None, None, None]:
    original_get_common_settings = CommonSettings.get_settings

    def mock_get_common_settings() -> CommonSettings:
        return common_settings

    CommonSettings.get_settings = mock_get_common_settings  # type: ignore
    yield
    CommonSettings.get_settings = original_get_common_settings  # type: ignore[method-assign]
