from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.api.utils.teams import generate_app_slug_name
from app.crud import get_user_team_link_by_user_id_and_team_slug
from app.models import (
    App,
    AppCreate,
    AppPublic,
)

router = APIRouter()


@router.post("/", response_model=AppPublic)
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
