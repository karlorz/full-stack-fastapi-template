import uuid
from datetime import UTC, datetime, timedelta
from unittest.mock import patch

import pytest
import time_machine
from sqlmodel import Session, select

from app.core.config import CommonSettings
from app.models import App

from tests.utils.team import create_random_team


def test_app_is_not_deletable_if_neither_soft_deleted_nor_cleaned_up() -> None:
    app = App(
        name="Test App",
        slug="test-app",
        team_id=uuid.uuid4(),
        deleted_at=None,
        cleaned_up_at=None,
    )

    assert not app.is_deletable


def test_app_is_not_deletable_if_it_is_not_soft_deleted() -> None:
    app = App(
        name="Test App",
        slug="test-app",
        team_id=uuid.uuid4(),
        deleted_at=None,
        cleaned_up_at=datetime.now(UTC),
    )

    assert not app.is_deletable


@patch.object(CommonSettings.get_settings(), "SOFT_DELETED_APP_RETENTION_DAYS", 30)
def test_app_is_not_deletable_if_it_is_not_cleaned_up() -> None:
    app = App(
        name="Test App",
        slug="test-app",
        team_id=uuid.uuid4(),
        deleted_at=datetime.now(UTC) - timedelta(days=31),
        cleaned_up_at=None,
    )

    assert not app.is_deletable


@pytest.mark.parametrize(
    ("deleted_ago", "is_deletable"),
    [
        (timedelta(days=29, minutes=59, seconds=59), False),
        (timedelta(days=30, seconds=0), False),
        (timedelta(days=30, seconds=1), True),
    ],
)
@time_machine.travel("2025-06-01 12:00:00+00:00", tick=False)
@patch.object(CommonSettings.get_settings(), "SOFT_DELETED_APP_RETENTION_DAYS", 30)
def test_app_is_deletable_only_after_the_retention_period_ends(
    deleted_ago: timedelta, is_deletable: bool
) -> None:
    now = datetime.now(UTC)

    app = App(
        name="Test App",
        slug="test-app",
        team_id=uuid.uuid4(),
        deleted_at=now - deleted_ago,
        cleaned_up_at=now - timedelta(days=29),
    )

    assert app.is_deletable == is_deletable


@time_machine.travel("2025-06-01 12:00:00+00:00", tick=False)
@patch.object(CommonSettings.get_settings(), "SOFT_DELETED_APP_RETENTION_DAYS", 30)
@pytest.mark.xfail(
    reason="SQLModel does not support class hybrid properties yet, it needs also Pydantic black magic"
)
def test_query_deletable_apps_from_database(db: Session) -> None:
    team = create_random_team(db)
    team_id = team.id
    now = datetime.now(UTC)

    # Create various apps with different states
    # 1. Active app (not deletable)
    active_app = App(
        name="Active App",
        slug="active-app",
        team_id=team_id,
        deleted_at=None,
        cleaned_up_at=None,
    )

    # 2. Recently deleted app (not deletable - within retention period)
    recent_deleted_app = App(
        name="Recent Deleted",
        slug="recent-deleted",
        team_id=team_id,
        deleted_at=now - timedelta(days=20),
        cleaned_up_at=now - timedelta(days=15),
    )

    # 3. Deleted but not cleaned up (not deletable)
    not_cleaned_app = App(
        name="Not Cleaned",
        slug="not-cleaned",
        team_id=team_id,
        deleted_at=now - timedelta(days=35),
        cleaned_up_at=None,
    )

    # 4. Cleaned up but not deleted (not deletable)
    only_cleaned_app = App(
        name="Only Cleaned",
        slug="only-cleaned",
        team_id=team_id,
        deleted_at=None,
        cleaned_up_at=now - timedelta(days=20),
    )

    # 5. Deletable app - past retention period
    deletable_app1 = App(
        name="Deletable 1",
        slug="deletable-1",
        team_id=team_id,
        deleted_at=now - timedelta(days=31),
        cleaned_up_at=now - timedelta(days=25),
    )

    # 6. Another deletable app - well past retention
    deletable_app2 = App(
        name="Deletable 2",
        slug="deletable-2",
        team_id=team_id,
        deleted_at=now - timedelta(days=45),
        cleaned_up_at=now - timedelta(days=40),
    )

    # Add all apps to database
    db.add_all(
        [
            active_app,
            recent_deleted_app,
            not_cleaned_app,
            only_cleaned_app,
            deletable_app1,
            deletable_app2,
        ]
    )
    db.commit()

    # Query for deletable apps using the SQL expression
    statement = select(App).where(App.is_deletable)
    deletable_apps = db.exec(statement).all()

    # Verify results
    assert len(deletable_apps) == 2
    deletable_slugs = {app.slug for app in deletable_apps}
    assert deletable_slugs == {"deletable-1", "deletable-2"}

    # Verify the non-deletable apps are not included
    all_apps = db.exec(select(App).where(App.team_id == team_id)).all()
    assert len(all_apps) == 6

    non_deletable_apps = [app for app in all_apps if not app.is_deletable]
    assert len(non_deletable_apps) == 4
    non_deletable_slugs = {app.slug for app in non_deletable_apps}
    assert non_deletable_slugs == {
        "active-app",
        "recent-deleted",
        "not-cleaned",
        "only-cleaned",
    }
