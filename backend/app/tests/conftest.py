from collections.abc import Generator
from typing import Any

import pytest
from fastapi.testclient import TestClient
from redis import Redis
from sqlmodel import Session, delete

from app.api.deps import get_redis
from app.core.config import settings
from app.core.db import engine, init_db
from app.main import app
from app.models import App, Deployment, Invitation, Team, User, UserTeamLink
from app.tests.utils.user import authentication_token_from_email
from app.tests.utils.utils import get_superuser_token_headers


@pytest.fixture(scope="module", autouse=True)
def db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        init_db(session)
        try:
            yield session
        finally:
            models = [UserTeamLink, Invitation, Deployment, App, User, Team]
            for model in models:
                statement = delete(model)
                session.exec(statement)  # type: ignore
            session.commit()


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )


@pytest.fixture(scope="module")
def redis() -> Generator["Redis[Any]", None, None]:
    yield from get_redis()
