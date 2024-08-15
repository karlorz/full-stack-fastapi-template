import secrets
from datetime import datetime

from sqlmodel import Session

from app.models import App, AppCreate, Team
from app.tests.utils.utils import random_lower_string


def create_random_app(
    db: Session,
    team: Team,
    created_at: datetime = datetime.now(),
) -> App:
    name = random_lower_string()
    app_slug = f"{name}-{secrets.token_hex(4)}"
    app_in = AppCreate(
        name=name,
        team_slug=team.slug,
    )
    app = App(
        name=app_in.name,
        slug=app_slug,
        team_id=team.id,
        created_at=created_at,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app
