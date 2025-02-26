import uuid
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.api.deps import SessionDep
from app.core.security import get_password_hash
from app.models import (
    App,
    AppPublic,
    Deployment,
    DeploymentPublic,
    DeploymentStatus,
    EnvironmentVariable,
    Role,
    Team,
    TeamPublic,
    User,
    UserPublic,
    UserTeamLink,
    UserTeamLinkPublic,
)
from app.tests.utils.utils import random_lower_string

router = APIRouter(tags=["private"])


class CreateUser(BaseModel):
    email: str
    password: str
    full_name: str
    is_verified: bool = False


@router.post("/users/", response_model=UserPublic)
def create_user(user_in: CreateUser, session: SessionDep) -> Any:
    """
    Create a new user.
    """

    user = User(
        username=user_in.email,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        is_verified=user_in.is_verified,
    )

    session.add(user)
    session.commit()

    return user


class CreateTeam(BaseModel):
    name: str
    owner_id: uuid.UUID
    is_personal_team: bool = False


@router.post("/teams/", response_model=TeamPublic)
def create_team(team_in: CreateTeam, session: SessionDep) -> Any:
    """
    Create a new team.
    """

    team = Team(
        name=team_in.name,
        slug=random_lower_string(),
        is_personal_team=team_in.is_personal_team,
        owner_id=team_in.owner_id,
    )

    team_user_link = UserTeamLink(
        user_id=team_in.owner_id,
        team=team,
        role=Role.admin,
    )

    session.add(team)
    session.add(team_user_link)
    session.commit()

    return team


class AddUserToTeam(BaseModel):
    user_id: uuid.UUID
    role: Role


@router.post("/teams/{team_id}/add-user", response_model=UserTeamLinkPublic)
def add_user_to_team(
    team_id: uuid.UUID, body: AddUserToTeam, session: SessionDep
) -> Any:
    """
    Add user to team.
    """

    team = session.get(Team, team_id)
    assert team
    user_org_link = UserTeamLink(user_id=body.user_id, team_id=team.id, role=body.role)
    session.add(user_org_link)
    session.commit()
    session.refresh(user_org_link)
    return user_org_link


class CreateApp(BaseModel):
    name: str
    team_id: uuid.UUID


@router.post("/apps/", response_model=AppPublic)
def create_app(app_in: CreateApp, session: SessionDep) -> Any:
    """
    Create a new app.
    """

    app = App(
        name=app_in.name,
        team_id=app_in.team_id,
        slug=random_lower_string(),
    )

    session.add(app)
    session.commit()

    return app


class CreateDeployment(BaseModel):
    app_id: uuid.UUID
    status: DeploymentStatus | None = None


@router.post("/deployments/", response_model=DeploymentPublic)
def create_deployment(deployment_in: CreateDeployment, session: SessionDep) -> Any:
    """
    Create a new deployment.
    """

    deployment = Deployment(
        app_id=deployment_in.app_id,
        slug=random_lower_string(),
        status=deployment_in.status or DeploymentStatus.waiting_upload,
    )

    session.add(deployment)
    session.commit()

    return deployment


class CreateEnvironmentVariable(BaseModel):
    name: str
    value: str
    app_id: uuid.UUID


@router.post("/environment-variables/", response_model=EnvironmentVariable)
def create_environment_variable(
    env_var_in: CreateEnvironmentVariable, session: SessionDep
) -> Any:
    """
    Create a new environment variable.
    """

    env_var = EnvironmentVariable(
        name=env_var_in.name,
        value=env_var_in.value,
        app_id=env_var_in.app_id,
    )

    session.add(env_var)
    session.commit()

    return env_var
