from enum import Enum

from sqlmodel import Field, Relationship, SQLModel


class Role(str, Enum):
    member = "member"
    admin = "admin"


class UserOrganizationLink(SQLModel, table=True):
    user_id: int | None = Field(default=None, foreign_key="user.id", primary_key=True)
    organization_id: int | None = Field(
        default=None, foreign_key="organization.id", primary_key=True
    )
    role: Role

    user: "User" = Relationship(back_populates="organization_links")
    organization: "Organization" = Relationship(back_populates="user_links")


# Shared properties
# TODO replace email str with EmailStr when sqlmodel supports it
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    is_active: bool = True
    is_superuser: bool = False
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
    items: list["Item"] = Relationship(back_populates="owner")
    organization_links: list[UserOrganizationLink] = Relationship(back_populates="user")


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


# Shared properties
class ItemBase(SQLModel):
    title: str
    description: str | None = None


# Properties to receive on item creation
class ItemCreate(ItemBase):
    title: str


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = None  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str

    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: int
    owner_id: int


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
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
    sub: int | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str


class OrganizationBase(SQLModel):
    name: str
    description: str | None = None


class Organization(OrganizationBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_links: list[UserOrganizationLink] = Relationship(back_populates="organization")


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(SQLModel):
    name: str | None = None
    description: str | None = None


class OrganizationPublic(OrganizationBase):
    id: int


class OrganizationsPublic(SQLModel):
    data: list[OrganizationPublic]
    count: int


class OrganizationWithUserPublic(OrganizationPublic):
    user_links: list[UserLinkPublic]


class OrganizationCreateMember(SQLModel):
    user_id: int
    role: Role


class OrganizationUpdateMember(SQLModel):
    role: Role


class UserOrganizationLinkPublic(SQLModel):
    user: UserPublic
    organization: OrganizationPublic
    role: Role
