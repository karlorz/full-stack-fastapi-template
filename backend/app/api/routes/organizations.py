from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.crud import add_user_to_organization
from app.models import (
    Message,
    Organization,
    OrganizationCreate,
    OrganizationCreateMember,
    OrganizationPublic,
    OrganizationsPublic,
    OrganizationUpdate,
    OrganizationUpdateMember,
    OrganizationWithUserPublic,
    Role,
    User,
    UserOrganizationLink,
    UserOrganizationLinkPublic,
)

router = APIRouter()


@router.get("/", response_model=OrganizationsPublic)
def get_organizations(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve a list of organizations accessible to the current user.
    """
    count_statement = (
        select(func.count())
        .select_from(Organization)
        .where(
            col(Organization.user_links).any(
                col(UserOrganizationLink.user) == current_user
            )
        )
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Organization)
        .where(
            col(Organization.user_links).any(
                col(UserOrganizationLink.user) == current_user
            )
        )
        .offset(skip)
        .limit(limit)
    )
    organizations = session.exec(statement).all()

    return OrganizationsPublic(data=organizations, count=count)


@router.get("/{org_id}", response_model=OrganizationWithUserPublic)
def get_organization(
    session: SessionDep, current_user: CurrentUser, org_id: int
) -> Any:
    """
    Retrieve an organization by its ID and returns it along with its associated users.
    """
    query = select(Organization).options(
        selectinload(Organization.user_links).selectinload(UserOrganizationLink.user)  # type: ignore
    )
    query = query.where(
        Organization.id == org_id,
        col(Organization.user_links).any(
            col(UserOrganizationLink.user) == current_user
        ),
    )
    organization = session.exec(query).first()
    if not organization:
        raise HTTPException(
            status_code=404, detail="Organization not found for the current user"
        )

    return organization


@router.post("/", response_model=OrganizationPublic)
def create_organization(
    session: SessionDep, current_user: CurrentUser, organization_in: OrganizationCreate
) -> Any:
    """
    Create a new organization with the provided details.
    """
    organization = Organization.model_validate(organization_in)
    user_organization = UserOrganizationLink(
        user=current_user, organization=organization, role=Role.admin
    )
    session.add(user_organization)
    session.commit()
    session.refresh(organization)
    return organization


@router.put("/{org_id}", response_model=OrganizationPublic)
def update_organization(
    session: SessionDep,
    current_user: CurrentUser,
    org_id: int,
    organization_in: OrganizationUpdate,
) -> Any:
    """
    Update an organization by its ID.
    """
    query = (
        select(UserOrganizationLink)
        .options(selectinload(UserOrganizationLink.organization))  # type: ignore
        .where(
            UserOrganizationLink.organization_id == org_id,
            UserOrganizationLink.user == current_user,
        )
    )
    link = session.exec(query).first()
    if not link:
        raise HTTPException(
            status_code=404, detail="Organization not found for the current user"
        )

    if link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )
    update_dict = organization_in.model_dump(exclude_unset=True)
    org = link.organization
    org.sqlmodel_update(update_dict)
    return org


@router.delete("/{org_id}", response_model=Message)
def delete_organization(
    session: SessionDep, current_user: CurrentUser, org_id: int
) -> Message:
    """
    Delete an organization from the database.
    """
    query = (
        select(UserOrganizationLink)
        .options(selectinload(UserOrganizationLink.organization))  # type: ignore
        .where(
            UserOrganizationLink.organization_id == org_id,
            UserOrganizationLink.user == current_user,
        )
    )
    link = session.exec(query).first()
    if not link:
        raise HTTPException(
            status_code=404, detail="Organization not found for the current user"
        )

    if link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )
    organization = link.organization

    for link in organization.user_links:  # remove all links to this organization
        session.delete(link)
    session.delete(organization)
    session.commit()
    return Message(message="Organization deleted")


@router.post("/{org_id}/users/", response_model=UserOrganizationLinkPublic)
def add_member_to_organization(
    session: SessionDep,
    current_user: CurrentUser,
    org_id: int,
    member_in: OrganizationCreateMember,
) -> Any:
    """
    Add a user to an organization.
    """
    query = (
        select(UserOrganizationLink)
        .options(
            selectinload(UserOrganizationLink.organization).selectinload(  # type: ignore
                Organization.user_links  # type: ignore
            )
        )
        .where(
            UserOrganizationLink.organization_id == org_id,
            UserOrganizationLink.user == current_user,
        )
    )
    user_org_link = session.exec(query).first()
    if not user_org_link:
        raise HTTPException(
            status_code=404, detail="Organization not found for the current user"
        )

    if user_org_link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )
    organization = user_org_link.organization

    if member_in.user_id in {link.user_id for link in organization.user_links}:
        raise HTTPException(status_code=400, detail="User already in organization")

    user = session.get(User, member_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_organization = add_user_to_organization(
        session=session, organization=organization, user=user, role=member_in.role
    )
    return user_organization


@router.put("/{org_id}/users/{user_id}", response_model=UserOrganizationLinkPublic)
def update_member_in_organization(
    session: SessionDep,
    current_user: CurrentUser,
    org_id: int,
    user_id: int,
    member_in: OrganizationUpdateMember,
) -> Any:
    """
    Update a member in an organization.
    """
    query = (
        select(UserOrganizationLink)
        .options(
            selectinload(UserOrganizationLink.organization).selectinload(  # type: ignore
                Organization.user_links  # type: ignore
            )
        )
        .where(
            UserOrganizationLink.organization_id == org_id,
            UserOrganizationLink.user == current_user,
        )
    )
    link = session.exec(query).first()
    if not link:
        raise HTTPException(
            status_code=404, detail="Organization not found for the current user"
        )

    if link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )

    member_link_list = [
        member_link
        for member_link in link.organization.user_links
        if member_link.user_id == user_id
    ]
    if not member_link_list:
        raise HTTPException(status_code=404, detail="User not in organization")
    member_link = member_link_list[0]

    member_link.role = member_in.role
    session.add(member_link)
    session.commit()
    session.refresh(member_link)
    return member_link


@router.delete("/{org_id}/users/{user_id}", response_model=Message)
def remove_member_from_organization(
    session: SessionDep,
    current_user: CurrentUser,
    org_id: int,
    user_id: int,
) -> Message:
    """
    Remove a member from an organization.
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=400, detail="You cannot remove yourself from the organization"
        )

    query = (
        select(UserOrganizationLink)
        .options(
            selectinload(UserOrganizationLink.organization).selectinload(  # type: ignore
                Organization.user_links  # type: ignore
            )
        )
        .where(
            UserOrganizationLink.organization_id == org_id,
            UserOrganizationLink.user == current_user,
        )
    )
    link = session.exec(query).first()
    if not link:
        raise HTTPException(
            status_code=404, detail="Organization not found for the current user"
        )

    if link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )

    member_link_list = [
        member_link
        for member_link in link.organization.user_links
        if member_link.user_id == user_id
    ]
    if not member_link_list:
        raise HTTPException(status_code=404, detail="User not found in organization")
    member_link = member_link_list[0]
    session.delete(member_link)
    session.commit()
    return Message(message="User removed from organization")
