from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app import crud
from app.core.config import settings
from app.core.security import verify_password
from app.models import Role, User, UserCreate
from app.tests.utils.team import create_random_team
from app.tests.utils.user import create_user, user_authentication_headers
from app.tests.utils.utils import random_email, random_lower_string
from app.utils import (
    generate_verification_email_token,
    generate_verification_update_email_token,
)


def test_get_users_normal_user_me(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    current_user = r.json()
    assert current_user
    assert current_user["is_active"] is True
    assert current_user["email"] == settings.EMAIL_TEST_USER
    assert current_user["personal_team_slug"] is not None


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
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    new_password = random_lower_string()
    data = {
        "current_password": settings.FIRST_SUPERUSER_PASSWORD,
        "new_password": new_password,
    }
    r = client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_user = r.json()
    assert updated_user["message"] == "Password updated successfully"

    user_query = select(User).where(User.email == settings.FIRST_SUPERUSER)
    user_db = db.exec(user_query).first()
    assert user_db
    assert user_db.email == settings.FIRST_SUPERUSER
    assert verify_password(new_password, user_db.hashed_password)

    # Revert to the old password to keep consistency in test
    old_data = {
        "current_password": new_password,
        "new_password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=superuser_token_headers,
        json=old_data,
    )
    db.refresh(user_db)

    assert r.status_code == 200
    assert verify_password(settings.FIRST_SUPERUSER_PASSWORD, user_db.hashed_password)


def test_update_password_me_incorrect_password(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    new_password = random_lower_string()
    data = {"current_password": new_password, "new_password": new_password}
    r = client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=superuser_token_headers,
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


def test_update_user_email_me(client: TestClient, db: Session) -> None:
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

    user_query = select(User).where(User.email == new_email)
    user_db = db.exec(user_query).first()
    assert user_db


def test_update_password_me_same_password_error(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {
        "current_password": settings.FIRST_SUPERUSER_PASSWORD,
        "new_password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 400
    updated_user = r.json()
    assert (
        updated_user["detail"] == "New password cannot be the same as the current one"
    )


def test_register_user(client: TestClient, db: Session) -> None:
    with (
        patch("app.utils.generate_verification_email", return_value=None),
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        username = random_email()
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
        assert verify_password(password, user_db.hashed_password)


def test_register_user_already_exists_error(client: TestClient) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        password = random_lower_string()
        full_name = random_lower_string()
        data = {
            "email": settings.FIRST_SUPERUSER,
            "password": password,
            "full_name": full_name,
        }
        r = client.post(
            f"{settings.API_V1_STR}/users/signup",
            json=data,
        )
        assert r.status_code == 400
        assert (
            r.json()["detail"]
            == "The user with this email already exists in the system"
        )


def test_register_user_empty_full_name(client: TestClient) -> None:
    email = random_email()
    data = {"email": email, "password": "totally-legit", "full_name": ""}
    r = client.post(
        f"{settings.API_V1_STR}/users/signup",
        json=data,
    )
    assert r.status_code == 422

    data = r.json()

    assert data["detail"][0]["msg"] == "String should have at least 3 characters"  # type: ignore


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
    assert team_link.team.slug == user.username

    assert user.personal_team
    assert user.personal_team.id == team_link.team.id
