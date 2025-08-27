import uuid
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import selectinload
from sqlmodel import col, func, select

from app.api.deps.auth import CurrentUser, get_current_user
from app.api.deps.db import SessionDep
from app.api.deps.posthog import PosthogDep
from app.api.utils.teams import generate_team_slug_name
from app.crud import get_user_team_link
from app.models import (
    Message,
    Role,
    Team,
    TeamCreate,
    TeamPublic,
    TeamsPublic,
    TeamUpdate,
    TeamUpdateMember,
    TeamWithUserPublic,
    UserTeamLink,
    UserTeamLinkPublic,
)

router = APIRouter()


@router.get("/", response_model=TeamsPublic)
def read_teams(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    order: Literal["asc", "desc"] = "desc",
    owner: bool = False,
    slug: str | None = None,
) -> Any:
    """
    Retrieve a list of teams accessible to the current user.
    """
    count_statement = select(func.count()).select_from(Team)
    statement = select(Team).offset(skip).limit(limit)

    if owner:
        count_statement = count_statement.where(Team.owner_id == current_user.id)
        statement = statement.where(Team.owner_id == current_user.id)
    else:
        count_statement = count_statement.where(
            col(Team.user_links).any(col(UserTeamLink.user) == current_user)
        )
        statement = statement.where(
            col(Team.user_links).any(col(UserTeamLink.user) == current_user)
        )

    if slug:
        count_statement = count_statement.where(Team.slug == slug)
        statement = statement.where(Team.slug == slug)

    order_key = col(Team.created_at)

    statement = statement.order_by(
        order_key.asc() if order == "asc" else order_key.desc()
    )

    count = session.exec(count_statement).one()
    teams = session.exec(statement).all()

    return TeamsPublic(data=teams, count=count)


@router.get("/{team_id}", response_model=TeamWithUserPublic)
def read_team(
    session: SessionDep, current_user: CurrentUser, team_id: uuid.UUID
) -> Any:
    """
    Retrieve a team by its name and returns it along with its associated users.
    """
    query = select(Team).options(
        selectinload(Team.user_links).selectinload(UserTeamLink.user)  # type: ignore
    )
    query = query.where(
        Team.id == team_id,
        col(Team.user_links).any(col(UserTeamLink.user) == current_user),
    )
    team = session.exec(query).first()
    if not team:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    return team


def is_team_creation_allowed(posthog: PosthogDep, user_id: uuid.UUID) -> bool | None:
    return posthog.feature_enabled("team-creation-enabled", str(user_id))  # type: ignore


@router.post("/", response_model=TeamPublic)
def create_team(
    session: SessionDep,
    current_user: CurrentUser,
    team_in: TeamCreate,
    posthog: PosthogDep,
) -> Any:
    """
    Create a new team with the provided details.
    """

    # Block creation if 'team-creation-enabled' flag is not enabled
    if not is_team_creation_allowed(posthog, current_user.id):
        posthog.capture(
            "team_creation_blocked",
            distinct_id=current_user.id,
            properties={
                "reason": "team-creation-enabled flag not active",
            },
        )
        raise HTTPException(
            status_code=403,
            detail="Team creation is currently disabled for this user.",
        )

    team_slug = generate_team_slug_name(team_in.name, session)

    team = Team.model_validate(
        team_in, update={"slug": team_slug, "owner_id": current_user.id}
    )
    user_team = UserTeamLink(user=current_user, team=team, role=Role.admin)
    session.add(user_team)
    session.commit()
    session.refresh(team)
    return team


@router.put("/{team_id}", response_model=TeamPublic)
def update_team(
    session: SessionDep,
    current_user: CurrentUser,
    team_id: uuid.UUID,
    team_in: TeamUpdate,
) -> Any:
    """
    Update an team by its name.
    """
    query = (
        select(UserTeamLink)
        .join(Team, col(Team.id) == UserTeamLink.team_id)
        .where(Team.id == team_id, UserTeamLink.user_id == current_user.id)
    )
    link = session.exec(query).first()
    if not link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    if link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )
    update_dict = team_in.model_dump(exclude_unset=True)
    team = link.team
    team.sqlmodel_update(update_dict)
    session.add(team)
    session.commit()
    session.refresh(team)
    return team


class TransferTeamOwnership(BaseModel):
    user_id: uuid.UUID


@router.put("/{team_id}/transfer-ownership/", response_model=TeamPublic)
def transfer_team(
    session: SessionDep,
    current_user: CurrentUser,
    team_id: uuid.UUID,
    data: TransferTeamOwnership,
) -> Any:
    """
    Transfer team ownership to another user.
    """
    user_id = data.user_id
    link = get_user_team_link(session=session, user_id=current_user.id, team_id=team_id)
    if not link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    if link.team.owner_id != current_user.id:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )

    new_owner_link = get_user_team_link(
        session=session, user_id=user_id, team_id=team_id
    )
    if not new_owner_link:
        raise HTTPException(status_code=404, detail="User not found in team")
    if new_owner_link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="User must be an admin to transfer ownership"
        )
    link.team.owner_id = user_id

    session.add(link.team)
    session.commit()
    session.refresh(link.team)
    return link.team


@router.delete("/{team_id}", response_model=Message)
def delete_team(
    session: SessionDep, current_user: CurrentUser, team_id: uuid.UUID
) -> Message:
    """
    Delete a team from the database by its name.
    """
    query = (
        select(UserTeamLink)
        .join(Team, col(Team.id) == UserTeamLink.team_id)
        .where(Team.id == team_id, UserTeamLink.user_id == current_user.id)
    )
    link = session.exec(query).first()
    if not link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    if link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )

    team = link.team

    assert current_user.personal_team

    if team.id == current_user.personal_team.id:
        raise HTTPException(
            status_code=400, detail="You cannot delete your personal team"
        )

    for link in team.user_links:  # remove all links to this team
        session.delete(link)
    session.delete(team)
    session.commit()
    return Message(message="Team deleted")


@router.put("/{team_id}/users/{user_id}", response_model=UserTeamLinkPublic)
def update_member_in_team(
    session: SessionDep,
    current_user: CurrentUser,
    team_id: uuid.UUID,
    user_id: uuid.UUID,
    member_in: TeamUpdateMember,
) -> Any:
    """
    Update a member in a team.
    """
    query = (
        select(UserTeamLink)
        .join(Team, col(Team.id) == UserTeamLink.team_id)
        .where(Team.id == team_id, UserTeamLink.user_id == current_user.id)
    )
    link = session.exec(query).first()
    if not link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    if link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )

    member_link_list = [
        member_link
        for member_link in link.team.user_links
        if member_link.user_id == user_id
    ]
    if not member_link_list:
        raise HTTPException(status_code=404, detail="User not in team")
    member_link = member_link_list[0]

    member_link.role = member_in.role
    session.add(member_link)
    session.commit()
    session.refresh(member_link)
    return member_link


@router.delete("/{team_id}/users/{user_id}", response_model=Message)
def remove_member_from_team(
    session: SessionDep,
    current_user: CurrentUser,
    team_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Message:
    """
    Remove a member from a team.
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=400, detail="You cannot remove yourself from the team"
        )

    query = (
        select(UserTeamLink)
        .join(Team, col(Team.id) == UserTeamLink.team_id)
        .where(Team.id == team_id, UserTeamLink.user_id == current_user.id)
    )
    link = session.exec(query).first()
    if not link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    if link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )

    member_link_list = [
        member_link
        for member_link in link.team.user_links
        if member_link.user_id == user_id
    ]
    if not member_link_list:
        raise HTTPException(status_code=404, detail="User not found in team")
    member_link = member_link_list[0]
    session.delete(member_link)
    session.commit()
    return Message(message="User removed from team")


@router.get(
    "/validate-team-name/{team_slug}",
    response_model=Message,
    dependencies=[Depends(get_current_user)],
)
def validate_team_name(session: SessionDep, team_slug: str) -> Any:
    """
    Validate if team name is unique
    """
    team = session.exec(select(Team).where(Team.slug == team_slug)).first()
    if team:
        raise HTTPException(status_code=400, detail="Team name already in use")
    return Message(message="Team name is valid")
