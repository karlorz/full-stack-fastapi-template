from collections.abc import Generator
from unittest.mock import ANY, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app import crud
from app.core.config import MainSettings
from app.models import WaitingListUser, WaitingListUserCreate
from app.utils import get_datetime_utc
from tests.utils.utils import random_email

settings = MainSettings.get_settings()


@pytest.fixture
def send_email_mock() -> Generator[MagicMock]:
    with patch("app.api.routes.users.send_email", return_value=None) as send_mock:
        yield send_mock


def test_fails_when_token_is_missing(
    client: TestClient, send_email_mock: MagicMock
) -> None:
    data = {"email": random_email()}

    r = client.post(f"{settings.API_V1_STR}/users/allow-signup", json=data)
    assert r.status_code == 422
    assert r.json()["detail"][0]["msg"] == "Field required"
    assert r.json()["detail"][0]["loc"] == ["header", "token"]

    send_email_mock.assert_not_called()


def test_fails_when_token_is_invalid(
    client: TestClient, send_email_mock: MagicMock
) -> None:
    headers = {"token": "invalid"}
    data = {"email": random_email()}

    r = client.post(
        f"{settings.API_V1_STR}/users/allow-signup", json=data, headers=headers
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "Invalid token"

    send_email_mock.assert_not_called()


def test_creates_user_when_not_found(
    client: TestClient, db: Session, send_email_mock: MagicMock
) -> None:
    headers = {"token": settings.ALLOW_SIGNUP_TOKEN}
    email = "testing@fastapilabs.com"
    data = {"email": email}

    r = client.post(
        f"{settings.API_V1_STR}/users/allow-signup", json=data, headers=headers
    )
    assert r.status_code == 200
    assert r.json()["message"] == "User allowed to signup"

    # Check that the user was created in the waiting list
    user = db.exec(
        select(WaitingListUser).where(WaitingListUser.email == email)
    ).first()
    assert user is not None
    assert user.email == email
    assert user.allowed_at is not None

    send_email_mock.assert_called_once_with(
        email_to=email, subject=ANY, html_content=ANY
    )

    call_args = send_email_mock.call_args
    html_content = call_args.kwargs["html_content"]
    expected_param = "signup?email=testing%40fastapilabs.com"
    assert expected_param in html_content


def test_succeeds_when_user_is_found(
    client: TestClient, db: Session, send_email_mock: MagicMock
) -> None:
    email = "testing2@fastapilabs.com"
    user_in = WaitingListUserCreate(email=email)
    user = crud.add_to_waiting_list(session=db, user_in=user_in)
    db.add(user)
    db.commit()

    headers = {"token": settings.ALLOW_SIGNUP_TOKEN}
    data = {"email": user.email}

    r = client.post(
        f"{settings.API_V1_STR}/users/allow-signup", json=data, headers=headers
    )
    assert r.status_code == 200
    assert r.json()["message"] == "User allowed to signup"

    db.refresh(user)

    assert user.allowed_at is not None

    send_email_mock.assert_called_once_with(
        email_to=user.email, subject=ANY, html_content=ANY
    )

    call_args = send_email_mock.call_args
    html_content = call_args.kwargs["html_content"]
    expected_param = "signup?email=testing2%40fastapilabs.com"
    assert expected_param in html_content


def test_fails_when_user_is_already_allowed(
    client: TestClient, db: Session, send_email_mock: MagicMock
) -> None:
    user_in = WaitingListUserCreate(email=random_email())
    user = crud.add_to_waiting_list(session=db, user_in=user_in)
    user.allowed_at = get_datetime_utc()
    db.add(user)
    db.commit()

    headers = {"token": settings.ALLOW_SIGNUP_TOKEN}
    data = {"email": user.email}

    r = client.post(
        f"{settings.API_V1_STR}/users/allow-signup", json=data, headers=headers
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "User already allowed to signup"

    send_email_mock.assert_not_called()
