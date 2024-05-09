from datetime import timedelta
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.sql import and_, or_
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.api.utils.invitations import (
    send_invitation_email,
    verify_invitation_token,
)
from app.core.config import settings
from app.crud import (
    add_user_to_team,
    get_invitation_by_user_id_or_email_and_team_id,
    get_user_by_id_or_email,
    get_user_team_link_by_user_id_and_team_id,
)
from app.models import (
    Invitation,
    InvitationCreate,
    InvitationPublic,
    InvitationsPublic,
    InvitationStatus,
    InvitationToken,
    Message,
    Role,
)
from app.utils import get_datetime_utc

router = APIRouter()


@router.get("/me", response_model=InvitationsPublic)
def read_invitations_me(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve a list of invitations accessible to the current user.
    """
    count_statement = (
        select(func.count())
        .select_from(Invitation)
        .where(col(Invitation.invited_user_id) == current_user.id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Invitation)
        .where(col(Invitation.invited_user_id) == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    invitations = session.exec(statement).all()

    return InvitationsPublic(data=invitations, count=count)


@router.get("/sent", response_model=InvitationsPublic)
def read_invitations_sent(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve a list of invitations sent by the current user.
    """
    count_statement = (
        select(func.count())
        .select_from(Invitation)
        .where(col(Invitation.invited_by_id) == current_user.id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Invitation)
        .where(col(Invitation.invited_by_id) == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    invitations = session.exec(statement).all()

    return InvitationsPublic(data=invitations, count=count)


@router.get("/team/{team_id}", response_model=InvitationsPublic)
def read_invitations_team_by_admin(
    session: SessionDep,
    current_user: CurrentUser,
    team_id: int,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve a list of invitations sent by the current user.
    """
    user_team_link = get_user_team_link_by_user_id_and_team_id(
        session=session, user_id=current_user.id, team_id=team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    if user_team_link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )

    count_statement = (
        select(func.count())
        .select_from(Invitation)
        .where(col(Invitation.team_id) == team_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Invitation)
        .where(col(Invitation.team_id) == team_id)
        .offset(skip)
        .limit(limit)
    )
    invitations = session.exec(statement).all()

    return InvitationsPublic(data=invitations, count=count)


@router.post("/", response_model=InvitationPublic)
def create_invitation(
    invitation_in: InvitationCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Create new invitation.
    """
    user_team_link = get_user_team_link_by_user_id_and_team_id(
        session=session, user_id=current_user.id, team_id=invitation_in.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    if user_team_link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )

    existing_invitation = get_invitation_by_user_id_or_email_and_team_id(
        session=session,
        user_id=invitation_in.invited_user_id,
        team_id=invitation_in.team_id,
        email=invitation_in.email,
    )

    if (
        existing_invitation
        and existing_invitation.status == InvitationStatus.pending
        and get_datetime_utc().replace(tzinfo=None) < existing_invitation.expires_at
    ):
        raise HTTPException(
            status_code=400,
            detail="Invitation already exists for this user",
        )

    user_to_invite = get_user_by_id_or_email(
        session=session,
        user_id=invitation_in.invited_user_id,
        email=invitation_in.email,
    )

    invitation = Invitation.model_validate(
        invitation_in,
        update={
            "invited_by_id": current_user.id,
            "expires_at": get_datetime_utc()
            + timedelta(hours=settings.INVITATION_TOKEN_EXPIRE_HOURS),
        },
    )

    if not user_to_invite:
        if not invitation.email:
            raise HTTPException(
                status_code=400,
                detail="The invitation must have an email to be sent to a user that does not exist in our platform",
            )

        invitation.invited_user_id = None
        session.add(invitation)
        session.commit()
        session.refresh(invitation)

        assert invitation.id  # for type checking
        send_invitation_email(
            invitation_id=invitation.id,
            email_to=invitation.email,
            email_from=current_user.email,
            team_name=invitation.team.name,
        )

        return invitation

    user_to_invite_team_link = get_user_team_link_by_user_id_and_team_id(
        session=session, user_id=user_to_invite.id, team_id=invitation_in.team_id
    )
    if user_to_invite_team_link:
        raise HTTPException(
            status_code=400,
            detail="The user is already in the team",
        )

    # make sure if the user was found fill the email or FK in the invitation row
    invitation.invited_user_id = user_to_invite.id
    invitation.email = user_to_invite.email

    session.add(invitation)
    session.commit()
    session.refresh(invitation)

    send_invitation_email(
        invitation_id=invitation.id,  # type: ignore
        email_to=invitation.email,
        email_from=current_user.email,
        team_name=invitation.team.name,
    )

    return invitation


@router.post("/accept", response_model=InvitationPublic)
def accept_invitation(
    session: SessionDep,
    current_user: CurrentUser,
    payload: InvitationToken,
) -> Any:
    """
    Accept an invitation.
    """
    invitation_id = verify_invitation_token(token=payload.token)
    if not invitation_id:
        raise HTTPException(status_code=400, detail="Invalid invitation token")

    invitation_query = select(Invitation).where(
        and_(
            col(Invitation.id) == invitation_id,
            or_(
                col(Invitation.email) == current_user.email,
                col(Invitation.invited_user_id) == current_user.id,
            ),
        )
    )
    invitation = session.exec(invitation_query).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if get_datetime_utc().replace(tzinfo=None) > invitation.expires_at:
        raise HTTPException(status_code=400, detail="Invitation expired")
    if invitation.status == InvitationStatus.accepted:
        raise HTTPException(status_code=400, detail="Invitation was already accepted")
    if current_user.id in {link.user_id for link in invitation.team.user_links}:
        raise HTTPException(status_code=400, detail="User already in team")

    if invitation.invited_user_id is None:
        invitation.invited_user_id = current_user.id

    invitation.status = InvitationStatus.accepted

    add_user_to_team(
        session=session,
        team=invitation.team,
        user=current_user,
        role=invitation.role,
    )

    session.add(invitation)
    session.commit()
    session.refresh(invitation)

    return invitation


@router.post("/token/verify", response_model=InvitationPublic)
def verify_invitation(
    session: SessionDep,
    payload: InvitationToken,
) -> Any:
    """
    Verify an invitation token.
    """
    invitation_id = verify_invitation_token(token=payload.token)
    if not invitation_id:
        raise HTTPException(status_code=400, detail="Invalid invitation token")

    invitation_query = select(Invitation).where(col(Invitation.id) == invitation_id)
    invitation = session.exec(invitation_query).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    if get_datetime_utc().replace(tzinfo=None) > invitation.expires_at:
        raise HTTPException(status_code=400, detail="Invitation expired")

    return invitation


@router.delete("/{inv_id}", response_model=Message)
def delete_invitation(
    session: SessionDep,
    current_user: CurrentUser,
    inv_id: int,
) -> Any:
    """
    Delete an invitation.
    """
    invitation_query = select(Invitation).where(Invitation.id == inv_id)
    invitation = session.exec(invitation_query).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    if invitation.status == InvitationStatus.accepted:
        raise HTTPException(
            status_code=400,
            detail="Invitation was already accepted and cannot be deleted",
        )

    assert current_user.id  # For type checking
    user_team_link = get_user_team_link_by_user_id_and_team_id(
        session=session, user_id=current_user.id, team_id=invitation.team_id
    )

    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    if user_team_link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )

    session.delete(invitation)
    session.commit()
    return Message(message="Invitation deleted")
