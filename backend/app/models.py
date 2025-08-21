import uuid
from datetime import UTC, datetime, timedelta
from enum import Enum
from typing import Annotated, Any, Literal

from pydantic import AfterValidator, EmailStr, computed_field
from sqlalchemy import ColumnElement, DateTime
from sqlalchemy.ext.hybrid import hybrid_property
from sqlmodel import Field, Relationship, SQLModel, and_, col, func

from app.core.config import CommonSettings, MainSettings


def get_datetime_utc() -> datetime:
    return datetime.now(UTC)


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
    password: str = Field(min_length=8)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8)
    full_name: str = Field(max_length=255, min_length=3)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8)
    full_name: str | None = Field(default=None, max_length=255, min_length=3)  # type: ignore


class UserUpdateEmailMe(SQLModel):
    email: EmailStr = Field(max_length=255)


class UserUpdateMe(SQLModel):
    full_name: str = Field(max_length=255, min_length=3)


class UpdatePassword(SQLModel):
    current_password: str | None = Field(default=None, min_length=8)
    new_password: str = Field(min_length=8)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str | None = Field(default=None)
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

    social_accounts: list["SocialAccount"] = Relationship(
        back_populates="user", cascade_delete=True
    )

    @computed_field(return_type="Team | None")
    @hybrid_property
    def personal_team(self) -> "Team | None":
        return next((team for team in self.owned_teams if team.is_personal_team), None)

    @computed_field(return_type="GitHubAccount | None")
    @hybrid_property
    def github_account(self) -> "GitHubAccount | None":
        return next(
            (
                account  # type: ignore
                for account in self.social_accounts
                if account.provider == "github"
            ),
            None,
        )

    @computed_field(return_type=bool)
    @hybrid_property
    def has_usable_password(self) -> bool:
        return self.hashed_password is not None


# Used for the current user
class UserMePublic(UserBase):
    id: uuid.UUID
    personal_team_slug: str
    github_account: "GitHubAccount | None"
    has_usable_password: bool


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
    new_password: str = Field(min_length=8)


class EmailVerificationToken(SQLModel):
    token: str


class ResendEmailVerification(SQLModel):
    email: EmailStr


class TeamBase(SQLModel):
    name: str = Field(max_length=255, min_length=3)
    description: str | None = Field(default=None, max_length=255)


class Team(TeamBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    slug: str = Field(unique=True, index=True, max_length=255)

    owner_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
    owner: User = Relationship(back_populates="owned_teams")
    is_personal_team: bool = False
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

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
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
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
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    deleted_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    cleaned_up_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    deployments: list["Deployment"] = Relationship(
        back_populates="app", cascade_delete=True
    )

    @computed_field
    def url(self) -> str:
        return f"https://{self.slug}.{CommonSettings.get_settings().DEPLOYMENTS_DOMAIN}"

    @computed_field(return_type="Deployment | None")
    @hybrid_property
    def latest_deployment(self) -> "Deployment | None":
        deployments = sorted(self.deployments, key=lambda x: x.updated_at, reverse=True)
        if not deployments:
            return None

        return deployments[0]

    @computed_field(return_type=bool | None)
    @hybrid_property
    def is_fresh(self) -> bool | None:
        if not self.latest_deployment:
            return None

        return self.updated_at > self.latest_deployment.updated_at

    @computed_field(return_type=bool)
    @hybrid_property
    def is_deletable(self) -> bool:
        if self.cleaned_up_at is None or self.deleted_at is None:
            return False

        soft_deleted_app_retention_days = timedelta(
            days=CommonSettings.get_settings().SOFT_DELETED_APP_RETENTION_DAYS
        )

        return get_datetime_utc() > (self.deleted_at + soft_deleted_app_retention_days)

    @computed_field(return_type=bool)  # type: ignore[no-redef]
    @is_deletable.expression
    def is_deletable(cls) -> ColumnElement[bool]:
        soft_deleted_app_retention_days = timedelta(
            days=CommonSettings.get_settings().SOFT_DELETED_APP_RETENTION_DAYS
        )

        return and_(
            col(cls.__class__.cleaned_up_at).is_not(None),
            col(cls.__class__.deleted_at).is_not(None),
            func.now()
            > (col(cls.__class__.deleted_at) + soft_deleted_app_retention_days),
        )


class AppCreate(AppBase):
    team_id: uuid.UUID


class AppPublic(AppBase):
    id: uuid.UUID
    team_id: uuid.UUID
    slug: str
    created_at: datetime
    updated_at: datetime
    url: str
    is_fresh: bool | None
    latest_deployment: "DeploymentPublic | None"


class AppsPublic(SQLModel):
    data: list[AppPublic]
    count: int


class DeploymentStatus(str, Enum):
    waiting_upload = "waiting_upload"
    ready_for_build = "ready_for_build"
    building = "building"
    extracting = "extracting"
    building_image = "building_image"
    deploying = "deploying"
    success = "success"
    failed = "failed"


class Deployment(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    image_hash: str | None = Field(default=None, max_length=255)
    app_id: uuid.UUID = Field(foreign_key="app.id", ondelete="CASCADE")
    app: App = Relationship(back_populates="deployments")
    slug: str = Field(max_length=255)
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    status: DeploymentStatus = Field(default=DeploymentStatus.waiting_upload)

    @computed_field
    def url(self) -> str:
        return f"https://{self.slug}.{CommonSettings.get_settings().DEPLOYMENTS_DOMAIN}"

    @computed_field
    def dashboard_url(self) -> str:
        return f"{MainSettings.get_settings().FRONTEND_HOST}/{self.app.team.slug}/apps/{self.app.slug}/deployments/{self.id}"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def s3_object_key(self) -> str:
        return f"{self.app.id}/{self.id}.tar"


class DeploymentPublic(SQLModel):
    id: uuid.UUID
    app_id: uuid.UUID
    slug: str
    created_at: datetime
    updated_at: datetime
    status: DeploymentStatus
    url: str
    dashboard_url: str


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
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


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


class WaitingListUserBase(SQLModel):
    email: EmailStr = Field(max_length=255, index=True)
    name: str | None = Field(default=None, max_length=255)
    organization: str | None = Field(default=None, max_length=255)
    role: str | None = Field(default=None, max_length=255)
    team_size: str | None = Field(default=None, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    use_case: str | None = Field(default=None, max_length=10_000)
    secret_code: str | None = Field(default=None, max_length=255)


class WaitingListUser(WaitingListUserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    allowed_at: datetime | None = Field(default=None, index=True)
    invitation_sent_at: datetime | None = Field(default=None, index=True)
    newsletter_synced_at: datetime | None = Field(
        default=None,
        index=True,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    registered_from_cli: bool = Field(default=False)

    @computed_field(return_type=bool)
    @hybrid_property
    def can_signup(self) -> bool:
        return (
            self.allowed_at is not None
            or self.email in MainSettings.get_settings().ALLOWED_SIGNUP_EMAILS
        )


class WaitingListUserCreate(WaitingListUserBase):
    pass


class WaitingListUserPublic(WaitingListUserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class DeployMessage(SQLModel):
    deployment_id: uuid.UUID


class CleanupMessage(SQLModel):
    app_id: uuid.UUID


class SocialAccount(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
    provider: str = Field(max_length=255)
    provider_user_id: str = Field(max_length=255)
    provider_username: str | None = Field(default=None, max_length=255)
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    scope: str | None = Field(default=None)
    access_token: str | None = Field(default=None)
    refresh_token: str | None = Field(default=None)
    access_token_expires_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    refresh_token_expires_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    user: User = Relationship()


class GitHubAccount(SQLModel):
    provider_user_id: str
    provider_username: str


class BuildMessage(SQLModel):
    type: Literal["build"] = "build"
    deployment_id: uuid.UUID


class RedeployMessage(SQLModel):
    type: Literal["redeploy"] = "redeploy"
    deployment_id: uuid.UUID


class DeleteAppMessage(SQLModel):
    type: Literal["delete_app"] = "delete_app"
    app_id: uuid.UUID


MessengerMessageBody = Annotated[
    BuildMessage | RedeployMessage | DeleteAppMessage,
    Field(discriminator="type"),
]
