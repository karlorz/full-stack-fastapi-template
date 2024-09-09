from typing import Any, Literal

from fastapi import APIRouter, HTTPException
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.api.utils.teams import generate_app_slug_name
from app.crud import get_user_team_link_by_user_id_and_team_slug
from app.models import (
    App,
    AppCreate,
    AppPublic,
    AppsPublic,
    Message,
)

router = APIRouter()


@router.get("/", response_model=AppsPublic)
def read_apps(
    session: SessionDep,
    current_user: CurrentUser,
    team_slug: str,
    skip: int = 0,
    limit: int = 100,
    order_by: Literal["created_at"] | None = None,
    order: Literal["asc", "desc"] = "asc",
) -> Any:
    """
    Retrieve a list of apps for the provided team.
    """
    user_team_link = get_user_team_link_by_user_id_and_team_slug(
        session=session, user_id=current_user.id, team_slug=team_slug
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
    session: SessionDep, current_user: CurrentUser, app_in: AppCreate
) -> Any:
    """
    Create a new app with the provided details.
    """
    user_team_link = get_user_team_link_by_user_id_and_team_slug(
        session=session, user_id=current_user.id, team_slug=app_in.team_slug
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
    return app


@router.get("/{app_slug}", response_model=AppPublic)
def read_app(session: SessionDep, current_user: CurrentUser, app_slug: str) -> Any:
    """
    Retrieve the details of the provided app.
    """
    app = session.exec(select(App).where(App.slug == app_slug)).first()

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

    return app


@router.delete("/{app_slug}", response_model=Message)
def delete_app(session: SessionDep, current_user: CurrentUser, app_slug: str) -> Any:
    """
    Delete the provided app.
    """
    app = session.exec(select(App).where(App.slug == app_slug)).first()

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

    if user_team_link.role != "admin":
        raise HTTPException(
            status_code=403, detail="You do not have permission to delete this app"
        )

    session.delete(app)
    session.commit()
    return Message(message="App deleted")
