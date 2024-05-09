from datetime import timedelta
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.api.utils.invitations import generate_invitation_token
from app.core.config import settings
from app.crud import add_user_to_team
from app.models import Invitation, InvitationCreate, InvitationStatus, Role
from app.tests.crud.invitations import create_invitation
from app.tests.utils.team import create_random_team
from app.tests.utils.user import create_user, user_authentication_headers
from app.utils import get_datetime_utc


# ** GET /invitations/me **
def test_read_invitations_me(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)
    team2 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test1@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test2@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)
    add_user_to_team(session=db, user=user1, team=team2, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member, invited_user_id=user2.id
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )
    invitation_to_create = InvitationCreate(
        team_id=team2.id, email=user2.email, role=Role.member, invited_user_id=user2.id
    )
    invitation2 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="test123"
    )

    # Make a request to the get_invitations_me route using the client fixture and superuser_token_headers
    response = client.get(
        f"{settings.API_V1_STR}/invitations/me",
        headers=user_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 200
    data = response.json()
    invitations = data["data"]
    count = data["count"]
    assert len(invitations) == 2
    assert count == 2
    assert invitations[0]["id"] == invitation1.id
    assert invitations[1]["id"] == invitation2.id
    assert invitations[0]["team_id"] == team1.id
    assert invitations[1]["team_id"] == team2.id
    assert invitations[0]["email"] == user2.email
    assert invitations[1]["email"] == user2.email
    assert invitations[0]["role"] == "member"
    assert invitations[1]["role"] == "member"
    assert invitations[0]["invited_user_id"] == user2.id
    assert invitations[1]["invited_user_id"] == user2.id
    assert invitations[0]["receiver"]["id"] == user2.id
    assert invitations[1]["receiver"]["id"] == user2.id


def test_read_invitations_me_empty(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test111@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test222@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member, invited_user_id=user2.id
    )
    create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user1.email, password="test123"
    )

    # Make a request to the get_invitations_me route using the client fixture and superuser_token_headers
    response = client.get(
        f"{settings.API_V1_STR}/invitations/me",
        headers=user_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 200
    data = response.json()
    invitations = data["data"]
    count = data["count"]
    assert len(invitations) == 0
    assert count == 0


# ** GET /invitations/sent **
def test_read_invitations_sent(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)
    team2 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test3@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test4@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)
    add_user_to_team(session=db, user=user1, team=team2, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member, invited_user_id=user2.id
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )
    invitation_to_create = InvitationCreate(
        team_id=team2.id, email=user2.email, role=Role.member, invited_user_id=user2.id
    )
    invitation2 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user1.email, password="test123"
    )

    # Make a request to the get_invitations_sent route using the client fixture and superuser_token_headers
    response = client.get(
        f"{settings.API_V1_STR}/invitations/sent",
        headers=user_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 200
    data = response.json()
    invitations = data["data"]
    count = data["count"]
    assert len(invitations) == 2
    assert count == 2
    assert invitations[0]["id"] == invitation1.id
    assert invitations[1]["id"] == invitation2.id
    assert invitations[0]["team_id"] == team1.id
    assert invitations[1]["team_id"] == team2.id
    assert invitations[0]["email"] == user2.email
    assert invitations[1]["email"] == user2.email
    assert invitations[0]["role"] == "member"
    assert invitations[1]["role"] == "member"
    assert invitations[0]["invited_user_id"] == user2.id
    assert invitations[1]["invited_user_id"] == user2.id
    assert invitations[0]["sender"]["id"] == user1.id
    assert invitations[1]["sender"]["id"] == user1.id


def test_read_invitations_sent_empty(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test5@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test6@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member, invited_user_id=user2.id
    )
    create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="test123"
    )

    # Make a request to the get_invitations_me route using the client fixture and superuser_token_headers
    response = client.get(
        f"{settings.API_V1_STR}/invitations/sent",
        headers=user_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 200
    data = response.json()
    invitations = data["data"]
    count = data["count"]
    assert len(invitations) == 0
    assert count == 0


def test_read_invitations_team_success(client: TestClient, db: Session) -> None:
    team = create_random_team(db)

    user1 = create_user(session=db, email="test2623@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test2722@example.com", password="test123")
    user3 = create_user(session=db, email="test2833@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team, role=Role.admin)
    add_user_to_team(session=db, user=user2, team=team, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team.id, email=user2.email, role=Role.member, invited_user_id=user2.id
    )
    create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.accepted,
    )

    invitation_to_create = InvitationCreate(
        team_id=team.id, email=user3.email, role=Role.member, invited_user_id=user3.id
    )
    create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user1.email, password="test123"
    )

    response = client.get(
        f"{settings.API_V1_STR}/invitations/team/{team.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    invitations = data["data"]
    count = data["count"]
    assert len(invitations) == 2
    assert count == 2
    assert invitations[0]["id"]
    assert invitations[1]["id"]


def test_read_invitations_team_empty(client: TestClient, db: Session) -> None:
    team = create_random_team(db)
    team2 = create_random_team(db)

    user1 = create_user(session=db, email="test2611@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test2711@example.com", password="test123")
    user3 = create_user(session=db, email="test2811@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team, role=Role.admin)
    add_user_to_team(session=db, user=user2, team=team, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team2.id, email=user3.email, role=Role.member, invited_user_id=user3.id
    )
    create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user2,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user1.email, password="test123"
    )

    response = client.get(
        f"{settings.API_V1_STR}/invitations/team/{team.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    invitations = data["data"]
    count = data["count"]
    assert len(invitations) == 0
    assert count == 0


def test_read_invitations_team_not_enough_permissions(
    client: TestClient, db: Session
) -> None:
    team = create_random_team(db)
    user = create_user(session=db, email="test26345@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test27454@example.com", password="test123")

    add_user_to_team(session=db, user=user, team=team, role=Role.member)
    add_user_to_team(session=db, user=user2, team=team, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team.id, email=user.email, role=Role.member, invited_user_id=user.id
    )
    create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user2,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user.email, password="test123"
    )

    response = client.get(
        f"{settings.API_V1_STR}/invitations/team/{team.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not enough permissions to execute this action"


def test_read_invitations_team_not_found_current_user(
    client: TestClient, db: Session
) -> None:
    team = create_random_team(db)
    user = create_user(session=db, email="test26452@fastapi.com", password="test123")

    user_auth_headers = user_authentication_headers(
        client=client, email=user.email, password="test123"
    )

    response = client.get(
        f"{settings.API_V1_STR}/invitations/team/{team.id}",
        headers=user_auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Team not found for the current user"


# ** POST /invitations **
def test_create_invitation_success(client: TestClient, db: Session) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        team1 = create_random_team(db)
        user1 = create_user(session=db, email="test27@fastapi.com", password="test123")
        user2 = create_user(session=db, email="test28@example.com", password="test123")
        add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

        user_auth_headers = user_authentication_headers(
            client=client, email=user1.email, password="test123"
        )

        payload = {
            "team_id": team1.id,
            "email": user2.email,
            "role": "member",
        }

        response = client.post(
            f"{settings.API_V1_STR}/invitations/",
            headers=user_auth_headers,
            json=payload,
        )

        # Assert the response and the expected behavior
        assert response.status_code == 200
        data = response.json()
        assert data["team_id"] == team1.id
        assert data["email"] == user2.email
        assert data["role"] == "member"
        assert data["sender"]["id"] == user1.id


def test_create_invitation_team_not_found_current_user(
    client: TestClient, db: Session
) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        team1 = create_random_team(db)
        user1 = create_user(session=db, email="test29@fastapi.com", password="test123")
        user2 = create_user(session=db, email="test30@example.com", password="test123")
        add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

        user_auth_headers = user_authentication_headers(
            client=client, email=user1.email, password="test123"
        )

        payload = {
            "team_id": team1.id + 1,  # type: ignore
            "invited_user_id": user2.id,
            "role": "member",
        }

        response = client.post(
            f"{settings.API_V1_STR}/invitations/",
            headers=user_auth_headers,
            json=payload,
        )

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Team not found for the current user"


def test_create_invitation_not_enough_permissions(
    client: TestClient, db: Session
) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        team1 = create_random_team(db)
        user1 = create_user(session=db, email="test31@fastapi.com", password="test123")
        user2 = create_user(session=db, email="test32@example.com", password="test123")
        add_user_to_team(session=db, user=user1, team=team1, role=Role.member)

        user_auth_headers = user_authentication_headers(
            client=client, email=user1.email, password="test123"
        )

        payload = {
            "team_id": team1.id,
            "email": user2.email,
            "role": "member",
        }

        response = client.post(
            f"{settings.API_V1_STR}/invitations/",
            headers=user_auth_headers,
            json=payload,
        )

        assert response.status_code == 400
        data = response.json()
        assert data["detail"] == "Not enough permissions to execute this action"


def test_create_invitation_already_exists(client: TestClient, db: Session) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        team1 = create_random_team(db)
        user1 = create_user(session=db, email="test33@fastapi.com", password="test123")
        user2 = create_user(session=db, email="test34@example.com", password="test123")
        add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

        user_auth_headers = user_authentication_headers(
            client=client, email=user1.email, password="test123"
        )

        invitation_to_create = InvitationCreate(
            team_id=team1.id,
            email=user2.email,
            role=Role.member,
            invited_user_id=user2.id,
        )
        create_invitation(
            session=db,
            invitation_in=invitation_to_create,
            invited_by=user1,
            invitation_status=InvitationStatus.pending,
        )

        payload = {
            "team_id": team1.id,
            "email": user2.email,
            "role": "member",
        }

        response = client.post(
            f"{settings.API_V1_STR}/invitations/",
            headers=user_auth_headers,
            json=payload,
        )

        assert response.status_code == 400
        data = response.json()
        assert data["detail"] == "Invitation already exists for this user"


def test_create_invitation_user_already_in_team(
    client: TestClient, db: Session
) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        team1 = create_random_team(db)
        user1 = create_user(session=db, email="test35@fastapi.com", password="test123")
        user2 = create_user(session=db, email="test36@example.com", password="test123")
        add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)
        add_user_to_team(session=db, user=user2, team=team1, role=Role.member)

        user_auth_headers = user_authentication_headers(
            client=client, email=user1.email, password="test123"
        )

        invitation_to_create = InvitationCreate(
            team_id=team1.id,
            email=user2.email,
            role=Role.member,
            invited_user_id=user2.id,
        )
        create_invitation(
            session=db,
            invitation_in=invitation_to_create,
            invited_by=user1,
            invitation_status=InvitationStatus.accepted,
        )

        payload = {
            "team_id": team1.id,
            "email": user2.email,
            "role": "member",
        }

        response = client.post(
            f"{settings.API_V1_STR}/invitations/",
            headers=user_auth_headers,
            json=payload,
        )

        assert response.status_code == 400
        data = response.json()
        assert data["detail"] == "The user is already in the team"


def test_create_invitation_user_to_invite_not_found(
    client: TestClient, db: Session
) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        team1 = create_random_team(db)
        user1 = create_user(
            session=db, email="test3734@fastapi.com", password="test123"
        )
        add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

        user_auth_headers = user_authentication_headers(
            client=client, email=user1.email, password="test123"
        )

        payload = {
            "team_id": team1.id,
            "email": "not-found@fastapi.com",
            "role": "member",
        }

        response = client.post(
            f"{settings.API_V1_STR}/invitations/",
            headers=user_auth_headers,
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["team_id"] == team1.id
        assert data["email"] == "not-found@fastapi.com"
        assert data["role"] == "member"
        assert data["sender"]["id"] == user1.id


def test_create_invitation_user_not_found_nor_email_error(
    client: TestClient, db: Session
) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        team1 = create_random_team(db)
        user1 = create_user(
            session=db, email="test373435gf@fastapi.com", password="test123"
        )
        add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

        user_auth_headers = user_authentication_headers(
            client=client, email=user1.email, password="test123"
        )

        payload = {
            "team_id": team1.id,
            "role": "member",
            "invited_user_id": "99999",
        }

        response = client.post(
            f"{settings.API_V1_STR}/invitations/",
            headers=user_auth_headers,
            json=payload,
        )

        assert response.status_code == 400
        data = response.json()
        assert (
            data["detail"]
            == "The invitation must have an email to be sent to a user that does not exist in our platform"
        )


def test_create_invitation_user_already_in_team_without_invitation(
    client: TestClient, db: Session
) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        team1 = create_random_team(db)
        user1 = create_user(session=db, email="test335@fastapi.com", password="test123")
        user2 = create_user(session=db, email="test336@example.com", password="test123")
        add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)
        add_user_to_team(session=db, user=user2, team=team1, role=Role.member)

        user_auth_headers = user_authentication_headers(
            client=client, email=user1.email, password="test123"
        )

        payload = {
            "team_id": team1.id,
            "email": user2.email,
            "role": "member",
        }

        response = client.post(
            f"{settings.API_V1_STR}/invitations/",
            headers=user_auth_headers,
            json=payload,
        )

        assert response.status_code == 400
        data = response.json()
        assert data["detail"] == "The user is already in the team"


def test_create_invitation_invited_user_id_or_email_required(
    client: TestClient, db: Session
) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        team1 = create_random_team(db)
        user1 = create_user(
            session=db, email="test38345@fastapi.com", password="test123"
        )
        add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

        user_auth_headers = user_authentication_headers(
            client=client, email=user1.email, password="test123"
        )

        payload = {
            "team_id": team1.id,
            "role": "member",
        }

        response = client.post(
            f"{settings.API_V1_STR}/invitations/",
            headers=user_auth_headers,
            json=payload,
        )

        assert response.status_code == 422
        data = response.json()
        assert (
            data["detail"][0]["msg"]
            == "Value error, invited_user_id or email must be provided"
        )


# ** POST /invitations/{inv_id}/accept **
def test_accept_invitation_success(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test7@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test8@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member, invited_user_id=user2.id
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="test123"
    )

    invitation_token = generate_invitation_token(invitation_id=invitation1.id)  # type: ignore

    # Make a request to the get_invitations_me route using the client fixture and superuser_token_headers
    response = client.post(
        f"{settings.API_V1_STR}/invitations/accept",
        headers=user_auth_headers,
        json={"token": invitation_token},
    )

    db.refresh(invitation1)

    # Assert the response and the expected behavior
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == invitation1.id
    assert data["status"] == InvitationStatus.accepted
    assert data["team_id"] == team1.id
    assert data["email"] == user2.email
    assert data["role"] == "member"
    assert data["invited_user_id"] == user2.id
    assert data["sender"]["id"] == user1.id
    # ** db assert
    assert data["status"] == invitation1.status
    assert data["team_id"] == invitation1.team_id
    assert data["email"] == invitation1.email
    assert data["role"] == invitation1.role
    assert data["invited_user_id"] == invitation1.invited_user_id
    assert data["sender"]["id"] == invitation1.invited_by_id


def test_accept_invitation_invalid_token(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test923@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test101@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member, invited_user_id=user2.id
    )
    create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="test123"
    )

    response = client.post(
        f"{settings.API_V1_STR}/invitations/accept",
        headers=user_auth_headers,
        json={"token": "invalid_token"},
    )

    # Assert the response and the expected behavior
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Invalid invitation token"


def test_accept_invitation_not_found(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test9@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test10@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member, invited_user_id=user2.id
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user1.email, password="test123"
    )

    invitation_token = generate_invitation_token(invitation_id=invitation1.id)  # type: ignore

    # Make a request to the get_invitations_me route using the client fixture and superuser_token_headers
    response = client.post(
        f"{settings.API_V1_STR}/invitations/accept",
        headers=user_auth_headers,
        json={"token": invitation_token},
    )

    # Assert the response and the expected behavior
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Invitation not found"


def test_accept_invitation_success_set_user_fk(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test11@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test12@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="test123"
    )

    invitation_token = generate_invitation_token(invitation_id=invitation1.id)  # type: ignore

    # Make a request to the get_invitations_me route using the client fixture and superuser_token_headers
    response = client.post(
        f"{settings.API_V1_STR}/invitations/accept",
        headers=user_auth_headers,
        json={"token": invitation_token},
    )

    db.refresh(invitation1)

    # Assert the response and the expected behavior
    assert response.status_code == 200
    data = response.json()
    assert data["invited_user_id"] == user2.id
    assert data["sender"]["id"] == user1.id
    # ** db assert
    assert data["invited_user_id"] == invitation1.invited_user_id
    assert data["sender"]["id"] == invitation1.invited_by_id


def test_accept_invitation_was_already_used(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test13@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test14@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.accepted,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="test123"
    )

    invitation_token = generate_invitation_token(invitation_id=invitation1.id)  # type: ignore

    # Make a request to the get_invitations_me route using the client fixture and superuser_token_headers
    response = client.post(
        f"{settings.API_V1_STR}/invitations/accept",
        headers=user_auth_headers,
        json={"token": invitation_token},
    )

    # Assert the response and the expected behavior
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Invitation was already accepted"


def test_accept_invitation_user_already_in_team(
    client: TestClient, db: Session
) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test15@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test16@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)
    add_user_to_team(session=db, user=user2, team=team1, role=Role.member)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="test123"
    )

    invitation_token = generate_invitation_token(invitation_id=invitation1.id)  # type: ignore

    response = client.post(
        f"{settings.API_V1_STR}/invitations/accept",
        headers=user_auth_headers,
        json={"token": invitation_token},
    )

    # Assert the response and the expected behavior
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "User already in team"


def test_accept_invitation_expired(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test17etrt@fastapi.com", password="test123")
    user2 = create_user(
        session=db, email="test16weefsd@example.com", password="test123"
    )

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
        expires_at=get_datetime_utc() - timedelta(hours=1),
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="test123"
    )

    invitation_token = generate_invitation_token(invitation_id=invitation1.id)  # type: ignore

    response = client.post(
        f"{settings.API_V1_STR}/invitations/accept",
        headers=user_auth_headers,
        json={"token": invitation_token},
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Invitation expired"


# ** POST /invitations/token/verify **
def test_invitation_token_verify_success(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    user1 = create_user(session=db, email="test174534@fastapi.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email="user@testing.com", role=Role.member
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    invitation_token = generate_invitation_token(invitation_id=invitation1.id)  # type: ignore

    response = client.post(
        f"{settings.API_V1_STR}/invitations/token/verify",
        json={"token": invitation_token},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "user@testing.com"
    assert data["role"] == "member"
    assert data["team_id"] == team1.id
    assert data["invited_by_id"] == user1.id


def test_invitation_token_verify_fail(client: TestClient) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/invitations/token/verify",
        json={"token": "invalid_token"},
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Invalid invitation token"


def test_invitation_token_verify_not_found(client: TestClient, db: Session) -> None:
    team1 = create_random_team(db)

    user1 = create_user(session=db, email="test1534@fastapi.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    invitation_token = generate_invitation_token(invitation_id=9999999)

    response = client.post(
        f"{settings.API_V1_STR}/invitations/token/verify",
        json={"token": invitation_token},
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Invitation not found"


def test_invitation_token_verify_expired(client: TestClient, db: Session) -> None:
    team1 = create_random_team(db)

    user1 = create_user(session=db, email="test1534qwe@fastapi.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email="user@testing.com", role=Role.member
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
        expires_at=get_datetime_utc() - timedelta(hours=1),
    )

    invitation_token = generate_invitation_token(invitation_id=invitation1.id)  # type: ignore

    response = client.post(
        f"{settings.API_V1_STR}/invitations/token/verify",
        json={"token": invitation_token},
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Invitation expired"


# ** DELETE /invitations/{inv_id} **
def test_delete_invitation_success(client: TestClient, db: Session) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test17@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test18@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user1.email, password="test123"
    )

    # Make a request to the get_invitations_me route using the client fixture and superuser_token_headers
    response = client.delete(
        f"{settings.API_V1_STR}/invitations/{invitation1.id}",
        headers=user_auth_headers,
    )

    invitation_deleted = select(Invitation).where(Invitation.id == invitation1.id)
    invitation_db = db.exec(invitation_deleted).one_or_none()

    # Assert the response and the expected behavior
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Invitation deleted"
    # ** db assert
    assert invitation_db is None


def test_delete_invitation_not_found_by_another_user(
    client: TestClient, db: Session
) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test19@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test20@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)

    user_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="test123"
    )

    # Make a request to the get_invitations_me route using the client fixture and superuser_token_headers
    response = client.delete(
        f"{settings.API_V1_STR}/invitations/99999",
        headers=user_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Invitation not found"


def test_delete_invitation_already_used_cannot_be_deleted(
    client: TestClient, db: Session
) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test21@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test22@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)
    add_user_to_team(session=db, user=user2, team=team1, role=Role.member)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.accepted,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user1.email, password="test123"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/invitations/{invitation1.id}",
        headers=user_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Invitation was already accepted and cannot be deleted"


def test_delete_invitation_team_not_found_current_user(
    client: TestClient, db: Session
) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)
    team2 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test23@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test24@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)
    add_user_to_team(session=db, user=user2, team=team2, role=Role.admin)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user2.email, role=Role.member
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="test123"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/invitations/{invitation1.id}",
        headers=user_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Team not found for the current user"


def test_delete_invitation_not_enough_permission(
    client: TestClient, db: Session
) -> None:
    # Create test data in the database using db fixture
    team1 = create_random_team(db)

    # Create a user and link it to the first team
    user1 = create_user(session=db, email="test25@fastapi.com", password="test123")
    user2 = create_user(session=db, email="test26@example.com", password="test123")
    user3 = create_user(session=db, email="test27@example.com", password="test123")

    add_user_to_team(session=db, user=user1, team=team1, role=Role.admin)
    add_user_to_team(session=db, user=user2, team=team1, role=Role.member)

    invitation_to_create = InvitationCreate(
        team_id=team1.id, email=user3.email, role=Role.member
    )
    invitation1 = create_invitation(
        session=db,
        invitation_in=invitation_to_create,
        invited_by=user1,
        invitation_status=InvitationStatus.pending,
    )

    user_auth_headers = user_authentication_headers(
        client=client, email=user2.email, password="test123"
    )

    response = client.delete(
        f"{settings.API_V1_STR}/invitations/{invitation1.id}",
        headers=user_auth_headers,
    )

    # Assert the response and the expected behavior
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Not enough permissions to execute this action"
