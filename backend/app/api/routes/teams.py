import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep, get_current_user
from app.api.utils.teams import verify_and_generate_slug_name
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
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve a list of teams accessible to the current user.
    """
    count_statement = (
        select(func.count())
        .select_from(Team)
        .where(col(Team.user_links).any(col(UserTeamLink.user) == current_user))
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Team)
        .where(col(Team.user_links).any(col(UserTeamLink.user) == current_user))
        .offset(skip)
        .limit(limit)
    )
    teams = session.exec(statement).all()

    return TeamsPublic(data=teams, count=count)


@router.get("/{team_slug}", response_model=TeamWithUserPublic)
def read_team(session: SessionDep, current_user: CurrentUser, team_slug: str) -> Any:
    """
    Retrieve a team by its name and returns it along with its associated users.
    """
    query = select(Team).options(
        selectinload(Team.user_links).selectinload(UserTeamLink.user)  # type: ignore
    )
    query = query.where(
        Team.slug == team_slug,
        col(Team.user_links).any(col(UserTeamLink.user) == current_user),
    )
    team = session.exec(query).first()
    if not team:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    return team


@router.post("/", response_model=TeamPublic)
def create_team(
    session: SessionDep, current_user: CurrentUser, team_in: TeamCreate
) -> Any:
    """
    Create a new team with the provided details.
    """
    team_slug = verify_and_generate_slug_name(team_in.name, session)

    team = Team.model_validate(team_in, update={"slug": team_slug})
    user_team = UserTeamLink(user=current_user, team=team, role=Role.admin)
    session.add(user_team)
    session.commit()
    session.refresh(team)
    return team


@router.put("/{team_slug}", response_model=TeamPublic)
def update_team(
    session: SessionDep,
    current_user: CurrentUser,
    team_slug: str,
    team_in: TeamUpdate,
) -> Any:
    """
    Update an team by its name.
    """
    query = (
        select(UserTeamLink)
        .join(Team, col(Team.id) == UserTeamLink.team_id)
        .where(Team.slug == team_slug, UserTeamLink.user_id == current_user.id)
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


@router.delete("/{team_slug}", response_model=Message)
def delete_team(
    session: SessionDep, current_user: CurrentUser, team_slug: str
) -> Message:
    """
    Delete a team from the database by its name.
    """
    query = (
        select(UserTeamLink)
        .join(Team, col(Team.id) == UserTeamLink.team_id)
        .where(Team.slug == team_slug, UserTeamLink.user_id == current_user.id)
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

    if team.id == current_user.personal_team_id:
        raise HTTPException(
            status_code=400, detail="You cannot delete your personal team"
        )

    for link in team.user_links:  # remove all links to this team
        session.delete(link)
    session.delete(team)
    session.commit()
    return Message(message="Team deleted")


@router.put("/{team_slug}/users/{user_id}", response_model=UserTeamLinkPublic)
def update_member_in_team(
    session: SessionDep,
    current_user: CurrentUser,
    team_slug: str,
    user_id: uuid.UUID,
    member_in: TeamUpdateMember,
) -> Any:
    """
    Update a member in a team.
    """
    query = (
        select(UserTeamLink)
        .join(Team, col(Team.id) == UserTeamLink.team_id)
        .where(Team.slug == team_slug, UserTeamLink.user_id == current_user.id)
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


@router.delete("/{team_slug}/users/{user_id}", response_model=Message)
def remove_member_from_team(
    session: SessionDep,
    current_user: CurrentUser,
    team_slug: str,
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
        .where(Team.slug == team_slug, UserTeamLink.user_id == current_user.id)
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
