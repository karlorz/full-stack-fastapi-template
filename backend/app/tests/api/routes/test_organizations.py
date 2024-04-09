from typing import Any

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.crud import add_user_to_organization
from app.models import Role
from app.tests.utils.organization import create_random_organization
from app.tests.utils.user import create_user, user_authentication_headers


def test_read_organizations(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    org1 = create_random_organization(db)
    org2 = create_random_organization(db)
    org3 = create_random_organization(db)

    # Create a user and link it to the first organization
    user1 = create_user(session=db, email="test@fastapi.com", password="test123")
    add_user_to_organization(session=db, user=user1, organization=org1, role=Role.admin)
    add_user_to_organization(session=db, user=user1, organization=org2, role=Role.admin)
    user2 = create_user(session=db, email="user2@example.com", password="secret2")
    add_user_to_organization(session=db, user=user2, organization=org3, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email=user1.email, password="test123"
    )

    # Make a request to the get_organizations route using the client fixture and superuser_token_headers
    response = client.get(
        f"{settings.API_V1_STR}/organizations/",
        headers=user_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 200
    data = response.json()
    organizations = data["data"]
    count = data["count"]
    assert len(organizations) == 2
    assert count == 2
    assert organizations[0]["id"] == org1.id
    assert organizations[1]["id"] == org2.id

    # Get the second org, with the second user, the data shouldn't be mixed
    user2_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="secret2"
    )
    response = client.get(
        f"{settings.API_V1_STR}/organizations/",
        headers=user2_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 200
    data = response.json()
    organizations = data["data"]
    count = data["count"]
    assert len(organizations) == 1
    assert count == 1
    assert organizations[0]["id"] == org3.id


def test_read_organization(client: TestClient, db: Session) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org2@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org2@fastapi.com", password="test123"
    )

    response = client.get(
        f"{settings.API_V1_STR}/organizations/{organization.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data: dict[str, Any] = response.json()

    assert data["id"]
    assert data["name"]
    assert data["description"]
    assert data["user_links"]
    assert len(data["user_links"]) == 1
    for item in data["user_links"]:
        assert "role" in item
        assert item["user"]["id"]
        assert item["user"]["email"]
        assert "full_name" in item["user"]


def test_read_organization_not_found(client: TestClient) -> None:
    user_auth_headers = user_authentication_headers(
        client=client,
        email=settings.FIRST_SUPERUSER,
        password=settings.FIRST_SUPERUSER_PASSWORD,
    )

    response = client.get(
        f"{settings.API_V1_STR}/organizations/99999",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Organization not found for the current user"


def test_create_organization(client: TestClient) -> None:
    user_auth_headers = user_authentication_headers(
        client=client,
        email=settings.FIRST_SUPERUSER,
        password=settings.FIRST_SUPERUSER_PASSWORD,
    )

    organization_in = {"name": "test", "description": "test description"}
    response = client.post(
        f"{settings.API_V1_STR}/organizations/",
        headers=user_auth_headers,
        json=organization_in,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"]
    assert data["name"] == organization_in["name"]
    assert data["description"] == organization_in["description"]


def test_update_organization(client: TestClient, db: Session) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org3@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org3@fastapi.com", password="test123"
    )

    organization_in = {
        "name": "test updated",
        "description": "test description updated",
    }
    response = client.put(
        f"{settings.API_V1_STR}/organizations/{organization.id}",
        headers=user_auth_headers,
        json=organization_in,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == organization.id
    assert data["name"] == organization_in["name"]
    assert data["description"] == organization_in["description"]


def test_update_organization_not_found(client: TestClient) -> None:
    user_auth_headers = user_authentication_headers(
        client=client,
        email=settings.FIRST_SUPERUSER,
        password=settings.FIRST_SUPERUSER_PASSWORD,
    )

    organization_in = {
        "name": "test updated",
        "description": "test description updated",
    }
    response = client.put(
        f"{settings.API_V1_STR}/organizations/99999",
        headers=user_auth_headers,
        json=organization_in,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Organization not found for the current user"


def test_update_organization_not_enough_permissions(
    client: TestClient, db: Session
) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org4@fastapi.com", password="test123")
    user_member = create_user(session=db, email="org5@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )
    add_user_to_organization(
        session=db, user=user_member, organization=organization, role=Role.member
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org5@fastapi.com", password="test123"
    )

    organization_in = {
        "name": "test updated",
        "description": "test description updated",
    }
    response = client.put(
        f"{settings.API_V1_STR}/organizations/{organization.id}",
        headers=user_auth_headers,
        json=organization_in,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not enough permissions to execute this action"


def test_delete_organization(client: TestClient, db: Session) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org6@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org6@fastapi.com", password="test123"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/organizations/{organization.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Organization deleted"


def test_delete_organization_not_found(client: TestClient) -> None:
    user_auth_headers = user_authentication_headers(
        client=client,
        email=settings.FIRST_SUPERUSER,
        password=settings.FIRST_SUPERUSER_PASSWORD,
    )

    response = client.delete(
        f"{settings.API_V1_STR}/organizations/99999",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Organization not found for the current user"


def test_delete_organization_not_enough_permissions(
    client: TestClient, db: Session
) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org7@fastapi.com", password="test123")
    user_member = create_user(session=db, email="org8@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )
    add_user_to_organization(
        session=db, user=user_member, organization=organization, role=Role.member
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org8@fastapi.com", password="test123"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/organizations/{organization.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not enough permissions to execute this action"


def test_add_member_to_organization(client: TestClient, db: Session) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org9@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org9@fastapi.com", password="test123"
    )

    user_member = create_user(session=db, email="org10@fastapi.com", password="test123")

    response = client.post(
        f"{settings.API_V1_STR}/organizations/{organization.id}/users",
        headers=user_auth_headers,
        json={"user_id": user_member.id, "role": "member"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["user"]["id"] == user_member.id
    assert data["role"] == "member"
    assert data["organization"]["id"] == organization.id


def test_add_member_to_organization_not_enough_permissions(
    client: TestClient, db: Session
) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org11@fastapi.com", password="test123")
    user_member = create_user(session=db, email="org12@fastapi.com", password="test123")
    user_to_add = create_user(session=db, email="org13@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )
    add_user_to_organization(
        session=db, user=user_member, organization=organization, role=Role.member
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org12@fastapi.com", password="test123"
    )

    response = client.post(
        f"{settings.API_V1_STR}/organizations/{organization.id}/users",
        headers=user_auth_headers,
        json={"user_id": user_to_add.id, "role": "member"},
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not enough permissions to execute this action"


def test_add_member_to_organization_user_not_found(
    client: TestClient, db: Session
) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org14@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org14@fastapi.com", password="test123"
    )

    response = client.post(
        f"{settings.API_V1_STR}/organizations/{organization.id}/users",
        headers=user_auth_headers,
        json={"user_id": 99999, "role": "member"},
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "User not found"


def test_add_member_to_organization_organization_not_found(
    client: TestClient, db: Session
) -> None:
    user = create_user(session=db, email="org15@fastapi.com", password="test123")
    user_auth_headers = user_authentication_headers(
        client=client, email="org15@fastapi.com", password="test123"
    )

    response = client.post(
        f"{settings.API_V1_STR}/organizations/999/users",
        headers=user_auth_headers,
        json={"user_id": user.id, "role": "member"},
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Organization not found for the current user"


def test_add_member_to_organization_user_already_in_organization(
    client: TestClient, db: Session
) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org16@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org16@fastapi.com", password="test123"
    )

    response = client.post(
        f"{settings.API_V1_STR}/organizations/{organization.id}/users",
        headers=user_auth_headers,
        json={"user_id": user.id, "role": "member"},
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "User already in organization"


def test_update_member_in_organization(client: TestClient, db: Session) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org17@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org17@fastapi.com", password="test123"
    )

    response = client.put(
        f"{settings.API_V1_STR}/organizations/{organization.id}/users/{user.id}",
        headers=user_auth_headers,
        json={"role": "member"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "member"
    assert data["organization"]["id"] == organization.id
    assert data["user"]["id"] == user.id


def test_update_member_in_organization_not_enough_permissions(
    client: TestClient, db: Session
) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org18@fastapi.com", password="test123")
    user_member = create_user(session=db, email="org19@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user_member, organization=organization, role=Role.member
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org19@fastapi.com", password="test123"
    )

    response = client.put(
        f"{settings.API_V1_STR}/organizations/{organization.id}/users/{user.id}",
        headers=user_auth_headers,
        json={"role": "admin"},
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not enough permissions to execute this action"


def test_update_member_in_organization_user_not_in_organization(
    client: TestClient, db: Session
) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org20@fastapi.com", password="test123")
    user_to_update = create_user(
        session=db, email="org21@fastapi.com", password="test123"
    )
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org20@fastapi.com", password="test123"
    )

    response = client.put(
        f"{settings.API_V1_STR}/organizations/{organization.id}/users/{user_to_update.id}",
        headers=user_auth_headers,
        json={"role": "admin"},
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "User not in organization"


def test_update_member_in_organization_not_found(
    client: TestClient, db: Session
) -> None:
    user = create_user(session=db, email="org22@fastapi.com", password="test123")
    user_auth_headers = user_authentication_headers(
        client=client, email="org22@fastapi.com", password="test123"
    )

    response = client.put(
        f"{settings.API_V1_STR}/organizations/999/users/{user.id}",
        headers=user_auth_headers,
        json={"role": "admin"},
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Organization not found for the current user"


def test_remove_member_from_organization(client: TestClient, db: Session) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org23@fastapi.com", password="test123")
    user_member = create_user(session=db, email="org24@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )
    add_user_to_organization(
        session=db, user=user_member, organization=organization, role=Role.member
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org23@fastapi.com", password="test123"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/organizations/{organization.id}/users/{user_member.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User removed from organization"


def test_remove_member_from_organization_not_enough_permissions(
    client: TestClient, db: Session
) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org25@fastapi.com", password="test123")
    user_member = create_user(session=db, email="org26@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )
    add_user_to_organization(
        session=db, user=user_member, organization=organization, role=Role.member
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org26@fastapi.com", password="test123"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/organizations/{organization.id}/users/{user.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not enough permissions to execute this action"


def test_remove_member_from_organization_not_found(
    client: TestClient, db: Session
) -> None:
    create_user(session=db, email="org27@fastapi.com", password="test123")
    user_auth_headers = user_authentication_headers(
        client=client, email="org27@fastapi.com", password="test123"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/organizations/999/users/9999",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Organization not found for the current user"


def test_remove_member_from_organization_user_not_found(
    client: TestClient, db: Session
) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org28@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org28@fastapi.com", password="test123"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/organizations/{organization.id}/users/9999",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "User not found in organization"


def test_remove_from_organization_not_allow_yourself(
    client: TestClient, db: Session
) -> None:
    organization = create_random_organization(db)
    user = create_user(session=db, email="org29@fastapi.com", password="test123")
    add_user_to_organization(
        session=db, user=user, organization=organization, role=Role.admin
    )

    user_auth_headers = user_authentication_headers(
        client=client, email="org29@fastapi.com", password="test123"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/organizations/{organization.id}/users/{user.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "You cannot remove yourself from the organization"
