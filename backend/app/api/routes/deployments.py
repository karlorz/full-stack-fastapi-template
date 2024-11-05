import uuid
from typing import Any, Literal

import httpx
from fastapi import APIRouter, HTTPException
from sqlalchemy import func
from sqlmodel import and_, col, select

from app.api.deps import CurrentUser, SessionDep
from app.api.utils.aws_s3 import generate_presigned_url_post
from app.core.config import get_common_settings, get_main_settings
from app.crud import get_user_team_link
from app.models import (
    App,
    Deployment,
    DeploymentPublic,
    DeploymentsPublic,
    DeploymentStatus,
    DeploymentUploadOut,
    Message,
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

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
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


@router.get(
    "/apps/{app_id}/deployments/{deployment_id}", response_model=DeploymentPublic
)
def read_deployment(
    session: SessionDep,
    current_user: CurrentUser,
    app_id: uuid.UUID,
    deployment_id: uuid.UUID,
) -> Any:
    """
    Retrieve a list of deployments for the provided app.
    """
    app = session.exec(select(App).where(App.id == app_id)).first()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    statement = select(Deployment).where(
        and_(Deployment.app_id == app_id, Deployment.id == deployment_id)
    )

    deployment = session.exec(statement).first()

    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    return deployment


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
    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
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


@router.post("/deployments/{deployment_id}/upload", response_model=DeploymentUploadOut)
def upload_deployment_artifact(
    session: SessionDep,
    current_user: CurrentUser,
    deployment_id: uuid.UUID,
) -> Any:
    """
    Upload a new deployment artifact.
    """
    deployment = session.exec(
        select(Deployment).where(Deployment.id == deployment_id)
    ).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    app = session.exec(select(App).where(App.id == deployment.app_id)).first()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    object_name = f"{app.id}/{deployment.id}.tar"

    presigned_url = generate_presigned_url_post(
        bucket_name=get_main_settings().AWS_DEPLOYMENT_BUCKET,
        object_name=object_name,
    )
    if not presigned_url:
        raise HTTPException(status_code=500, detail="Error generating presigned URL")

    deployment_url = DeploymentUploadOut(
        url=presigned_url["url"], fields=presigned_url["fields"]
    )

    return deployment_url


@router.post("/deployments/{deployment_id}/redeploy")
def redeploy_deployment(
    session: SessionDep,
    current_user: CurrentUser,
    deployment_id: uuid.UUID,
) -> Any:
    """
    Send to builder to redeploy the deployment.
    """
    deployment = session.exec(
        select(Deployment).where(Deployment.id == deployment_id)
    ).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    app = session.exec(select(App).where(App.id == deployment.app_id)).first()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    response = httpx.post(
        f"{get_main_settings().BUILDER_API_URL}/send/deploy",
        headers={"X-API-KEY": get_common_settings().BUILDER_API_KEY},
        json={"deployment_id": str(deployment_id)},
    )

    if response.status_code != 200:
        try:
            data = response.json()
            detail = data.get("detail", "Unknown error")
        except Exception:
            detail = "Unknown error"
        raise HTTPException(status_code=500, detail=detail)

    return Message(message="OK")
