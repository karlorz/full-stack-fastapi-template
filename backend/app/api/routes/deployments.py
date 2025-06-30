import time
import uuid
from collections.abc import AsyncGenerator
from typing import Annotated, Any, Literal

import logfire
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import Field, TypeAdapter, ValidationError
from sqlalchemy import func
from sqlmodel import and_, col, select

from app.api.deps import (
    AsyncRedisDep,
    CurrentUser,
    PosthogDep,
    PosthogProperties,
    SessionDep,
)
from app.api.utils.aws_s3 import generate_presigned_url_post
from app.aws_utils import get_sqs_client
from app.builder.models import BuildLog, BuildLogComplete, BuildLogFailed
from app.core.config import CommonSettings, MainSettings
from app.crud import get_user_team_link
from app.models import (
    App,
    AppStatus,
    BuildMessage,
    Deployment,
    DeploymentPublic,
    DeploymentsPublic,
    DeploymentStatus,
    DeploymentUploadOut,
    Message,
    RedeployMessage,
)
from app.nats import (
    JetStreamDep,
    LogsResponse,
    get_jetstream_deployment_logs_subject,
    get_logs,
)
from app.utils import get_datetime_utc

sqs = get_sqs_client()
router = APIRouter()


@router.get("/apps/{app_id}/deployments/", response_model=DeploymentsPublic)
def read_deployments(
    session: SessionDep,
    current_user: CurrentUser,
    app_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    order: Literal["asc", "desc"] = "desc",
) -> Any:
    """
    Retrieve a list of deployments for the provided app.
    """
    app = session.exec(
        select(App).where(App.id == app_id).where(App.status == AppStatus.active)
    ).first()
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

    order_key = col(Deployment.created_at)

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
    app = session.exec(
        select(App).where(App.id == app_id).where(App.status == AppStatus.active)
    ).first()
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


@router.get("/deployments/{deployment_id}/logs")
def read_deployment_logs(
    session: SessionDep,
    current_user: CurrentUser,
    jetstream: JetStreamDep,
    deployment_id: uuid.UUID,
) -> LogsResponse:
    """
    Get the logs for a deployment.
    """

    deployment = session.get(Deployment, deployment_id)

    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=deployment.app.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    deployment_subject = get_jetstream_deployment_logs_subject(
        team_slug=deployment.app.team.slug,
        app_slug=deployment.app.slug,
        deployment_id=deployment_id,
    )
    logfire.info(
        "Using jetstream deployment_subject {deployment_subject}",
        deployment_subject=deployment_subject,
    )
    return get_logs(
        jetstream=jetstream,
        subject=deployment_subject,
    )


@router.post(
    "/apps/{app_id}/deployments/", response_model=DeploymentPublic, status_code=201
)
def create_deployment(
    session: SessionDep,
    app_id: uuid.UUID,
    current_user: CurrentUser,
    background_tasks: BackgroundTasks,
    posthog: PosthogDep,
    posthog_properties: PosthogProperties,
) -> Any:
    """
    Create a new deployment.
    """

    app = session.exec(
        select(App).where(App.id == app_id).where(App.status == AppStatus.active)
    ).first()
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

    background_tasks.add_task(
        posthog.capture,
        current_user.id,
        "deployment_created",
        properties={
            "deployment_id": new_deployment.id,
            "app_id": app.id,
            "app_name": app.name,
            **posthog_properties,
        },
    )

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

    app = session.exec(
        select(App)
        .where(App.id == deployment.app_id)
        .where(App.status == AppStatus.active)
    ).first()
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
        bucket_name=CommonSettings.get_settings().DEPLOYMENTS_BUCKET_NAME,
        object_name=object_name,
    )

    deployment_url = DeploymentUploadOut(
        url=presigned_url["url"], fields=presigned_url["fields"]
    )

    return deployment_url


@router.post("/deployments/{deployment_id}/redeploy")
def redeploy(
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

    app = session.exec(
        select(App)
        .where(App.id == deployment.app_id)
        .where(App.status == AppStatus.active)
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    deployment.status = DeploymentStatus.deploying
    deployment.updated_at = get_datetime_utc()
    session.commit()

    message = RedeployMessage(deployment_id=str(deployment.id))

    queue_url = sqs.get_queue_url(
        QueueName=CommonSettings.get_settings().BUILDER_QUEUE_NAME
    )["QueueUrl"]
    sqs.send_message(QueueUrl=queue_url, MessageBody=message.model_dump_json())

    return Message(message="OK")


@router.post("/deployments/{deployment_id}/upload-complete")
def upload_complete(
    session: SessionDep,
    current_user: CurrentUser,
    deployment_id: uuid.UUID,
) -> Any:
    """
    Notify the builder backend that the deployment artifact has been uploaded.
    """
    deployment = session.exec(
        select(Deployment).where(Deployment.id == deployment_id)
    ).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    app = session.exec(
        select(App)
        .where(App.id == deployment.app_id)
        .where(App.status == AppStatus.active)
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    deployment.status = DeploymentStatus.ready_for_build
    session.commit()

    message = BuildMessage(deployment_id=str(deployment.id))
    queue_url = sqs.get_queue_url(
        QueueName=CommonSettings.get_settings().BUILDER_QUEUE_NAME
    )["QueueUrl"]
    sqs.send_message(QueueUrl=queue_url, MessageBody=message.model_dump_json())

    return Message(message="OK")


@router.get("/deployments/{deployment_id}/build-logs")
def get_build_logs(
    session: SessionDep,
    current_user: CurrentUser,
    redis: AsyncRedisDep,
    deployment_id: uuid.UUID,
    request: Request,
) -> Any:
    deployment = session.exec(
        select(Deployment).where(Deployment.id == deployment_id)
    ).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    app = deployment.app

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    timeout_seconds = MainSettings.get_settings().BUILD_LOGS_STREAM_TIMEOUT_SECONDS

    async def _stream_logs(deployment_id: uuid.UUID) -> AsyncGenerator[str, None]:
        redis_key = f"build_logs:{deployment_id}"
        last_id = "0"

        last_valid_message_time = time.monotonic()

        build_log_adapter: TypeAdapter[BuildLog] = TypeAdapter(
            Annotated[BuildLog, Field(discriminator="type")]
        )

        while True:
            if await request.is_disconnected():
                break

            if time.monotonic() - last_valid_message_time > timeout_seconds:
                yield '{"type": "timeout"}\n'
                return

            stream_data = await redis.xread(streams={redis_key: last_id}, block=200)

            if not stream_data:
                continue

            for _, messages in stream_data:
                for message_id, message_data in messages:
                    try:
                        log = build_log_adapter.validate_python(message_data)
                    except ValidationError:
                        logfire.error(
                            "Invalid build log message",
                            message=message_data,
                        )
                        continue

                    last_valid_message_time = time.monotonic()

                    yield log.model_dump_json()
                    yield "\n"

                    match log:
                        case BuildLogComplete() | BuildLogFailed():
                            return

                    last_id = message_id

    return StreamingResponse(
        _stream_logs(deployment_id), media_type="application/x-ndjson"
    )
