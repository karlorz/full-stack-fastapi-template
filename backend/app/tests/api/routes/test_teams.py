import uuid
from datetime import datetime, timedelta
from typing import Any
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import MainSettings
from app.crud import add_user_to_team
from app.models import Role, Team, UserTeamLink
from app.tests.utils.team import create_random_team
from app.tests.utils.user import (
    create_random_user,
    create_user,
    user_authentication_headers,
)

settings = MainSettings.get_settings()


def test_read_teams(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    org1 = create_random_team(db)
    org2 = create_random_team(db)
    org3 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(
        session=db,
        email="test@fastapi.com",
        password="test12345",
        full_name="test",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user1, team=org1, role=Role.admin)
    add_user_to_team(session=db, user=user1, team=org2, role=Role.admin)
    user2 = create_user(
        session=db,
        email="user2@example.com",
        password="secret2345",
        full_name="test2",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user2, team=org3, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email=user1.email, password="test12345"
    )

    # Make a request to the get_teams route using the client fixture and superuser_token_headers
    response = client.get(
        f"{settings.API_V1_STR}/teams/",
        headers=user_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 200

    # Organizations should be sorted by id to match the order in the database
    organizations = [org1, org2]
    organizations.sort(key=lambda org: org.id, reverse=False)

    data = response.json()
    teams = data["data"]
    teams.sort(key=lambda team: team["id"], reverse=False)
    count = data["count"]
    assert len(teams) == 2
    assert count == 2
    assert teams[0]["id"] == str(organizations[0].id)
    assert teams[1]["id"] == str(organizations[1].id)

    # Get the second org, with the second user, the data shouldn't be mixed
    user2_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="secret2345"
    )
    response = client.get(
        f"{settings.API_V1_STR}/teams/",
        headers=user2_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 200
    data = response.json()
    teams = data["data"]
    count = data["count"]
    assert len(teams) == 1
    assert count == 1
    assert teams[0]["id"] == str(org3.id)


def test_read_teams_filter_by_slug(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    org1 = create_random_team(db)
    org2 = create_random_team(db)
    org3 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(
        session=db,
        email="test-slug@fastapi.com",
        password="test12345",
        full_name="test",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user1, team=org1, role=Role.admin)
    add_user_to_team(session=db, user=user1, team=org2, role=Role.admin)
    user2 = create_user(
        session=db,
        email="user2-slug@example.com",
        password="secret2345",
        full_name="test2",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user2, team=org3, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email=user1.email, password="test12345"
    )

    # Make a request to the get_teams route using the client fixture and superuser_token_headers
    response = client.get(
        f"{settings.API_V1_STR}/teams/?slug={org1.slug}",
        headers=user_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 200

    # Organizations should be sorted by id to match the order in the database
    organizations = [org1, org2]
    organizations.sort(key=lambda org: org.id, reverse=False)

    data = response.json()
    teams = data["data"]
    teams.sort(key=lambda team: team["id"], reverse=False)
    count = data["count"]
    assert len(teams) == 1
    assert count == 1
    assert teams[0]["id"] == str(org1.id)


def test_read_owned_team(client: TestClient, db: Session) -> None:
    user1 = create_user(
        session=db,
        email="test2@fastapi.com",
        password="test12345",
        full_name="test",
        is_verified=True,
    )

    assert user1.personal_team

    org1 = create_random_team(db, owner_id=user1.id)
    org2 = create_random_team(db)

    add_user_to_team(session=db, user=user1, team=org2, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email=user1.email, password="test12345"
    )

    # Make a request to the get_teams route using the client fixture and superuser_token_headers
    response = client.get(
        f"{settings.API_V1_STR}/teams/?owner=true&order_by=created_at&order=desc",
        headers=user_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 200
    data = response.json()
    teams = data["data"]
    count = data["count"]
    # create_user creates a team for the user
    assert len(teams) == 2
    assert count == 2
    assert teams[0]["id"] == str(org1.id)
    assert teams[1]["id"] == str(user1.personal_team.id)


def test_read_teams_order(client: TestClient, db: Session) -> None:
    now = datetime.now()

    org1 = create_random_team(db, created_at=now - timedelta(days=2))
    org2 = create_random_team(db, created_at=now - timedelta(days=1))
    org3 = create_random_team(db, created_at=now)

    user1 = create_user(
        session=db,
        email="test-order@fastapi.com",
        password="test12345",
        full_name="test",
        is_verified=True,
    )

    add_user_to_team(session=db, user=user1, team=org1, role=Role.admin)
    add_user_to_team(session=db, user=user1, team=org2, role=Role.admin)
    add_user_to_team(session=db, user=user1, team=org3, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email=user1.email, password="test12345"
    )

    response = client.get(
        f"{settings.API_V1_STR}/teams/?order_by=created_at&order=asc",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    teams = response.json()["data"]

    ids = [team["id"] for team in teams]

    assert ids == [str(org1.id), str(org2.id), str(org3.id)]

    response = client.get(
        f"{settings.API_V1_STR}/teams/?order_by=created_at&order=desc",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    teams = response.json()["data"]

    ids = [team["id"] for team in teams]

    assert ids == [str(org3.id), str(org2.id), str(org1.id)]


def test_read_team(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    user = create_user(
        session=db,
        email="org2@fastapi.com",
        password="test12345",
        full_name="org2",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email="org2@fastapi.com", password="test12345"
    )

    response = client.get(
        f"{settings.API_V1_STR}/teams/{team.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data: dict[str, Any] = response.json()

    assert data["id"]
    assert data["name"]
    assert data["slug"]
    assert data["description"]
    assert data["user_links"]
    assert len(data["user_links"]) == 1
    for item in data["user_links"]:
        assert "role" in item
        assert item["user"]["id"]
        assert item["user"]["email"]
        assert "full_name" in item["user"]


def test_read_team_not_found(logged_in_client: TestClient) -> None:
    response = logged_in_client.get(
        f"{settings.API_V1_STR}/teams/00000000-0000-0000-0000-000000000000",
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Team not found for the current user"


def test_create_team(logged_in_client: TestClient, db: Session) -> None:
    team_in = {"name": "test", "description": "test description"}

    with patch(
        "app.api.routes.teams.is_team_creation_allowed", return_value=True
    ) as mock_is_team_creation_allowed:
        response = logged_in_client.post(
            f"{settings.API_V1_STR}/teams/",
            json=team_in,
        )

    assert mock_is_team_creation_allowed.called
    assert response.status_code == 200
    data = response.json()
    assert data["id"]
    assert data["name"] == team_in["name"]
    assert data["slug"]
    assert data["description"] == team_in["description"]

    team_query = select(Team).where(Team.id == data["id"])
    team_db = db.exec(team_query).first()
    assert team_db
    assert team_db.name == team_in["name"]
    assert team_db.slug
    assert team_db.description == team_in["description"]


def test_create_team_name_exists_new_created(
    logged_in_client: TestClient, db: Session
) -> None:
    user = create_random_user(db)

    team = Team(
        name="test copy",
        description="test description",
        slug="test-copy",
        owner_id=user.id,
    )
    db.add(team)
    db.commit()

    team_in = {"name": "test-copy", "description": "test description"}
    with patch(
        "app.api.routes.teams.is_team_creation_allowed", return_value=True
    ) as mock_is_team_creation_allowed:
        response = logged_in_client.post(
            f"{settings.API_V1_STR}/teams/",
            json=team_in,
        )

    assert mock_is_team_creation_allowed.called
    assert response.status_code == 200
    data = response.json()
    assert data["id"]
    assert data["name"] == team_in["name"]
    assert data["slug"]
    assert data["description"] == team_in["description"]

    team_query = select(Team).where(Team.id == data["id"])
    team_db = db.exec(team_query).first()
    assert team_db
    assert team_db.name == team_in["name"]
    assert team_db.slug
    assert team_db.description == team_in["description"]
    assert (
        len(team_db.slug) == len(team_db.name) + 9
    )  # just to verify the dot slash and characters were added


def test_create_team_with_empty_name(logged_in_client: TestClient) -> None:
    team_in = {"name": "", "description": "test description"}

    response = logged_in_client.post(
        f"{settings.API_V1_STR}/teams/",
        json=team_in,
    )

    assert response.status_code == 422

    data = response.json()

    assert data["detail"][0]["loc"] == ["body", "name"]
    assert data["detail"][0]["msg"] == "String should have at least 3 characters"


def test_update_team(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    user = create_user(
        session=db,
        email="org3@fastapi.com",
        password="test12345",
        full_name="org3",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email="org3@fastapi.com", password="test12345"
    )

    team_in = {
        "description": "test description updated",
    }
    response = client.put(
        f"{settings.API_V1_STR}/teams/{team.id}",
        headers=user_auth_headers,
        json=team_in,
    )

    assert response.status_code == 200
    data = response.json()
    db.refresh(team)
    assert data["id"] == str(team.id)
    assert data["description"] == team_in["description"]
    assert team.description == team_in["description"]


def test_update_team_not_found(logged_in_client: TestClient) -> None:
    team_in = {
        "name": "test updated",
        "description": "test description updated",
    }

    response = logged_in_client.put(
        f"{settings.API_V1_STR}/teams/00000000-0000-0000-0000-000000000000",
        json=team_in,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Team not found for the current user"


def test_update_team_not_enough_permissions(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    user = create_user(
        session=db,
        email="org4@fastapi.com",
        password="test12345",
        full_name="org4",
        is_verified=True,
    )
    user_member = create_user(
        session=db,
        email="org5@fastapi.com",
        password="test12345",
        full_name="org5",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)
    add_user_to_team(session=db, user=user_member, team=team, role=Role.member)

    user_auth_headers = user_authentication_headers(
        client=client, email="org5@fastapi.com", password="test12345"
    )

    team_in = {
        "name": "test updated",
        "description": "test description updated",
    }
    response = client.put(
        f"{settings.API_V1_STR}/teams/{team.id}",
        headers=user_auth_headers,
        json=team_in,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not enough permissions to execute this action"


def test_transfer_team(client: TestClient, db: Session) -> None:
    owner_email = "owner1@fastapi.com"
    user_email = "user1@fastapi.com"
    password = "test12345"
    full_name = "Test User"

    user1 = create_user(
        session=db,
        email=owner_email,
        password=password,
        full_name=full_name,
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user1.id)
    user2 = create_user(
        session=db,
        email=user_email,
        password=password,
        full_name=full_name,
        is_verified=True,
    )
    add_user_to_team(session=db, user=user1, team=team, role=Role.admin)
    add_user_to_team(session=db, user=user2, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email=owner_email, password=password
    )
    response = client.put(
        f"{settings.API_V1_STR}/teams/{team.id}/transfer-ownership/",
        headers=user_auth_headers,
        json={"user_id": str(user2.id)},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["owner_id"] == str(user2.id)
    db.refresh(team)
    assert team.owner_id == user2.id


def test_transfer_team_user_not_found(client: TestClient, db: Session) -> None:
    owner_email = "owner2@fastapi.com"
    user_email = "user2@fastapi.com"
    password = "test12345"
    full_name = "Test User"

    user1 = create_user(
        session=db,
        email=owner_email,
        password=password,
        full_name=full_name,
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user1.id)
    user2 = create_user(
        session=db,
        email=user_email,
        password=password,
        full_name=full_name,
        is_verified=True,
    )
    add_user_to_team(session=db, user=user1, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email=owner_email, password=password
    )
    response = client.put(
        f"{settings.API_V1_STR}/teams/{team.id}/transfer-ownership/",
        headers=user_auth_headers,
        json={"user_id": str(user2.id)},
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "User not found in team"


def test_transfer_team_member_cannot_transfer(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    user1_email = "owner3@fastapi.com"
    user2_email = "user3@fastapi.com"
    password = "test12345"
    full_name = "Test User"

    user1 = create_user(
        session=db,
        email=user1_email,
        password=password,
        full_name=full_name,
        is_verified=True,
    )
    user2 = create_user(
        session=db,
        email=user2_email,
        password=password,
        full_name=full_name,
        is_verified=True,
    )
    add_user_to_team(session=db, user=user1, team=team, role=Role.member)
    add_user_to_team(session=db, user=user2, team=team, role=Role.member)

    user_auth_headers = user_authentication_headers(
        client=client, email=user1_email, password=password
    )
    response = client.put(
        f"{settings.API_V1_STR}/teams/{team.id}/transfer-ownership/",
        headers=user_auth_headers,
        json={"user_id": str(user2.id)},
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not enough permissions to execute this action"


def test_transfer_team_new_owner_not_admin(client: TestClient, db: Session) -> None:
    owner_email = "owner4@fastapi.com"
    user_email = "user4@fastapi.com"
    password = "test12345"
    full_name = "Test User"
    user1 = create_user(
        session=db,
        email=owner_email,
        password=password,
        full_name=full_name,
        is_verified=True,
    )
    team = create_random_team(db, owner_id=user1.id)
    user2 = create_user(
        session=db,
        email=user_email,
        password=password,
        full_name=full_name,
        is_verified=True,
    )

    add_user_to_team(session=db, user=user1, team=team, role=Role.admin)
    add_user_to_team(session=db, user=user2, team=team, role=Role.member)

    user_auth_headers = user_authentication_headers(
        client=client, email=owner_email, password=password
    )
    response = client.put(
        f"{settings.API_V1_STR}/teams/{team.id}/transfer-ownership/",
        headers=user_auth_headers,
        json={"user_id": str(user2.id)},
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "User must be an admin to transfer ownership"


def test_delete_team(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    user = create_user(
        session=db,
        email="org6@fastapi.com",
        password="test12345",
        full_name="org6",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email="org6@fastapi.com", password="test12345"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/teams/{team.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Team deleted"

    team_query = select(Team).where(Team.id == team.id)
    team_db = db.exec(team_query).first()
    assert team_db is None


def test_delete_team_not_found(logged_in_client: TestClient) -> None:
    response = logged_in_client.delete(
        f"{settings.API_V1_STR}/teams/00000000-0000-0000-0000-000000000000",
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Team not found for the current user"


def test_delete_team_not_enough_permissions(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    user = create_user(
        session=db,
        email="org7@fastapi.com",
        password="test12345",
        full_name="org7",
        is_verified=True,
    )
    user_member = create_user(
        session=db,
        email="org8@fastapi.com",
        password="test12345",
        full_name="org8",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)
    add_user_to_team(session=db, user=user_member, team=team, role=Role.member)

    user_auth_headers = user_authentication_headers(
        client=client, email="org8@fastapi.com", password="test12345"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/teams/{team.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not enough permissions to execute this action"


def test_delete_personal_team_forbidden(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email="default-org@fastapi.com",
        password="test12345",
        full_name="default-org",
        is_verified=True,
    )
    db.add(user)
    db.commit()

    user_auth_headers = user_authentication_headers(
        client=client, email="default-org@fastapi.com", password="test12345"
    )

    assert user.personal_team is not None

    team = user.personal_team
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    response = client.delete(
        f"{settings.API_V1_STR}/teams/{team.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "You cannot delete your personal team"

    team_query = select(Team).where(Team.id == team.id)
    team_db = db.exec(team_query).first()
    assert team_db is not None


def test_update_member_in_team(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    user = create_user(
        session=db,
        email="org17@fastapi.com",
        password="test12345",
        full_name="org17",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email="org17@fastapi.com", password="test12345"
    )

    response = client.put(
        f"{settings.API_V1_STR}/teams/{team.id}/users/{user.id}",
        headers=user_auth_headers,
        json={"role": "member"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "member"
    assert data["team"]["id"] == str(team.id)
    assert data["user"]["id"] == str(user.id)

    user_team_query = select(UserTeamLink).where(UserTeamLink.user == user)
    user_team_db = db.exec(user_team_query).first()
    db.refresh(user_team_db)
    assert user_team_db
    assert user_team_db.role == data["role"]
    assert str(user_team_db.team_id) == data["team"]["id"]
    assert str(user_team_db.user_id) == data["user"]["id"]


def test_update_member_in_team_not_enough_permissions(
    client: TestClient, db: Session
) -> None:
    team = create_random_team(db)
    user = create_user(
        session=db,
        email="org18@fastapi.com",
        password="test12345",
        full_name="org18",
        is_verified=True,
    )
    user_member = create_user(
        session=db,
        email="org19@fastapi.com",
        password="test12345",
        full_name="org19",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user_member, team=team, role=Role.member)

    user_auth_headers = user_authentication_headers(
        client=client, email="org19@fastapi.com", password="test12345"
    )

    response = client.put(
        f"{settings.API_V1_STR}/teams/{team.id}/users/{user.id}",
        headers=user_auth_headers,
        json={"role": "admin"},
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not enough permissions to execute this action"


def test_update_member_in_team_user_not_in_team(
    client: TestClient, db: Session
) -> None:
    team = create_random_team(db)
    user = create_user(
        session=db,
        email="org20@fastapi.com",
        password="test12345",
        full_name="org20",
        is_verified=True,
    )
    user_to_update = create_user(
        session=db,
        email="org21@fastapi.com",
        password="test12345",
        full_name="org21",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email="org20@fastapi.com", password="test12345"
    )

    response = client.put(
        f"{settings.API_V1_STR}/teams/{team.id}/users/{user_to_update.id}",
        headers=user_auth_headers,
        json={"role": "admin"},
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "User not in team"


def test_update_member_in_team_not_found(client: TestClient, db: Session) -> None:
    user = create_user(
        session=db,
        email="org22@fastapi.com",
        password="test12345",
        full_name="org22",
        is_verified=True,
    )
    user_auth_headers = user_authentication_headers(
        client=client, email="org22@fastapi.com", password="test12345"
    )

    response = client.put(
        f"{settings.API_V1_STR}/teams/00000000-0000-0000-0000-000000000000/users/{user.id}",
        headers=user_auth_headers,
        json={"role": "admin"},
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Team not found for the current user"


def test_remove_member_from_team(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    user = create_user(
        session=db,
        email="org23@fastapi.com",
        password="test12345",
        full_name="org23",
        is_verified=True,
    )
    user_member = create_user(
        session=db,
        email="org24@fastapi.com",
        password="test12345",
        full_name="org24",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)
    add_user_to_team(session=db, user=user_member, team=team, role=Role.member)

    user_auth_headers = user_authentication_headers(
        client=client, email="org23@fastapi.com", password="test12345"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/teams/{team.id}/users/{user_member.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User removed from team"

    user_team_query = select(UserTeamLink).where(UserTeamLink.user == user_member)
    user_team_db = db.exec(user_team_query).first()
    assert not user_team_db


def test_remove_member_from_team_not_enough_permissions(
    client: TestClient, db: Session
) -> None:
    team = create_random_team(db)
    user = create_user(
        session=db,
        email="org25@fastapi.com",
        password="test12345",
        full_name="org25",
        is_verified=True,
    )
    user_member = create_user(
        session=db,
        email="org26@fastapi.com",
        password="test12345",
        full_name="org26",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)
    add_user_to_team(session=db, user=user_member, team=team, role=Role.member)

    user_auth_headers = user_authentication_headers(
        client=client, email="org26@fastapi.com", password="test12345"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/teams/{team.id}/users/{user.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not enough permissions to execute this action"


def test_remove_member_from_team_not_found(client: TestClient, db: Session) -> None:
    create_user(
        session=db,
        email="org27@fastapi.com",
        password="test12345",
        full_name="org27",
        is_verified=True,
    )
    user_auth_headers = user_authentication_headers(
        client=client, email="org27@fastapi.com", password="test12345"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/teams/00000000-0000-0000-0000-000000000000/users/{uuid.uuid4()}",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Team not found for the current user"


def test_remove_member_from_team_user_not_found(
    client: TestClient, db: Session
) -> None:
    team = create_random_team(db)
    user = create_user(
        session=db,
        email="org28@fastapi.com",
        password="test12345",
        full_name="org28",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email="org28@fastapi.com", password="test12345"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/teams/{team.id}/users/{uuid.uuid4()}",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "User not found in team"


def test_remove_from_team_not_allow_yourself(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    user = create_user(
        session=db,
        email="org29@fastapi.com",
        password="test12345",
        full_name="org29",
        is_verified=True,
    )
    add_user_to_team(session=db, user=user, team=team, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email="org29@fastapi.com", password="test12345"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/teams/{team.id}/users/{user.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "You cannot remove yourself from the team"
