from collections.abc import Generator
from dataclasses import dataclass
from datetime import datetime
from unittest.mock import ANY, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app import crud
from app.core.config import MainSettings
from app.core.security import verify_password
from app.models import Role, User, UserCreate, WaitingListUser, WaitingListUserCreate
from app.utils import (
    generate_verification_email_token,
    generate_verification_update_email_token,
)
from tests.utils.team import create_random_team
from tests.utils.user import create_user, user_authentication_headers
from tests.utils.utils import random_email, random_lower_string

settings = MainSettings.get_settings()


@pytest.fixture
def send_email_mock() -> Generator[MagicMock]:
    with patch("app.api.routes.users.send_email", return_value=None) as send_mock:
        yield send_mock


def test_get_users_normal_user_me(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    current_user = r.json()
    assert current_user
    assert current_user["is_active"] is True
    assert current_user["email"] == settings.EMAIL_TEST_USER
    assert current_user["personal_team_slug"] is not None
    assert (
        current_user["has_usable_password"] is True
    )  # Normal user should have password


def test_update_user_me_full_name(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    full_name = "Updated Name"
    data = {"full_name": full_name}
    r = client.patch(
        f"{settings.API_V1_STR}/users/me",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_user = r.json()
    assert updated_user["full_name"] == full_name

    user_query = select(User).where(User.id == updated_user["id"])
    user_db = db.exec(user_query).first()
    assert user_db
    assert user_db.full_name == full_name


def test_update_password_me(
    user: User, logged_in_client: TestClient, db: Session
) -> None:
    new_password = random_lower_string()
    data = {
        "current_password": "secretsecret",
        "new_password": new_password,
    }
    r = logged_in_client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        json=data,
    )
    assert r.status_code == 200
    updated_user = r.json()
    assert updated_user["message"] == "Password updated successfully"

    db.refresh(user)
    assert user.hashed_password is not None
    assert verify_password(new_password, user.hashed_password)

    # Revert to the old password to keep consistency in test
    old_data = {
        "current_password": new_password,
        "new_password": "secretsecret",
    }

    r = logged_in_client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        json=old_data,
    )

    db.refresh(user)

    assert user.hashed_password is not None
    assert r.status_code == 200
    assert verify_password("secretsecret", user.hashed_password)


def test_update_password_me_incorrect_password(logged_in_client: TestClient) -> None:
    new_password = random_lower_string()
    data = {"current_password": new_password, "new_password": new_password}
    r = logged_in_client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        json=data,
    )
    assert r.status_code == 400
    updated_user = r.json()
    assert updated_user["detail"] == "Incorrect password"


def test_update_user_me_email_exists(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    username = random_email()
    password = random_lower_string()
    full_name = random_lower_string()
    user_in = UserCreate(email=username, password=password, full_name=full_name)
    user = crud.create_user(session=db, user_create=user_in, is_verified=False)

    data = {"email": user.email}
    r = client.post(
        f"{settings.API_V1_STR}/users/me/email",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 409
    assert r.json()["detail"] == "User with this email already exists"


def test_request_email_update(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    new_email = random_email()

    data = {"email": new_email}
    r = client.post(
        f"{settings.API_V1_STR}/users/me/email",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 200
    assert r.json()["message"] == "Email update request has been sent"


def test_update_user_email_me(
    client: TestClient, db: Session, send_email_mock: MagicMock
) -> None:
    new_email = random_email()
    email = random_email()
    password = random_lower_string()
    full_name = random_lower_string()

    create_user(
        session=db,
        email=email,
        password=password,
        full_name=full_name,
        is_verified=True,
    )
    user_headers = user_authentication_headers(
        client=client, email=email, password=password
    )

    token = generate_verification_update_email_token(email=new_email, old_email=email)

    data = {"token": token}
    r = client.post(
        f"{settings.API_V1_STR}/users/me/verify-update-email",
        headers=user_headers,
        json=data,
    )
    assert r.status_code == 200
    assert (
        r.json()["message"]
        == "New email has been successfully verified and the account has been updated"
    )

    send_email_mock.assert_called_once_with(
        email_to=email,  # Send to old email for security
        subject=f"{settings.PROJECT_NAME} - Email successfully changed",
        html_content=ANY,
    )

    user_query = select(User).where(User.email == new_email)
    user_db = db.exec(user_query).first()
    assert user_db


def test_update_password_me_same_password_error(logged_in_client: TestClient) -> None:
    data = {
        "current_password": "secretsecret",
        "new_password": "secretsecret",
    }

    r = logged_in_client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        json=data,
    )

    assert r.status_code == 400
    updated_user = r.json()
    assert (
        updated_user["detail"] == "New password cannot be the same as the current one"
    )


def test_set_password_for_user_without_password(
    client: TestClient, db: Session
) -> None:
    """Test setting initial password for user without password (e.g., OAuth users)"""
    email = random_email()
    full_name = random_lower_string()

    # Create user without password using create_user_without_password
    user = crud.create_user_without_password(
        session=db, email=email, full_name=full_name, is_verified=True
    )
    create_random_team(db, owner_id=user.id, is_personal_team=True)
    db.add(user)
    db.commit()

    # Manually set access token for authentication since user has no password
    from datetime import timedelta

    from app.core.security import create_access_token

    access_token = create_access_token(
        str(user.id), expires_delta=timedelta(minutes=30)
    )
    headers = {"Authorization": f"Bearer {access_token}"}

    # First, verify user shows has_usable_password = False
    r = client.get(f"{settings.API_V1_STR}/users/me", headers=headers)
    user_data = r.json()
    assert user_data["has_usable_password"] is False

    new_password = random_lower_string()
    data = {
        "new_password": new_password,
    }

    r = client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=headers,
        json=data,
    )

    assert r.status_code == 200
    response_data = r.json()
    assert response_data["message"] == "Password set successfully"

    # Verify password was actually set
    db.refresh(user)
    assert user.hashed_password is not None
    assert verify_password(new_password, user.hashed_password)

    # Verify user now shows has_usable_password = True
    r = client.get(f"{settings.API_V1_STR}/users/me", headers=headers)
    user_data = r.json()
    assert user_data["has_usable_password"] is True


def test_set_password_error_when_current_password_provided_for_user_without_password(
    client: TestClient, db: Session
) -> None:
    """Test error when providing current_password for user without password"""
    email = random_email()
    full_name = random_lower_string()

    # Create user without password
    user = crud.create_user_without_password(
        session=db, email=email, full_name=full_name, is_verified=True
    )
    create_random_team(db, owner_id=user.id, is_personal_team=True)
    db.add(user)
    db.commit()

    # Manually set access token for authentication
    from datetime import timedelta

    from app.core.security import create_access_token

    access_token = create_access_token(
        str(user.id), expires_delta=timedelta(minutes=30)
    )
    headers = {"Authorization": f"Bearer {access_token}"}

    data = {
        "current_password": "somepassword",
        "new_password": random_lower_string(),
    }

    r = client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=headers,
        json=data,
    )

    assert r.status_code == 400
    response_data = r.json()
    assert (
        response_data["detail"]
        == "Current password should not be provided when setting initial password"
    )


def test_update_password_error_when_current_password_missing_for_user_with_password(
    logged_in_client: TestClient,
) -> None:
    """Test error when current_password is missing for user with existing password"""
    data = {
        "new_password": random_lower_string(),
    }

    r = logged_in_client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        json=data,
    )

    assert r.status_code == 400
    response_data = r.json()
    assert response_data["detail"] == "Current password is required"


def test_register_user(
    client: TestClient, db: Session, send_email_mock: MagicMock
) -> None:
    username = f"{random_lower_string()}@example.com"
    password = random_lower_string()
    full_name = random_lower_string()
    data = {"email": username, "password": password, "full_name": full_name}
    r = client.post(
        f"{settings.API_V1_STR}/users/signup",
        json=data,
    )
    assert r.status_code == 200
    created_user = r.json()
    assert created_user["email"] == username
    assert created_user["full_name"] == full_name

    user_query = select(User).where(User.email == username)
    user_db = db.exec(user_query).first()
    assert user_db
    assert user_db.email == username
    assert user_db.full_name == full_name
    assert user_db.hashed_password is not None
    assert verify_password(password, user_db.hashed_password)

    send_email_mock.assert_called_once_with(
        email_to=username, subject=ANY, html_content=ANY
    )


def test_register_user_already_exists_error(
    client: TestClient, send_email_mock: MagicMock, db: Session
) -> None:
    email = f"{random_lower_string()}@example.com"
    password = random_lower_string()
    full_name = random_lower_string()

    create_user(
        session=db,
        email=email,
        password=password,
        full_name=full_name,
        is_verified=True,
    )

    data = {
        "email": email,
        "password": password,
        "full_name": full_name,
    }

    r = client.post(
        f"{settings.API_V1_STR}/users/signup",
        json=data,
    )

    assert r.status_code == 400
    assert r.json()["detail"] == "The user with this email already exists in the system"

    send_email_mock.assert_not_called()


def test_register_user_empty_full_name(client: TestClient) -> None:
    email = f"{random_lower_string()}@fastapilabs.com"
    data = {"email": email, "password": "totally-legit", "full_name": ""}
    r = client.post(
        f"{settings.API_V1_STR}/users/signup",
        json=data,
    )
    assert r.status_code == 422

    data = r.json()

    assert data["detail"][0]["msg"] == "String should have at least 3 characters"


def test_resend_verification_email_success(
    client: TestClient, db: Session, send_email_mock: MagicMock
) -> None:
    email = f"{random_lower_string()}@fastapilabs.com"
    password = random_lower_string()
    full_name = random_lower_string()
    user_in = UserCreate(email=email, password=password, full_name=full_name)
    user = crud.create_user(session=db, user_create=user_in, is_verified=False)
    db.add(user)
    db.commit()

    r = client.post(
        f"{settings.API_V1_STR}/users/resend-verification",
        json={"email": email},
    )
    assert r.status_code == 200
    assert r.json()["message"] == "Verification email has been resent"

    send_email_mock.assert_called_once_with(
        email_to=email, subject=ANY, html_content=ANY
    )


def test_resend_verification_email_nonexistent_user(
    client: TestClient, send_email_mock: MagicMock
) -> None:
    email = f"{random_lower_string()}@fastapilabs.com"
    r = client.post(
        f"{settings.API_V1_STR}/users/resend-verification",
        json={"email": email},
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "User with this email does not exist"

    send_email_mock.assert_not_called()


def test_resend_verification_email_already_verified(
    client: TestClient, db: Session, send_email_mock: MagicMock
) -> None:
    email = f"{random_lower_string()}@fastapilabs.com"
    password = random_lower_string()
    full_name = random_lower_string()
    user_in = UserCreate(email=email, password=password, full_name=full_name)
    user = crud.create_user(session=db, user_create=user_in, is_verified=True)
    db.add(user)
    db.commit()

    r = client.post(
        f"{settings.API_V1_STR}/users/resend-verification",
        json={"email": email},
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "Email is already verified"

    send_email_mock.assert_not_called()


def test_delete_user_me_only_personal_team(client: TestClient, db: Session) -> None:
    username = random_email()
    password = random_lower_string()
    full_name = random_lower_string()
    user_in = UserCreate(email=username, password=password, full_name=full_name)
    user = crud.create_user(session=db, user_create=user_in, is_verified=True)
    create_random_team(db, owner_id=user.id, is_personal_team=True)
    user_id = user.id
    db.add(user)
    db.commit()

    login_data = {
        "username": username,
        "password": password,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}

    r = client.delete(
        f"{settings.API_V1_STR}/users/me",
        headers=headers,
    )
    assert r.status_code == 200
    deleted_user = r.json()
    assert deleted_user["message"] == "User deleted successfully"
    result = db.exec(select(User).where(User.id == user_id)).first()
    assert result is None


def test_delete_user_me_owns_more_teams(client: TestClient, db: Session) -> None:
    username = random_email()
    password = random_lower_string()
    full_name = random_lower_string()
    user_in = UserCreate(email=username, password=password, full_name=full_name)
    user = crud.create_user(session=db, user_create=user_in, is_verified=True)
    create_random_team(db, owner_id=user.id, is_personal_team=True)
    db.add(user)
    db.commit()

    # adding another team owned by the user
    create_random_team(db, owner_id=user.id)

    login_data = {
        "username": username,
        "password": password,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}

    r = client.delete(
        f"{settings.API_V1_STR}/users/me",
        headers=headers,
    )
    assert r.status_code == 400
    deleted_user = r.json()
    assert (
        deleted_user["detail"]
        == "You cannot delete your account while you have more than one team"
    )


def test_verify_email(client: TestClient, db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    full_name = random_lower_string()
    user_in = UserCreate(email=email, password=password, full_name=full_name)
    user = crud.create_user(session=db, user_create=user_in, is_verified=False)

    token = generate_verification_email_token(email=email)

    data = {"token": token}

    r = client.post(f"{settings.API_V1_STR}/users/verify-email", json=data)

    assert r.status_code == 200
    assert r.json() == {"message": "Email successfully verified"}

    db.refresh(user)

    assert user.is_verified is True

    assert len(user.team_links) == 1

    team_link = user.team_links[0]

    assert team_link.role == Role.admin
    assert team_link.team.name == user.full_name
    assert team_link.team.slug.startswith(user.username)

    assert user.personal_team
    assert user.personal_team.id == team_link.team.id


@dataclass
class EmailResponse:
    state: str


def test_add_to_waiting_list(client: TestClient, send_email_mock: MagicMock) -> None:
    email = "test@fastapilabs.com"
    data = {
        "email": email,
        "name": "John Doe",
        "team_size": "1",
        "organization": "FastAPI Labs",
        "role": "developer",
        "country": "US",
    }
    r = client.post(f"{settings.API_V1_STR}/users/waiting-list", json=data)
    assert r.status_code == 200
    response = r.json()
    assert response["message"] == "User added to waiting list"

    send_email_mock.assert_called_once_with(
        email_to=email, subject=ANY, html_content=ANY
    )


def test_add_to_waiting_list_from_cli(
    client: TestClient, send_email_mock: MagicMock, db: Session
) -> None:
    email = "test-from-cli@fastapilabs.com"
    data = {
        "email": email,
        "name": "John Doe",
        "team_size": "1",
        "organization": "FastAPI Labs",
        "role": "developer",
        "country": "US",
    }
    r = client.post(
        f"{settings.API_V1_STR}/users/waiting-list",
        json=data,
        headers={"User-Agent": "fastapi-cloud-cli/1.0.0"},
    )
    assert r.status_code == 200
    response = r.json()
    assert response["message"] == "User added to waiting list"

    send_email_mock.assert_called_once_with(
        email_to=email, subject=ANY, html_content=ANY
    )

    user_query = select(WaitingListUser).where(WaitingListUser.email == email)
    user_db = db.exec(user_query).first()
    assert user_db
    assert user_db.registered_from_cli is True


def test_update_waiting_list_user(
    client: TestClient, send_email_mock: MagicMock
) -> None:
    email = "test@fastapilabs.com"
    data = {
        "email": email,
        "name": "John Doe",
        "team_size": "1",
        "organization": "FastAPI Labs",
        "role": "developer",
        "country": "US",
        "use_case": "I want to build a web app",
    }
    r = client.post(f"{settings.API_V1_STR}/users/waiting-list", json=data)
    assert r.status_code == 200
    response = r.json()
    assert response["message"] == "User updated in waiting list"

    send_email_mock.assert_called_once_with(
        email_to=email,
        subject="Your data has been updated 🤓",
        html_content=ANY,
    )


def test_add_to_waiting_list_invalid_email(
    client: TestClient, send_email_mock: MagicMock
) -> None:
    # This won't pass validation even if the syntax is correct because example.com is
    # a reserved domain name
    email = "test@example.com"
    data = {
        "email": email,
        "name": "John Doe",
        "team_size": "1",
        "organization": "FastAPI Labs",
        "role": "developer",
        "country": "US",
    }

    # Mock the environment to be production so the email validation runs
    from app.core.config import CommonSettings

    with patch.object(CommonSettings.get_settings(), "ENVIRONMENT", "production"):
        r = client.post(f"{settings.API_V1_STR}/users/waiting-list", json=data)

    assert r.status_code == 400
    assert r.json()["detail"] == "Email domain does not exist or has no mail server"

    send_email_mock.assert_not_called()


def test_add_to_waiting_list_email_already_registered_in_system(
    client: TestClient, db: Session, send_email_mock: MagicMock
) -> None:
    user_in = UserCreate(
        email="existing@fastapilabs.com",
        password="totally-legit",
        full_name="John Doe",
        is_active=True,
    )
    user = crud.create_user(session=db, user_create=user_in, is_verified=True)
    db.add(user)
    db.commit()

    data = {
        "email": user.email,
        "name": "John Doe",
        "team_size": "1",
        "organization": "FastAPI Labs",
    }

    r = client.post(f"{settings.API_V1_STR}/users/waiting-list", json=data)
    assert r.status_code == 409
    response = r.json()

    assert response["detail"] == "This email is already registered in the system"

    send_email_mock.assert_not_called()


def test_signup_with_waiting_list_email_allowed(
    client: TestClient, db: Session, send_email_mock: MagicMock
) -> None:
    user_in = WaitingListUserCreate(email="testing@fastapilabs.com")
    user = crud.add_to_waiting_list(session=db, user_in=user_in)
    user.allowed_at = datetime.now()
    db.add(user)
    db.commit()

    data = {
        "email": user.email,
        "password": "totally-legit",
        "full_name": "John Doe",
    }

    r = client.post(f"{settings.API_V1_STR}/users/signup", json=data)
    assert r.status_code == 200
    response = r.json()

    assert response["email"] == "testing@fastapilabs.com"
    assert response["full_name"] == "John Doe"

    send_email_mock.assert_called_once_with(
        email_to=user.email, subject=ANY, html_content=ANY
    )


def test_signup_with_waiting_list_email_not_allowed(
    client: TestClient, db: Session, send_email_mock: MagicMock
) -> None:
    user_in = WaitingListUserCreate(email="esteban@some-random-domain.com")
    user = crud.add_to_waiting_list(session=db, user_in=user_in)
    db.add(user)
    db.commit()

    data = {
        "email": user.email,
        "password": "totally-legit",
        "full_name": "John Doe",
    }

    r = client.post(f"{settings.API_V1_STR}/users/signup", json=data)
    assert r.status_code == 400
    assert (
        r.json()["detail"]
        == "This email has not yet been invited to join FastAPI Cloud"
    )

    send_email_mock.assert_not_called()


def test_signup_with_waiting_list_email_not_in_db(
    client: TestClient, send_email_mock: MagicMock
) -> None:
    data = {
        "email": "demo211@fastapilabs.com",
        "password": "totally-legit",
        "full_name": "John Doe",
    }

    r = client.post(f"{settings.API_V1_STR}/users/signup", json=data)
    assert r.status_code == 400
    assert (
        r.json()["detail"]
        == "This email has not yet been invited to join FastAPI Cloud"
    )

    send_email_mock.assert_not_called()


def test_rate_limit_on_waiting_list(client: TestClient) -> None:
    for _ in range(6):
        r = client.post(f"{settings.API_V1_STR}/users/waiting-list", json={})

    assert r.status_code == 429
    assert r.json()["detail"] == "Rate limit exceeded"
