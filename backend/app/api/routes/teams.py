from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.crud import add_user_to_team
from app.models import (
    Message,
    Role,
    Team,
    TeamCreate,
    TeamCreateMember,
    TeamPublic,
    TeamsPublic,
    TeamUpdate,
    TeamUpdateMember,
    TeamWithUserPublic,
    User,
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


@router.get("/{team_id}", response_model=TeamWithUserPublic)
def read_team(session: SessionDep, current_user: CurrentUser, team_id: int) -> Any:
    """
    Retrieve an team by its ID and returns it along with its associated users.
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


@router.post("/", response_model=TeamPublic)
def create_team(
    session: SessionDep, current_user: CurrentUser, team_in: TeamCreate
) -> Any:
    """
    Create a new team with the provided details.
    """
    team = Team.model_validate(team_in)
    user_team = UserTeamLink(user=current_user, team=team, role=Role.admin)
    session.add(user_team)
    session.commit()
    session.refresh(team)
    return team


@router.put("/{team_id}", response_model=TeamPublic)
def update_team(
    session: SessionDep,
    current_user: CurrentUser,
    team_id: int,
    team_in: TeamUpdate,
) -> Any:
    """
    Update an team by its ID.
    """
    query = (
        select(UserTeamLink)
        .options(selectinload(UserTeamLink.team))  # type: ignore
        .where(
            UserTeamLink.team_id == team_id,
            UserTeamLink.user == current_user,
        )
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
    org = link.team
    org.sqlmodel_update(update_dict)
    session.add(org)
    session.commit()
    session.refresh(org)
    return org


@router.delete("/{team_id}", response_model=Message)
def delete_team(
    session: SessionDep, current_user: CurrentUser, team_id: int
) -> Message:
    """
    Delete an team from the database.
    """
    query = (
        select(UserTeamLink)
        .options(selectinload(UserTeamLink.team))  # type: ignore
        .where(
            UserTeamLink.team_id == team_id,
            UserTeamLink.user == current_user,
        )
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

    for link in team.user_links:  # remove all links to this team
        session.delete(link)
    session.delete(team)
    session.commit()
    return Message(message="Team deleted")


@router.post("/{team_id}/users/", response_model=UserTeamLinkPublic)
def add_member_to_team(
    session: SessionDep,
    current_user: CurrentUser,
    team_id: int,
    member_in: TeamCreateMember,
) -> Any:
    """
    Add a user to an team.
    """
    query = (
        select(UserTeamLink)
        .options(
            selectinload(UserTeamLink.team).selectinload(  # type: ignore
                Team.user_links  # type: ignore
            )
        )
        .where(
            UserTeamLink.team_id == team_id,
            UserTeamLink.user == current_user,
        )
    )
    user_org_link = session.exec(query).first()
    if not user_org_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    if user_org_link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )
    team = user_org_link.team

    if member_in.user_id in {link.user_id for link in team.user_links}:
        raise HTTPException(status_code=400, detail="User already in team")

    user = session.get(User, member_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_team = add_user_to_team(
        session=session, team=team, user=user, role=member_in.role
    )
    return user_team


@router.put("/{team_id}/users/{user_id}", response_model=UserTeamLinkPublic)
def update_member_in_team(
    session: SessionDep,
    current_user: CurrentUser,
    team_id: int,
    user_id: int,
    member_in: TeamUpdateMember,
) -> Any:
    """
    Update a member in an team.
    """
    query = (
        select(UserTeamLink)
        .options(
            selectinload(UserTeamLink.team).selectinload(  # type: ignore
                Team.user_links  # type: ignore
            )
        )
        .where(
            UserTeamLink.team_id == team_id,
            UserTeamLink.user == current_user,
        )
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
    team_id: int,
    user_id: int,
) -> Message:
    """
    Remove a member from an team.
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=400, detail="You cannot remove yourself from the team"
        )

    query = (
        select(UserTeamLink)
        .options(
            selectinload(UserTeamLink.team).selectinload(  # type: ignore
                Team.user_links  # type: ignore
            )
        )
        .where(
            UserTeamLink.team_id == team_id,
            UserTeamLink.user == current_user,
        )
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
