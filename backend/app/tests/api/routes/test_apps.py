import re
import uuid
from datetime import timedelta

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import MainSettings
from app.crud import add_user_to_team
from app.models import App, AppStatus, Role
from app.tests.utils.apps import create_deployment_for_app, create_random_app
from app.tests.utils.team import create_random_team
from app.tests.utils.user import create_user, user_authentication_headers
from app.tests.utils.utils import random_email

settings = MainSettings.get_settings()


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

    deployment = create_deployment_for_app(db, app=app)
    deployment.updated_at = app.updated_at - timedelta(days=1)
    create_deployment_for_app(db, app=app2)
    db.commit()

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
        f"{settings.API_V1_STR}/apps/?team_id={team.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 2
    assert data["data"][0]["id"] == str(app.id)
    assert data["data"][0]["name"] == app.name
    assert data["data"][0]["slug"] == app.slug
    assert data["data"][0]["is_fresh"] is True
    assert data["data"][1]["id"] == str(app2.id)
    assert data["data"][1]["name"] == app2.name
    assert data["data"][1]["slug"] == app2.slug
    assert data["data"][1]["is_fresh"] is False
    assert all(app["id"] not in {str(app3.id), str(app4.id)} for app in data["data"])


def test_read_apps_filter_by_slug(client: TestClient, db: Session) -> None:
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
    create_random_app(db, team=team)

    team2 = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team2, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/?team_id={team.id}&slug={app.slug}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert data["data"][0]["id"] == str(app.id)
    assert data["data"][0]["name"] == app.name
    assert data["data"][0]["slug"] == app.slug
    assert data["data"][0]["is_fresh"] is None


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

    app_in = {"name": "test app", "team_id": str(team.id)}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["id"]
    assert data["name"] == app_in["name"]
    assert data["team_id"] == str(team.id)
    assert data["is_fresh"] is None

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

    app_in = {"name": "test app", "team_id": str(team.id)}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["id"]
    assert data["name"] == app_in["name"]
    assert data["team_id"] == str(team.id)
    assert data["is_fresh"] is None

    app_query = select(App).where(App.id == data["id"])
    app_db = db.exec(app_query).first()
    assert app_db
    assert app_db.name == app_in["name"]
    assert app_db.team_id == team.id


def test_create_app_reserved_name(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User Reserved Name",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    app_in = {"name": "fastapi", "team_id": str(team.id)}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 201
    data = response.json()
    assert app_in["name"] in data["slug"]
    assert data["slug"] != app_in["name"]
    assert len(data["slug"].split("-")[-1]) == 8


def test_create_app_too_short_name(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User Reserved Name",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    app_in = {"name": "app", "team_id": str(team.id)}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 201
    data = response.json()
    assert app_in["name"] in data["slug"]
    assert data["slug"] != app_in["name"]
    slug: str = data["slug"]
    prefix, _, suffix = slug.rpartition("-")
    assert prefix == "app"
    assert len(suffix) == 8


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

    app_in = {"name": "", "team_id": str(team.id)}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 422

    data = response.json()

    assert data["detail"][0]["loc"] == ["body", "name"]
    assert data["detail"][0]["msg"] == "String should have at least 1 character"


def test_app_name_starting_with_number(client: TestClient, db: Session) -> None:
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

    app_in = {"name": "123app", "team_id": str(team.id)}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 201
    data = response.json()

    assert not data["slug"][0].isdigit()
    assert data["slug"].startswith("a")
    assert re.match(r"^[a-z][a-z0-9-]*[a-z0-9]$", data["slug"])


def test_app_name_with_leading_trailing_hyphens(
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

    app_in = {"name": "-test-app-", "team_id": str(team.id)}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 201
    data = response.json()

    assert data["slug"].startswith("test-app")
    assert not data["slug"].startswith("-")
    assert not data["slug"].endswith("-")
    assert re.match(r"^[a-z][a-z0-9-]*[a-z0-9]$", data["slug"])


def test_app_name_very_long(client: TestClient, db: Session) -> None:
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

    long_name = "this-is-an-extremely-long-application-name-that-exceeds-sixty-three-characters-limit-by-a-lot"
    app_in = {"name": long_name, "team_id": str(team.id)}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 201
    data = response.json()

    assert len(data["slug"]) <= 63
    assert re.match(r"^[a-z][a-z0-9-]*[a-z0-9]$", data["slug"])


def test_app_with_multiple_hyphens(client: TestClient, db: Session) -> None:
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

    app_in = {"name": "test--app", "team_id": str(team.id)}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 201
    data = response.json()

    assert data["slug"].startswith("test-app")
    assert re.match(r"^[a-z][a-z0-9-]*[a-z0-9]$", data["slug"])


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

    app_in = {"name": "test app", "team_id": str(team.id)}
    response = client.post(
        f"{settings.API_V1_STR}/apps/",
        headers=user_auth_headers,
        json=app_in,
    )

    assert response.status_code == 404

    data = response.json()
    assert data["detail"] == "Team not found for the current user"


def test_read_app(client: TestClient, db: Session) -> None:
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

    response = client.get(
        f"{settings.API_V1_STR}/apps/{app.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["id"] == str(app.id)
    assert data["name"] == app.name
    assert data["slug"] == app.slug
    assert data["team_id"] == str(team.id)
    assert data["is_fresh"] is None


def test_read_app_with_fresh_deployment(client: TestClient, db: Session) -> None:
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
    deployment.updated_at = app.updated_at - timedelta(days=1)
    db.commit()
    db.refresh(deployment)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/{app.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["id"] == str(app.id)
    assert data["name"] == app.name
    assert data["slug"] == app.slug
    assert data["team_id"] == str(team.id)
    assert data["is_fresh"] is True
    assert app.updated_at > deployment.updated_at


def test_read_app_user_not_in_team(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db)

    app = create_random_app(db, team=team)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/{app.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Team not found for the current user"


def test_read_app_invalid_uuid(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )

    invalid_uuid = uuid.uuid4()

    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/{invalid_uuid}",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"


def test_delete_app(client: TestClient, db: Session) -> None:
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

    response = client.delete(
        f"{settings.API_V1_STR}/apps/{app.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "App deleted"

    db.refresh(app)
    assert app.status == AppStatus.pending_deletion


def test_delete_app_user_not_in_team(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db)

    app = create_random_app(db, team=team)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.delete(
        f"{settings.API_V1_STR}/apps/{app.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Team not found for the current user"


def test_delete_app_user_not_admin(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db)
    add_user_to_team(session=db, user=user, team=team, role=Role.member)

    app = create_random_app(db, team=team)

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.delete(
        f"{settings.API_V1_STR}/apps/{app.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == "You do not have permission to delete this app"


def test_read_apps_only_shows_active_apps(client: TestClient, db: Session) -> None:
    """Test that list apps endpoint only returns active apps."""
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    active_app = create_random_app(db, team=team)

    pending_app = create_random_app(db, team=team)
    pending_app.status = AppStatus.pending_deletion
    db.add(pending_app)

    db.commit()

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/?team_id={team.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()

    assert data["count"] == 1
    assert len(data["data"]) == 1
    assert data["data"][0]["id"] == str(active_app.id)


def test_read_app_filters_by_status(client: TestClient, db: Session) -> None:
    """Test that read app endpoint only returns active apps."""
    user = create_user(
        session=db,
        email=random_email(),
        password="password12345",
        full_name="Test User",
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user.id)
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    pending_app = create_random_app(db, team=team)
    pending_app.status = AppStatus.pending_deletion
    db.add(pending_app)
    db.commit()

    user_auth_headers = user_authentication_headers(
        client=client,
        email=user.email,
        password="password12345",
    )

    response = client.get(
        f"{settings.API_V1_STR}/apps/{pending_app.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "App not found"
