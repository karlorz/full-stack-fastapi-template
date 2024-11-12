from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import get_main_settings
from app.core.security import verify_password
from app.models import User
from app.tests.utils.user import create_user
from app.utils import generate_password_reset_token

settings = get_main_settings()


def test_get_access_token(client: TestClient) -> None:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    assert r.status_code == 200
    assert "access_token" in tokens
    assert tokens["access_token"]


def test_get_access_token_incorrect_password(client: TestClient) -> None:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": "incorrect",
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    assert r.status_code == 400


def test_use_access_token(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    r = client.post(
        f"{settings.API_V1_STR}/login/test-token",
        headers=superuser_token_headers,
    )
    result = r.json()
    assert r.status_code == 200
    assert "email" in result


def test_recovery_password(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    email = "test@example.com"
    r = client.post(
        f"{settings.API_V1_STR}/password-recovery/{email}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 200
    assert r.json() == {"message": "Password recovery email sent"}


def test_recovery_password_user_not_exits(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    email = "jVgQr@example.com"
    r = client.post(
        f"{settings.API_V1_STR}/password-recovery/{email}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 404


def test_reset_password(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    token = generate_password_reset_token(email=settings.FIRST_SUPERUSER)
    data = {"new_password": "changethis", "token": token}
    r = client.post(
        f"{settings.API_V1_STR}/reset-password/",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 200
    assert r.json() == {"message": "Password updated successfully"}

    user_query = select(User).where(User.email == settings.FIRST_SUPERUSER)
    user = db.exec(user_query).first()
    assert user
    assert verify_password(data["new_password"], user.hashed_password)


def test_reset_password_invalid_token(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"new_password": "changethis", "token": "invalid"}
    r = client.post(
        f"{settings.API_V1_STR}/reset-password/",
        headers=superuser_token_headers,
        json=data,
    )
    response = r.json()

    assert "detail" in response
    assert r.status_code == 400
    assert response["detail"] == "Invalid token"


def test_reset_password_email_not_found(client: TestClient) -> None:
    token = generate_password_reset_token(email="noemail@test.com")
    data = {"new_password": "changethis", "token": token}
    r = client.post(
        f"{settings.API_V1_STR}/reset-password/",
        json=data,
    )
    response = r.json()

    assert "detail" in response
    assert r.status_code == 404
    assert (
        response["detail"] == "The user with this email does not exist in the system."
    )


def test_reset_password_inactive_user(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email="fastapiuser123@fastapi.com",
        password="test12345",
        full_name="FastAPI User",
        is_verified=True,
    )
    user.is_active = False
    db.add(user)
    db.commit()

    token = generate_password_reset_token(email=user.email)
    data = {"new_password": "changethis", "token": token}
    r = client.post(
        f"{settings.API_V1_STR}/reset-password/",
        json=data,
    )
    response = r.json()

    assert "detail" in response
    assert r.status_code == 400
    assert response["detail"] == "Inactive user"


def test_login_user_inactive(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email="fastapiuser@fastapi.com",
        password="test12345",
        full_name="FastAPI User",
        is_verified=True,
    )
    user.is_active = False
    db.add(user)
    db.commit()

    login_data = {
        "username": "fastapiuser@fastapi.com",
        "password": "test12345",
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    assert r.status_code == 400
    assert r.json() == {"detail": "Inactive user"}


def test_login_user_not_verified(client: TestClient, db: Session) -> None:
    create_user(
        session=db,
        email="fastapiuser2@fastapi.com",
        password="test12345",
        full_name="FastAPI User",
        is_verified=False,
    )

    login_data = {
        "username": "fastapiuser2@fastapi.com",
        "password": "test12345",
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    assert r.status_code == 400
    assert r.json() == {"detail": "Email not verified"}
