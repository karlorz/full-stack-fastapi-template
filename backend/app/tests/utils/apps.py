import secrets
from datetime import datetime

from sqlmodel import Session

from app.models import App, Deployment, Team
from app.tests.utils.utils import random_lower_string


def create_random_app(
    db: Session,
    team: Team,
    created_at: datetime = datetime.now(),
) -> App:
    name = random_lower_string()
    app_slug = f"{name}-{secrets.token_hex(4)}"
    app = App(
        name=name,
        slug=app_slug,
        team_id=team.id,
        created_at=created_at,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def create_deployment_for_app(
    db: Session,
    app: App,
) -> Deployment:
    deployment = Deployment(
        app_id=app.id,
        slug=app.slug,
    )
    db.add(deployment)
    db.commit()
    db.refresh(deployment)
    return deployment
