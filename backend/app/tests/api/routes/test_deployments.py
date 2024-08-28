import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import settings
from app.crud import add_user_to_team
from app.models import Deployment, Role
from app.tests.utils.apps import create_random_app
from app.tests.utils.team import create_random_team
from app.tests.utils.user import create_user, user_authentication_headers
from app.tests.utils.utils import random_email


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

    deployment_in = {"app_id": str(app.id)}

    response = client.post(
        f"{settings.API_V1_STR}/deployments/",
        headers=user_auth_headers,
        json=deployment_in,
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

    deployment_in = {"app_id": str(app.id)}

    response = client.post(
        f"{settings.API_V1_STR}/deployments/",
        headers=user_auth_headers,
        json=deployment_in,
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

    deployment_in = {"app_id": str(app.id)}

    response = client.post(
        f"{settings.API_V1_STR}/deployments/",
        headers=user_auth_headers,
        json=deployment_in,
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

    deployment_in = {"app_id": str(fake_app_id)}

    response = client.post(
        f"{settings.API_V1_STR}/deployments/",
        headers=user_auth_headers,
        json=deployment_in,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"
