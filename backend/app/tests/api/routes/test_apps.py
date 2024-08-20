from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import settings
from app.crud import add_user_to_team
from app.models import App, Role
from app.tests.utils.apps import create_random_app
from app.tests.utils.team import create_random_team
from app.tests.utils.user import create_user, user_authentication_headers
from app.tests.utils.utils import random_email


def test_read_apps(client: TestClient, db: Session) -> None:
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
    app2 = create_random_app(db, team=team)

    team2 = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team2, role=Role.admin)

    app3 = create_random_app(db, team=team2)
    app4 = create_random_app(db, team=team2)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/?team_slug={team.slug}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 2
    assert data["data"][0]["id"] == str(app.id)
    assert data["data"][0]["name"] == app.name
    assert data["data"][0]["slug"] == app.slug
    assert data["data"][1]["id"] == str(app2.id)
    assert data["data"][1]["name"] == app2.name
    assert data["data"][1]["slug"] == app2.slug
    assert all(app["id"] not in {str(app3.id), str(app4.id)} for app in data["data"])


def test_create_app_admin(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Admin User",
        is_verified=True,
    )
    team = create_random_team(db)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    app_in = {"name": "test app", "team_slug": team.slug}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"]
    assert data["name"] == app_in["name"]
    assert data["team_id"] == str(team.id)

    app_query = select(App).where(App.id == data["id"])
    app_db = db.exec(app_query).first()
    assert app_db
    assert app_db.name == app_in["name"]
    assert app_db.team_id == team.id


def test_create_app_member(client: TestClient, db: Session) -> None:
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

    app_in = {"name": "test app", "team_slug": team.slug}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"]
    assert data["name"] == app_in["name"]
    assert data["team_id"] == str(team.id)

    app_query = select(App).where(App.id == data["id"])
    app_db = db.exec(app_query).first()
    assert app_db
    assert app_db.name == app_in["name"]
    assert app_db.team_id == team.id


def test_create_app_with_empty_name(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    app_in = {"name": "", "team_slug": team.slug}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 422

    data = response.json()

    assert data["detail"][0]["loc"] == ["body", "name"]
    assert data["detail"][0]["msg"] == "String should have at least 1 character"


def test_create_project_user_not_in_team(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    app_in = {"name": "test app", "team_slug": team.slug}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 404

    data = response.json()
    assert data["detail"] == "Team not found for the current user"
