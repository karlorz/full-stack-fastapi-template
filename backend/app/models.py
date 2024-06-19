from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import EmailStr
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
    role: Role = Field(max_length=255)

    user: "User" = Relationship(back_populates="team_links")
    team: "Team" = Relationship(back_populates="user_links")


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    full_name: str = Field(max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str = Field(max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)  # type: ignore


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    username: str = Field(unique=True, index=True, max_length=255)
    is_verified: bool = False

    personal_team_id: int | None = Field(
        foreign_key="team.id", nullable=True, default=None
    )
    personal_team: Optional["Team"] = Relationship()

    team_links: list[UserTeamLink] = Relationship(back_populates="user")
    invitations_sent: list["Invitation"] = Relationship(
        back_populates="sender",
        sa_relationship_kwargs={"foreign_keys": "[Invitation.invited_by_id]"},
    )


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: int
    personal_team_slug: str | None = None


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
    name: str = Field(max_length=255)
    description: str | None = Field(default=None, max_length=255)


class Team(TeamBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True, max_length=255)

    user_links: list[UserTeamLink] = Relationship(back_populates="team")
    invitations: list["Invitation"] = Relationship(back_populates="team")


class TeamCreate(TeamBase):
    pass


class TeamUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=255)


class TeamPublic(TeamBase):
    id: int
    slug: str = Field(default=None, max_length=255)


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
    team_id: int


class InvitationUpdateStatus(SQLModel):
    status: InvitationStatus


class InvitationToken(SQLModel):
    token: str


class InvitationPublic(InvitationBase):
    id: int
    team_id: int
    invited_by_id: int
    status: InvitationStatus
    created_at: datetime
    sender: UserPublic
    team: TeamPublic


class InvitationsPublic(SQLModel):
    data: list[InvitationPublic]
    count: int


class Invitation(InvitationBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    team_id: int = Field(foreign_key="team.id")
    invited_by_id: int = Field(foreign_key="user.id")
    status: InvitationStatus = Field(default=InvitationStatus.pending, max_length=255)
    created_at: datetime = Field(default_factory=get_datetime_utc)
    expires_at: datetime

    sender: User = Relationship(
        back_populates="invitations_sent",
        sa_relationship_kwargs={"foreign_keys": "[Invitation.invited_by_id]"},
    )
    team: Team = Relationship(back_populates="invitations")
