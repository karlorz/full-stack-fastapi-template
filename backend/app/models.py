import uuid
from datetime import datetime
from enum import Enum
from typing import Annotated, Any

from pydantic import AfterValidator, EmailStr, computed_field
from sqlalchemy.ext.hybrid import hybrid_property
from sqlmodel import Field, Relationship, SQLModel

from app.core.config import settings
from app.utils import get_datetime_utc


class Role(str, Enum):
    member = "member"
    admin = "admin"


class InvitationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"


class UserTeamLink(SQLModel, table=True):
    user_id: uuid.UUID = Field(
        foreign_key="user.id", primary_key=True, ondelete="CASCADE"
    )
    team_id: uuid.UUID = Field(
        foreign_key="team.id", primary_key=True, ondelete="CASCADE"
    )
    role: Role = Field()

    user: "User" = Relationship(back_populates="team_links")
    team: "Team" = Relationship(back_populates="user_links")


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    full_name: str = Field(max_length=255, min_length=3)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str = Field(max_length=255, min_length=3)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255, min_length=3)  # type: ignore


class UserUpdateEmailMe(SQLModel):
    email: EmailStr = Field(max_length=255)


class UserUpdateMe(SQLModel):
    full_name: str = Field(max_length=255, min_length=3)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    username: str = Field(unique=True, index=True, max_length=255)
    is_verified: bool = False

    owned_teams: list["Team"] = Relationship(back_populates="owner")

    team_links: list[UserTeamLink] = Relationship(
        back_populates="user", cascade_delete=True
    )
    invitations_sent: list["Invitation"] = Relationship(
        back_populates="sender",
        sa_relationship_kwargs={"foreign_keys": "[Invitation.invited_by_id]"},
        cascade_delete=True,
    )

    @computed_field
    @hybrid_property
    def personal_team(self) -> "Team | None":
        return next((team for team in self.owned_teams if team.is_personal_team), None)


# Used for the current user
class UserMePublic(UserBase):
    id: uuid.UUID
    personal_team_slug: str


class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


class UserLinkPublic(SQLModel):
    role: Role
    user: UserPublic


class UsersLinksPublic(SQLModel):
    data: list[UserLinkPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


class EmailVerificationToken(SQLModel):
    token: str


class TeamBase(SQLModel):
    name: str = Field(max_length=255, min_length=3)
    description: str | None = Field(default=None, max_length=255)


class Team(TeamBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    slug: str = Field(unique=True, index=True, max_length=255)

    owner_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
    owner: User = Relationship(back_populates="owned_teams")
    is_personal_team: bool = False
    created_at: datetime = Field(default_factory=get_datetime_utc)

    user_links: list[UserTeamLink] = Relationship(
        back_populates="team", cascade_delete=True
    )
    invitations: list["Invitation"] = Relationship(
        back_populates="team", cascade_delete=True
    )

    apps: list["App"] = Relationship(back_populates="team")


class TeamCreate(TeamBase):
    pass


class TeamUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255, min_length=3)
    description: str | None = Field(default=None, max_length=255)


class TeamPublic(TeamBase):
    id: uuid.UUID
    slug: str = Field(max_length=255)
    is_personal_team: bool
    owner_id: uuid.UUID


class TeamsPublic(SQLModel):
    data: list[TeamPublic]
    count: int


class TeamWithUserPublic(TeamPublic):
    user_links: list[UserLinkPublic]


class TeamCreateMember(SQLModel):
    role: Role


class TeamUpdateMember(SQLModel):
    role: Role


class UserTeamLinkPublic(SQLModel):
    user: UserPublic
    team: TeamPublic
    role: Role


class InvitationBase(SQLModel):
    role: Role = Field(max_length=255)
    email: EmailStr = Field(max_length=255)


class InvitationCreate(InvitationBase):
    team_id: uuid.UUID


class InvitationUpdateStatus(SQLModel):
    status: InvitationStatus


class InvitationToken(SQLModel):
    token: str


class InvitationPublic(InvitationBase):
    id: uuid.UUID
    team_id: uuid.UUID
    invited_by_id: uuid.UUID
    status: InvitationStatus
    created_at: datetime
    sender: UserPublic
    team: TeamPublic


class InvitationsPublic(SQLModel):
    data: list[InvitationPublic]
    count: int


class Invitation(InvitationBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    team_id: uuid.UUID = Field(foreign_key="team.id", ondelete="CASCADE")
    invited_by_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
    status: InvitationStatus = Field(default=InvitationStatus.pending)
    created_at: datetime = Field(default_factory=get_datetime_utc)
    expires_at: datetime

    sender: User = Relationship(
        back_populates="invitations_sent",
        sa_relationship_kwargs={"foreign_keys": "[Invitation.invited_by_id]"},
    )

    team: Team = Relationship(back_populates="invitations")


class AppBase(SQLModel):
    name: str = Field(max_length=255, min_length=1)


class App(AppBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    team_id: uuid.UUID = Field(foreign_key="team.id")
    team: Team = Relationship(back_populates="apps")
    slug: str = Field(max_length=255, unique=True)
    created_at: datetime = Field(default_factory=get_datetime_utc)
    updated_at: datetime = Field(default_factory=get_datetime_utc)
    deployments: list["Deployment"] = Relationship(
        back_populates="app", cascade_delete=True
    )

    @computed_field
    def url(self) -> str:
        return f"https://{self.slug}.{settings.DEPLOYMENTS_DOMAIN}"


class AppCreate(AppBase):
    team_id: uuid.UUID


class AppPublic(AppBase):
    id: uuid.UUID
    team_id: uuid.UUID
    slug: str
    created_at: datetime
    updated_at: datetime
    url: str


class AppsPublic(SQLModel):
    data: list[AppPublic]
    count: int


class DeploymentStatus(str, Enum):
    waiting_upload = "waiting_upload"
    building = "building"
    deploying = "deploying"
    success = "success"
    failed = "failed"


class Deployment(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    image_hash: str | None = Field(default=None, max_length=255)
    app_id: uuid.UUID = Field(foreign_key="app.id", ondelete="CASCADE")
    app: App = Relationship(back_populates="deployments")
    slug: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=get_datetime_utc)
    updated_at: datetime = Field(default_factory=get_datetime_utc)
    status: DeploymentStatus = Field(default=DeploymentStatus.waiting_upload)

    @computed_field
    def url(self) -> str:
        return f"https://{self.slug}.{settings.DEPLOYMENTS_DOMAIN}"


class DeploymentPublic(SQLModel):
    id: uuid.UUID
    app_id: uuid.UUID
    slug: str
    created_at: datetime
    updated_at: datetime
    status: DeploymentStatus
    url: str


class DeploymentsPublic(SQLModel):
    data: list[DeploymentPublic]
    count: int


class DeploymentUploadOut(SQLModel):
    url: str
    fields: dict[str, Any]


def valid_environment_variable_name(name: str) -> str:
    if not name.isidentifier():
        raise ValueError("Invalid environment variable name")

    return name


class EnvironmentVariable(SQLModel, table=True):
    app_id: uuid.UUID = Field(
        foreign_key="app.id", ondelete="CASCADE", primary_key=True
    )
    name: Annotated[str, AfterValidator(valid_environment_variable_name)] = Field(
        max_length=255,
        primary_key=True,
    )
    value: str = Field(min_length=1)
    created_at: datetime = Field(default_factory=get_datetime_utc)
    updated_at: datetime = Field(default_factory=get_datetime_utc)


class EnvironmentVariablePublic(SQLModel):
    name: str
    value: str
    created_at: datetime
    updated_at: datetime


class EnvironmentVariablesPublic(SQLModel):
    data: list[EnvironmentVariablePublic]
    count: int


class EnvironmentVariableCreate(SQLModel):
    name: Annotated[str, AfterValidator(valid_environment_variable_name)]
    value: str


class EnvironmentVariableUpdate(SQLModel):
    value: str
