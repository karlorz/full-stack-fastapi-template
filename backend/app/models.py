from datetime import datetime
from enum import Enum

from sqlmodel import Field, Relationship, SQLModel

from app.utils import get_datetime_utc


class Role(str, Enum):
    member = "member"
    admin = "admin"


class InvitationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"


class UserTeamLink(SQLModel, table=True):
    user_id: int | None = Field(default=None, foreign_key="user.id", primary_key=True)
    team_id: int | None = Field(default=None, foreign_key="team.id", primary_key=True)
    role: Role

    user: "User" = Relationship(back_populates="team_links")
    team: "Team" = Relationship(back_populates="user_links")


# Shared properties
# TODO replace email str with EmailStr when sqlmodel supports it
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    is_active: bool = True
    full_name: str | None = None


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str


# TODO replace email str with EmailStr when sqlmodel supports it
class UserRegister(SQLModel):
    email: str
    password: str
    full_name: str | None = None


# Properties to receive via API on update, all are optional
# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdate(UserBase):
    email: str | None = None  # type: ignore
    password: str | None = None


# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdateMe(SQLModel):
    full_name: str | None = None
    email: str | None = None


class UpdatePassword(SQLModel):
    current_password: str
    new_password: str


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str

    team_links: list[UserTeamLink] = Relationship(back_populates="user")
    invitations: list["Invitation"] = Relationship(
        back_populates="receiver",
        sa_relationship_kwargs={"foreign_keys": "[Invitation.invited_user_id]"},
    )
    invitations_sent: list["Invitation"] = Relationship(
        back_populates="sender",
        sa_relationship_kwargs={"foreign_keys": "[Invitation.invited_by_id]"},
    )


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: int


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
    new_password: str


class TeamBase(SQLModel):
    name: str
    description: str | None = None


class Team(TeamBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    user_links: list[UserTeamLink] = Relationship(back_populates="team")
    invitations: list["Invitation"] = Relationship(back_populates="team")


class TeamCreate(TeamBase):
    pass


class TeamUpdate(SQLModel):
    name: str | None = None
    description: str | None = None


class TeamPublic(TeamBase):
    id: int


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
    role: Role
    email: str


class InvitationCreate(InvitationBase):
    team_id: int


class InvitationUpdateStatus(SQLModel):
    status: InvitationStatus


class InvitationToken(SQLModel):
    token: str


class InvitationPublic(InvitationBase):
    id: int
    team_id: int
    invited_by_id: int
    invited_user_id: int | None = None
    status: InvitationStatus
    created_at: datetime
    receiver: UserPublic | None
    sender: UserPublic
    team: TeamPublic


class InvitationsPublic(SQLModel):
    data: list[InvitationPublic]
    count: int


class Invitation(InvitationBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    team_id: int = Field(foreign_key="team.id")
    invited_by_id: int = Field(foreign_key="user.id")
    invited_user_id: int | None = Field(default=None, foreign_key="user.id")
    status: InvitationStatus = InvitationStatus.pending
    created_at: datetime = Field(default_factory=get_datetime_utc)
    expires_at: datetime

    receiver: User = Relationship(
        back_populates="invitations",
        sa_relationship_kwargs={"foreign_keys": "[Invitation.invited_user_id]"},
    )
    sender: User = Relationship(
        back_populates="invitations_sent",
        sa_relationship_kwargs={"foreign_keys": "[Invitation.invited_by_id]"},
    )
    team: Team = Relationship(back_populates="invitations")
