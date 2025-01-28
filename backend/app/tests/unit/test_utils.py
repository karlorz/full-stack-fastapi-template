from datetime import datetime
from unittest.mock import Mock, patch

from sqlmodel import Session

from app import crud
from app.core.config import MainSettings
from app.models import TeamSize, UserCreate, WaitingListUser
from app.utils import query_pending_users_to_send_invitation


def test_query_pending_users_to_send_invitation(db: Session) -> None:
    test_settings = MainSettings(  # type: ignore
        SMTP_HOST="smtp.example.com",
        SMTP_USER="admin@example.com",
    )
    mock_send_email = Mock()
    with (
        patch("app.utils.send_email", mock_send_email),
        patch.object(MainSettings, "get_settings", return_value=test_settings),
        patch("app.utils.generate_verification_email", return_value=None),
    ):
        existing_user = crud.create_user(
            session=db,
            user_create=UserCreate(
                email="demo06@fastapilabs.com",
                full_name="John Doe",
                password="totally-legit",
                is_active=True,
            ),
            is_verified=True,
        )
        user = WaitingListUser(
            email="demo01@fastapilabs.com",
            name="John Doe",
            organization="FastAPI Labs",
            allowed_at=datetime.now(),
        )
        user2 = WaitingListUser(
            email="demo02@fastapilabs.com",
            country="France",
            team_size=TeamSize.small.value,
        )
        user3 = WaitingListUser(
            email="demo03@fastapilabs.com",
            allowed_at=datetime.now(),
            invitation_sent_at=datetime.now(),
        )
        user4 = WaitingListUser(
            email="demo04@fastapilabs.com",
            role="developer",
            team_size=TeamSize.myself.value,
        )
        user5 = WaitingListUser(
            email="demo05@fastapilabs.com",
            role="CEO",
            team_size=TeamSize.medium.value,
            country="USA",
            organization="AWS",
            allowed_at=datetime.now(),
        )
        user6 = WaitingListUser(
            email="demo06@fastapilabs.com",
            name="John Doe",
            allowed_at=datetime.now(),
        )
        db.add(user)
        db.add(user2)
        db.add(user3)
        db.add(user4)
        db.add(user5)
        db.add(user6)
        db.add(existing_user)
        db.commit()

        query_pending_users_to_send_invitation(db)

        db.refresh(user)
        db.refresh(user2)
        db.refresh(user3)
        db.refresh(user4)
        db.refresh(user5)
        db.refresh(user6)
        assert user.invitation_sent_at is not None
        assert user2.invitation_sent_at is None
        assert user4.invitation_sent_at is None
        assert user5.invitation_sent_at is not None
        # Assert that send_email was called exactly 2 times avoiding the existing user
        assert mock_send_email.call_count == 2
