import secrets
from datetime import datetime

from sqlmodel import Session

from app.models import App, Deployment, DeploymentStatus, EnvironmentVariable, Team

from tests.utils.utils import random_lower_string


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
    status: DeploymentStatus = DeploymentStatus.waiting_upload,
) -> Deployment:
    deployment = Deployment(
        app_id=app.id,
        slug=app.slug,
        status=status,
    )
    db.add(deployment)
    db.commit()
    db.refresh(deployment)
    return deployment


def create_environment_variable(
    db: Session, app: App, name: str, value: str
) -> EnvironmentVariable:
    environment_variable = EnvironmentVariable(
        app_id=app.id,
        name=name,
        value=value,
    )
    db.add(environment_variable)
    db.commit()
    db.refresh(environment_variable)
    return environment_variable
