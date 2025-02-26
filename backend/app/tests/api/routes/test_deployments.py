import json
import uuid
from unittest.mock import patch

from fastapi.testclient import TestClient
from redis import Redis
from sqlmodel import Session, select

from app.api.routes.deployments import sqs
from app.core.config import CommonSettings, MainSettings
from app.crud import add_user_to_team
from app.models import Deployment, Role
from app.tests.utils.apps import create_deployment_for_app, create_random_app
from app.tests.utils.team import create_random_team
from app.tests.utils.user import create_user, user_authentication_headers
from app.tests.utils.utils import random_email

settings = MainSettings.get_settings()
common_settings = CommonSettings.get_settings()


def test_read_deployments(client: TestClient, db: Session) -> None:
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

    deployment = create_deployment_for_app(db, app=app)
    deployment1 = create_deployment_for_app(db, app=app)
    deployment2 = create_deployment_for_app(db, app=app)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/{app.id}/deployments/",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 3
    assert data["data"][0]["id"] == str(deployment.id)
    assert data["data"][0]["slug"] == deployment.slug
    assert data["data"][1]["id"] == str(deployment1.id)
    assert data["data"][1]["slug"] == deployment1.slug
    assert data["data"][2]["id"] == str(deployment2.id)
    assert data["data"][2]["slug"] == deployment2.slug


def test_create_deployment_admin(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Admin User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    app = create_random_app(db, team=team)

    response = client.post(
        f"{settings.API_V1_STR}/apps/{app.id}/deployments/",
        headers=user_auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["app_id"] == str(app.id)
    assert data["slug"] == app.slug
    assert data["status"] == "waiting_upload"

    deployment_query = select(Deployment).where(Deployment.id == data["id"])
    deployment_db = db.exec(deployment_query).first()
    assert deployment_db
    assert deployment_db.app_id == app.id
    assert deployment_db.status == "waiting_upload"


def test_create_deployment_member(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Member User",
        is_verified=True,
    )
    team = create_random_team(db)
    add_user_to_team(session=db, user=user, team=team, role=Role.member)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    app = create_random_app(db, team=team)

    response = client.post(
        f"{settings.API_V1_STR}/apps/{app.id}/deployments/",
        headers=user_auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["app_id"] == str(app.id)
    assert data["slug"] == app.slug
    assert data["status"] == "waiting_upload"

    deployment_query = select(Deployment).where(Deployment.id == data["id"])
    deployment_db = db.exec(deployment_query).first()
    assert deployment_db
    assert deployment_db.app_id == app.id
    assert deployment_db.status == "waiting_upload"


def test_create_deployment_user_not_in_team(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Admin User",
        is_verified=True,
    )
    team = create_random_team(db)
    app = create_random_app(db, team=team)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.post(
        f"{settings.API_V1_STR}/apps/{app.id}/deployments/",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Team not found for the current user"


def test_create_deployment_app_not_found(client: TestClient, db: Session) -> None:
    fake_app_id = uuid.uuid4()
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Admin User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.post(
        f"{settings.API_V1_STR}/apps/{fake_app_id}/deployments/",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"


def test_read_deployment(client: TestClient, db: Session) -> None:
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

    deployment = create_deployment_for_app(db, app=app)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/{app.id}/deployments/{deployment.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(deployment.id)
    assert data["slug"] == deployment.slug
    assert data["status"] == deployment.status
    assert data["url"] == deployment.url
    assert data["dashboard_url"] == deployment.dashboard_url


def test_upload_complete(client: TestClient, db: Session) -> None:
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
    deployment = create_deployment_for_app(db, app=app)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    with patch.object(sqs, "send_message") as mock:
        response = client.post(
            f"{settings.API_V1_STR}/deployments/{deployment.id}/upload-complete",
            headers=user_auth_headers,
        )
    assert mock.called
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "OK"


def test_upload_complete_returns_404_if_deployment_not_found(
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

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.post(
        f"{settings.API_V1_STR}/deployments/{uuid.uuid4()}/upload-complete",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Deployment not found"


def test_upload_complete_not_member_of_team(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db)
    app = create_random_app(db, team=team)
    deployment = create_deployment_for_app(db, app=app)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.post(
        f"{settings.API_V1_STR}/deployments/{deployment.id}/upload-complete",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Team not found for the current user"


def test_get_build_logs(client: TestClient, db: Session, redis: Redis) -> None:
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
    deployment = create_deployment_for_app(db, app=app)

    # Add test build logs to Redis
    redis_key = f"build_logs:{deployment.id}"
    redis.xadd(
        redis_key,
        {"type": "message", "message": "Building image..."},
        id="1234567890",
    )
    redis.xadd(
        redis_key,
        {"type": "complete", "status": "success"},
        id="1234567891",
    )

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/deployments/{deployment.id}/build-logs",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    # Convert bytes to string and split by newlines to get individual log entries
    logs = [json.loads(log) for log in response.content.decode().strip().split("\n")]
    assert len(logs) == 2

    assert logs[0]["message"] == "Building image..."
    assert logs[1]["type"] == "complete"

    # Clean up Redis after test
    redis.delete(redis_key)


def test_get_build_logs_deployment_not_found(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/deployments/{uuid.uuid4()}/build-logs",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Deployment not found"


def test_get_build_logs_user_not_in_team(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db)
    app = create_random_app(db, team=team)
    deployment = create_deployment_for_app(db, app=app)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/deployments/{deployment.id}/build-logs",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Team not found for the current user"


def test_get_build_logs_timeout(client: TestClient, db: Session) -> None:
    """Getting logs should timeout after some amount of time if there are no logs"""

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
    deployment = create_deployment_for_app(db, app=app)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    with patch.object(
        MainSettings.get_settings(), "BUILD_LOGS_STREAM_TIMEOUT_SECONDS", 1
    ):
        response = client.get(
            f"{settings.API_V1_STR}/deployments/{deployment.id}/build-logs",
            headers=user_auth_headers,
        )

    assert response.status_code == 200

    assert response.content == b'{"type": "timeout"}\n'
