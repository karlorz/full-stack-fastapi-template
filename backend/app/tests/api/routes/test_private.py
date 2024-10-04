from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import settings
from app.models import (
    App,
    Deployment,
    EnvironmentVariable,
    Role,
    Team,
    User,
    UserTeamLink,
)
from app.tests.utils.apps import create_random_app
from app.tests.utils.team import create_random_team
from app.tests.utils.user import create_random_user


def test_create_user(client: TestClient, db: Session) -> None:
    r = client.post(
        f"{settings.API_V1_STR}/private/users/",
        json={
            "email": "pollo@listo.com",
            "password": "password123",
            "full_name": "Pollo Listo",
        },
    )

    assert r.status_code == 200

    data = r.json()

    user = db.exec(select(User).where(User.id == data["id"])).first()

    assert user
    assert user.email == "pollo@listo.com"
    assert user.full_name == "Pollo Listo"


def test_create_team(client: TestClient, db: Session) -> None:
    user = create_random_user(db)

    r = client.post(
        f"{settings.API_V1_STR}/private/teams/",
        json={"name": "Test Team", "owner_id": str(user.id)},
    )

    assert r.status_code == 200

    data = r.json()

    team = db.exec(select(Team).where(Team.id == data["id"])).first()

    assert team

    assert team.name == "Test Team"
    assert team.owner_id == user.id

    user_team_link = db.exec(
        select(UserTeamLink).where(UserTeamLink.user_id == user.id)
    ).first()

    assert user_team_link
    assert user_team_link.team_id == team.id
    assert user_team_link.role == Role.admin


def test_create_app(client: TestClient, db: Session) -> None:
    team = create_random_team(db)

    r = client.post(
        f"{settings.API_V1_STR}/private/apps/",
        json={"name": "Test App", "team_id": str(team.id)},
    )
    assert r.status_code == 200

    data = r.json()

    app = db.exec(select(App).where(App.id == data["id"])).first()

    assert app
    assert app.name == "Test App"
    assert app.team_id == team.id


def test_create_deployment(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    app = create_random_app(db, team=team)

    r = client.post(
        f"{settings.API_V1_STR}/private/deployments/",
        json={"app_id": str(app.id)},
    )
    assert r.status_code == 200

    data = r.json()

    deployment = db.exec(select(Deployment).where(Deployment.id == data["id"])).first()

    assert deployment
    assert deployment.app_id == app.id


def test_create_deployment_with_status(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    app = create_random_app(db, team=team)

    r = client.post(
        f"{settings.API_V1_STR}/private/deployments/",
        json={"app_id": str(app.id), "status": "failed"},
    )
    assert r.status_code == 200

    data = r.json()

    deployment = db.exec(select(Deployment).where(Deployment.id == data["id"])).first()

    assert deployment
    assert deployment.app_id == app.id


def test_create_environment_variable(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    app = create_random_app(db, team=team)

    r = client.post(
        f"{settings.API_V1_STR}/private/environment-variables/",
        json={"app_id": str(app.id), "name": "TEST_KEY", "value": "test_value"},
    )
    assert r.status_code == 200

    env_var = db.exec(
        select(EnvironmentVariable).where(EnvironmentVariable.name == "TEST_KEY")
    ).first()

    assert env_var
    assert env_var.app_id == app.id
    assert env_var.name == "TEST_KEY"
    assert env_var.value == "test_value"
