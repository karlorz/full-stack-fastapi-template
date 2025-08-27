import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import MainSettings
from app.crud import add_user_to_team
from app.models import EnvironmentVariable, Role, get_datetime_utc

from tests.utils.apps import create_environment_variable, create_random_app
from tests.utils.team import create_random_team
from tests.utils.user import create_user, user_authentication_headers
from tests.utils.utils import random_email

settings = MainSettings.get_settings()


def test_read_environment_variables_for_app(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    app = create_random_app(db, team=team)
    env = create_environment_variable(db, app=app, name="name", value="value")

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/{app.id}/environment-variables",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()

    assert data["count"] == 1

    assert data["data"][0]["name"] == env.name
    assert data["data"][0]["value"] == env.value


def test_read_environment_variables_for_app_not_found(
    client: TestClient, db: Session
) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/70a83fd6-000e-46da-a7b0-e1bbc260f5b4/environment-variables",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"


def test_read_enviroment_variables_for_app_different_team(
    client: TestClient, db: Session
) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)

    app = create_random_app(db, team=team)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/{app.id}/environment-variables",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()

    assert data["detail"] == "Team not found for the current user"


def test_create_environment_variable_for_app(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    app = create_random_app(db, team=team)
    initial_updated_at = app.updated_at

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    data = {
        "name": "name",
        "value": "value",
    }

    response = client.post(
        f"{settings.API_V1_STR}/apps/{app.id}/environment-variables",
        headers=user_auth_headers,
        json=data,
    )

    assert response.status_code == 201
    data = response.json()
    db.refresh(app)

    assert data["name"] == "name"
    assert data["value"] == "value"
    assert app.updated_at > initial_updated_at

    env = db.exec(
        select(EnvironmentVariable).where(
            EnvironmentVariable.name == "name", EnvironmentVariable.app_id == app.id
        )
    ).first()

    assert env
    assert env.name == "name"
    assert env.value == "value"


@pytest.mark.parametrize(
    "name",
    ["", "1_INVALID_KEY", "name with spaces", "name-with-dashes"],
)
def test_create_environment_variable_invalid_name(
    client: TestClient, db: Session, name: str
) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    app = create_random_app(db, team=team)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    data = {
        "name": name,
        "value": "value",
    }

    response = client.post(
        f"{settings.API_V1_STR}/apps/{app.id}/environment-variables",
        headers=user_auth_headers,
        json=data,
    )

    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "ctx": {"error": {}},
                "input": name,
                "loc": ["body", "name"],
                "msg": "Value error, Invalid environment variable name",
                "type": "value_error",
            }
        ]
    }


def test_create_environment_variable_for_app_duplicate_name(
    client: TestClient, db: Session
) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    app = create_random_app(db, team=team)

    env = create_environment_variable(db, app=app, name="name", value="value")

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    data = {
        "name": env.name,
        "value": "value",
    }

    response = client.post(
        f"{settings.API_V1_STR}/apps/{app.id}/environment-variables",
        headers=user_auth_headers,
        json=data,
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "An environment variable with the provided name already exists"
    }


def test_create_environment_variable_for_app_not_found(
    client: TestClient, db: Session
) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    data = {
        "name": "name",
        "value": "value",
    }

    response = client.post(
        f"{settings.API_V1_STR}/apps/70a83fd6-000e-46da-a7b0-e1bbc260f5b4/environment-variables",
        headers=user_auth_headers,
        json=data,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"


def test_create_environment_variable_for_app_different_team(
    client: TestClient, db: Session
) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)

    app = create_random_app(db, team=team)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    data = {
        "name": "name",
        "value": "value",
    }

    response = client.post(
        f"{settings.API_V1_STR}/apps/{app.id}/environment-variables",
        headers=user_auth_headers,
        json=data,
    )

    assert response.status_code == 404
    data = response.json()

    assert data["detail"] == "Team not found for the current user"


def test_delete_environment_variable_for_app(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    app = create_random_app(db, team=team)
    env = create_environment_variable(db, app=app, name="name", value="value")
    initial_updated_at = app.updated_at

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.delete(
        f"{settings.API_V1_STR}/apps/{app.id}/environment-variables/{env.name}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    db.refresh(app)

    assert data["message"] == "Environment variable deleted"
    assert app.updated_at > initial_updated_at
    assert (
        db.exec(
            select(EnvironmentVariable).where(
                EnvironmentVariable.name == env.name,
                EnvironmentVariable.app_id == app.id,
            )
        ).first()
        is None
    )


def test_delete_environment_variable_for_app_not_found(
    client: TestClient, db: Session
) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.delete(
        f"{settings.API_V1_STR}/apps/70a83fd6-000e-46da-a7b0-e1bbc260f5b4/environment-variables/70a83fd6-000e-46da-a7b0-e1bbc260f5b4",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"


def test_delete_environment_variable_for_app_different_team(
    client: TestClient, db: Session
) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )

    team = create_random_team(db, owner_id=user.id)

    app = create_random_app(db, team=team)

    env = create_environment_variable(db, app=app, name="name", value="value")

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.delete(
        f"{settings.API_V1_STR}/apps/{app.id}/environment-variables/{env.name}",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()

    assert data["detail"] == "Team not found for the current user"


def test_edit_environment_variable_for_app(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )

    team = create_random_team(db, owner_id=user.id)

    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    app = create_random_app(db, team=team)
    env = create_environment_variable(
        db, app=app, name="initial_name", value="initial_value"
    )
    initial_updated_at = app.updated_at
    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    data = {"value": "updated_value"}

    response = client.put(
        f"{settings.API_V1_STR}/apps/{app.id}/environment-variables/{env.name}",
        headers=user_auth_headers,
        json=data,
    )

    assert response.status_code == 200
    data = response.json()
    db.refresh(app)

    assert data["name"] == "initial_name"
    assert data["value"] == "updated_value"
    assert app.updated_at > initial_updated_at

    db.refresh(env)

    assert env.name == "initial_name"
    assert env.value == "updated_value"


def test_edit_environment_variable_for_app_not_found(
    client: TestClient, db: Session
) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    data = {
        "name": "updated_name",
        "value": "updated_value",
    }

    response = client.put(
        f"{settings.API_V1_STR}/apps/70a83fd6-000e-46da-a7b0-e1bbc260f5b4/environment-variables/70a83fd6-000e-46da-a7b0-e1bbc260f5b4",
        headers=user_auth_headers,
        json=data,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"


def test_edit_environment_variable_for_app_different_team(
    client: TestClient, db: Session
) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )

    team = create_random_team(db, owner_id=user.id)

    app = create_random_app(db, team=team)

    env = create_environment_variable(
        db, app=app, name="initial_name", value="initial_value"
    )

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    data = {
        "name": "updated_name",
        "value": "updated_value",
    }

    response = client.put(
        f"{settings.API_V1_STR}/apps/{app.id}/environment-variables/{env.name}",
        headers=user_auth_headers,
        json=data,
    )

    assert response.status_code == 404
    data = response.json()

    assert data["detail"] == "Team not found for the current user"


def test_batch_update(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )

    team = create_random_team(db, owner_id=user.id)

    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    app = create_random_app(db, team=team)
    initial_updated_at = app.updated_at
    create_environment_variable(db, app=app, name="initial_name", value="initial_value")
    create_environment_variable(
        db, app=app, name="initial_name_2", value="initial_value_2"
    )
    create_environment_variable(
        db, app=app, name="initial_name_3", value="initial_value_3"
    )

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.patch(
        f"{settings.API_V1_STR}/apps/{app.id}/environment-variables",
        headers=user_auth_headers,
        json={
            "initial_name": "updated_value",
            "initial_name_2": None,
            "new_name": "new_value",
        },
    )

    assert response.status_code == 200
    data = response.json()
    db.refresh(app)
    assert data["count"] == 3
    assert data["data"][0]["name"] == "initial_name"
    assert data["data"][0]["value"] == "updated_value"
    assert data["data"][1]["name"] == "initial_name_3"
    assert data["data"][1]["value"] == "initial_value_3"
    assert data["data"][2]["name"] == "new_name"
    assert data["data"][2]["value"] == "new_value"
    assert app.updated_at > initial_updated_at

    assert (
        db.exec(
            select(EnvironmentVariable).where(
                EnvironmentVariable.name == "initial_name",
                EnvironmentVariable.app_id == app.id,
                EnvironmentVariable.value == "updated_value",
            )
        ).first()
        is not None
    )

    assert (
        db.exec(
            select(EnvironmentVariable).where(
                EnvironmentVariable.name == "initial_name_2",
                EnvironmentVariable.app_id == app.id,
            )
        ).first()
        is None
    )

    assert (
        db.exec(
            select(EnvironmentVariable).where(
                EnvironmentVariable.name == "initial_name_3",
                EnvironmentVariable.app_id == app.id,
                EnvironmentVariable.value == "initial_value_3",
            )
        ).first()
        is not None
    )

    assert (
        db.exec(
            select(EnvironmentVariable).where(
                EnvironmentVariable.name == "new_name",
                EnvironmentVariable.app_id == app.id,
                EnvironmentVariable.value == "new_value",
            )
        ).first()
        is not None
    )


def test_batch_update_for_app_not_found(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.patch(
        f"{settings.API_V1_STR}/apps/70a83fd6-000e-46da-a7b0-e1bbc260f5b4/environment-variables",
        headers=user_auth_headers,
        json={
            "initial_name": "updated_value",
            "initial_name_2": None,
            "new_name": "new_value",
        },
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"


def test_batch_update_for_app_different_team(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )

    team = create_random_team(db, owner_id=user.id)

    app = create_random_app(db, team=team)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.patch(
        f"{settings.API_V1_STR}/apps/{app.id}/environment-variables",
        headers=user_auth_headers,
        json={
            "initial_name": "updated_value",
            "initial_name_2": None,
            "new_name": "new_value",
        },
    )

    assert response.status_code == 404
    data = response.json()

    assert data["detail"] == "Team not found for the current user"


def test_read_environment_variables_filters_by_app_status(
    client: TestClient, db: Session
) -> None:
    """Test that read environment variables endpoint filters by app status."""
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    soft_deleted_app = create_random_app(db, team=team)
    soft_deleted_app.deleted_at = get_datetime_utc()
    db.add(soft_deleted_app)
    db.commit()

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/{soft_deleted_app.id}/environment-variables",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"


def test_create_environment_variable_filters_by_app_status(
    client: TestClient, db: Session
) -> None:
    """Test that create environment variable endpoint filters by app status."""
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    soft_deleted_app = create_random_app(db, team=team)
    soft_deleted_app.deleted_at = get_datetime_utc()
    db.add(soft_deleted_app)
    db.commit()

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    data = {
        "name": "TEST_VAR",
        "value": "test_value",
    }

    response = client.post(
        f"{settings.API_V1_STR}/apps/{soft_deleted_app.id}/environment-variables",
        headers=user_auth_headers,
        json=data,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"


def test_update_environment_variable_filters_by_app_status(
    client: TestClient, db: Session
) -> None:
    """Test that update environment variable endpoint filters by app status."""
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    soft_deleted_app = create_random_app(db, team=team)
    env = create_environment_variable(
        db, app=soft_deleted_app, name="TEST_VAR", value="old_value"
    )
    soft_deleted_app.deleted_at = get_datetime_utc()
    db.add(soft_deleted_app)
    db.commit()

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    data = {"value": "new_value"}

    response = client.put(
        f"{settings.API_V1_STR}/apps/{soft_deleted_app.id}/environment-variables/{env.name}",
        headers=user_auth_headers,
        json=data,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"


def test_delete_environment_variable_filters_by_app_status(
    client: TestClient, db: Session
) -> None:
    """Test that delete environment variable endpoint filters by app status."""
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    soft_deleted_app = create_random_app(db, team=team)
    env = create_environment_variable(
        db, app=soft_deleted_app, name="TEST_VAR", value="test_value"
    )
    soft_deleted_app.deleted_at = get_datetime_utc()
    db.add(soft_deleted_app)
    db.commit()

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.delete(
        f"{settings.API_V1_STR}/apps/{soft_deleted_app.id}/environment-variables/{env.name}",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"


def test_batch_update_environment_variables_filters_by_app_status(
    client: TestClient, db: Session
) -> None:
    """Test that batch update environment variables endpoint filters by app status."""
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    soft_deleted_app = create_random_app(db, team=team)
    soft_deleted_app.deleted_at = get_datetime_utc()
    db.add(soft_deleted_app)
    db.commit()

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.patch(
        f"{settings.API_V1_STR}/apps/{soft_deleted_app.id}/environment-variables",
        headers=user_auth_headers,
        json={
            "NEW_VAR": "new_value",
            "ANOTHER_VAR": "another_value",
        },
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"
