import uuid
from typing import Any, Literal

import logfire
from fastapi import APIRouter, BackgroundTasks, HTTPException
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, PosthogDep, PosthogProperties, SessionDep
from app.api.utils.teams import generate_app_slug_name
from app.crud import get_user_team_link
from app.models import App, AppCreate, AppPublic, AppsPublic, Message
from app.nats import (
    JetStreamDep,
    LogsResponse,
    get_jetstream_app_logs_subscribe_subject,
    get_logs,
)

from .environment_variables import router as environment_variables_router

router = APIRouter()
router.include_router(environment_variables_router)


@router.get("/", response_model=AppsPublic)
def read_apps(
    session: SessionDep,
    current_user: CurrentUser,
    team_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    slug: str | None = None,
    order_by: Literal["created_at"] | None = None,
    order: Literal["asc", "desc"] = "desc",
) -> Any:
    """
    Retrieve a list of apps for the provided team.
    """
    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    count_statement = (
        select(func.count())
        .where(App.team_id == user_team_link.team_id)
        .select_from(App)
    )
    statement = (
        select(App)
        .where(App.team_id == user_team_link.team_id)
        .offset(skip)
        .limit(limit)
    )

    if slug:
        statement = statement.where(App.slug == slug)
        count_statement = count_statement.where(App.slug == slug)

    order_key = col(App.created_at) if order_by == "created_at" else None

    if order_key:
        statement = statement.order_by(
            order_key.asc() if order == "asc" else order_key.desc()
        )

    apps = session.exec(statement).all()
    count = session.exec(count_statement).one()

    return AppsPublic(data=apps, count=count)


@router.post("/", response_model=AppPublic, status_code=201)
def create_app(
    session: SessionDep,
    current_user: CurrentUser,
    app_in: AppCreate,
    background_tasks: BackgroundTasks,
    posthog: PosthogDep,
    posthog_properties: PosthogProperties,
) -> Any:
    """
    Create a new app with the provided details.
    """
    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app_in.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )
    team = user_team_link.team
    app_slug = generate_app_slug_name(app_in.name, session)
    app = App.model_validate(app_in, update={"slug": app_slug, "team_id": team.id})
    session.add(app)
    session.commit()
    session.refresh(app)

    background_tasks.add_task(
        posthog.capture,
        current_user.id,
        "app_created",
        properties={
            "app_id": app.id,
            "app_name": app.name,
            **posthog_properties,
        },
    )

    return app


@router.get("/{app_id}", response_model=AppPublic)
def read_app(session: SessionDep, current_user: CurrentUser, app_id: uuid.UUID) -> Any:
    """
    Retrieve the details of the provided app.
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

    return app


@router.get("/{app_id}/logs")
def read_app_logs(
    session: SessionDep,
    current_user: CurrentUser,
    jetstream: JetStreamDep,
    app_id: uuid.UUID,
) -> LogsResponse:
    """
    Fetch last logs for an app.
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

    subscribe_subject = get_jetstream_app_logs_subscribe_subject(
        team_slug=app.team.slug, app_slug=app.slug
    )
    logfire.info(
        "Using jetstream subscribe subject {subscribe_subject}",
        subscribe_subject=subscribe_subject,
    )
    return get_logs(jetstream=jetstream, subject=subscribe_subject)


@router.delete("/{app_id}", response_model=Message)
def delete_app(
    session: SessionDep,
    current_user: CurrentUser,
    app_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    posthog: PosthogDep,
    posthog_properties: PosthogProperties,
) -> Any:
    """
    Delete the provided app.
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

    if user_team_link.role != "admin":
        raise HTTPException(
            status_code=403, detail="You do not have permission to delete this app"
        )

    session.delete(app)
    session.commit()

    background_tasks.add_task(
        posthog.capture,
        current_user.id,
        "app_deleted",
        properties={
            "app_id": app.id,
            "app_name": app.name,
            **posthog_properties,
        },
    )

    return Message(message="App deleted")
