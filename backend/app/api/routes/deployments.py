import uuid
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, UploadFile
from sqlalchemy import func
from sqlmodel import col, select

from app.api.deps import CurrentUser, SessionDep
from app.crud import get_user_team_link_by_user_id_and_team_slug
from app.models import (
    App,
    Deployment,
    DeploymentPublic,
    DeploymentsPublic,
    DeploymentStatus,
)

router = APIRouter()


@router.get("/apps/{app_id}/deployments/", response_model=DeploymentsPublic)
def read_deployments(
    session: SessionDep,
    current_user: CurrentUser,
    app_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    order_by: Literal["created_at"] | None = None,
    order: Literal["asc", "desc"] = "asc",
) -> Any:
    """
    Retrieve a list of deployments for the provided app.
    """
    app = session.exec(select(App).where(App.id == app_id)).first()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    team_slug = app.team.slug

    user_team_link = get_user_team_link_by_user_id_and_team_slug(
        session=session, user_id=current_user.id, team_slug=team_slug
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    statement = (
        select(Deployment).where(Deployment.app_id == app_id).offset(skip).limit(limit)
    )
    count_statement = (
        select(func.count()).where(Deployment.app_id == app_id).select_from(Deployment)
    )

    order_key = col(Deployment.created_at) if order_by == "created_at" else None

    if order_key:
        statement = statement.order_by(
            order_key.asc() if order == "asc" else order_key.desc()
        )

    deployments = session.exec(statement).all()
    count = session.exec(count_statement).one()

    return DeploymentsPublic(data=deployments, count=count)


@router.post(
    "/apps/{app_id}/deployments/", response_model=DeploymentPublic, status_code=201
)
def create_deployment(
    session: SessionDep, app_id: uuid.UUID, current_user: CurrentUser
) -> Any:
    """
    Create a new deployment.
    """

    app = session.exec(select(App).where(App.id == app_id)).first()
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


@router.post("/deployments/{deployment_id}/upload")
def upload_deployment_artifact(
    deployment_id: uuid.UUID,  # noqa F841
    upload_file: UploadFile,
) -> Any:
    """
    Upload a new deployment artifact.
    """
    return {"filename": upload_file.filename}
