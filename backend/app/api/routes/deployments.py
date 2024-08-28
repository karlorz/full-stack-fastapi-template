from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.crud import get_user_team_link_by_user_id_and_team_slug
from app.models import (
    App,
    Deployment,
    DeploymentCreate,
    DeploymentPublic,
    DeploymentStatus,
)

router = APIRouter()


@router.post("/", response_model=DeploymentPublic, status_code=201)
def create_deployment(
    session: SessionDep, current_user: CurrentUser, deployment_in: DeploymentCreate
) -> Any:
    """
    Create a new deployment.
    """

    app = session.exec(select(App).where(App.id == deployment_in.app_id)).first()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    user_team_link = get_user_team_link_by_user_id_and_team_slug(
        session=session, user_id=current_user.id, team_slug=app.team.slug
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    new_deployment = Deployment(
        app_id=app.id, slug=app.slug, status=DeploymentStatus.waiting_upload
    )
    session.add(new_deployment)
    session.commit()
    session.refresh(new_deployment)
    return new_deployment
