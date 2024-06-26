from datetime import timedelta
from typing import Any, TypeVar

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlmodel import col, func, select
from sqlmodel.sql.expression import SelectOfScalar

from app.api.deps import CurrentUser, SessionDep, get_first_superuser
from app.api.utils.invitations import (
    generate_invitation_token,
    generate_invitation_token_email,
    send_invitation_email,
    verify_invitation_token,
)
from app.core.config import settings
from app.crud import add_user_to_team, get_user_team_link_by_user_id_and_team_slug
from app.models import (
    Invitation,
    InvitationCreate,
    InvitationPublic,
    InvitationsPublic,
    InvitationStatus,
    InvitationToken,
    Message,
    Role,
    Team,
    User,
)
from app.utils import get_datetime_utc

router = APIRouter()

T = TypeVar("T")


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
        .where(col(Invitation.email) == current_user.email)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Invitation)
        .where(col(Invitation.email) == current_user.email)
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


@router.get("/team/{team_slug}", response_model=InvitationsPublic)
def read_invitations_team_by_admin(
    session: SessionDep,
    current_user: CurrentUser,
    team_slug: str,
    skip: int = 0,
    limit: int = 100,
    status: InvitationStatus | None = None,
) -> Any:
    """
    Retrieve a list of invitations sent by the current user.
    """
    user_team_link = get_user_team_link_by_user_id_and_team_slug(
        session=session, user_id=current_user.id, team_slug=team_slug
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    if user_team_link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )

    def _apply_filters(statement: SelectOfScalar[T]) -> SelectOfScalar[T]:
        statement = statement.where(
            Invitation.team_id == Team.id, Team.slug == team_slug
        )

        if status:
            statement = statement.where(Invitation.status == status)

        return statement

    count_statement = _apply_filters(select(func.count()).select_from(Invitation))
    count = session.exec(count_statement).one()

    statement = _apply_filters(select(Invitation)).offset(skip).limit(limit)

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
    user_team_link = get_user_team_link_by_user_id_and_team_slug(
        session=session, user_id=current_user.id, team_slug=invitation_in.team_slug
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    if user_team_link.role != Role.admin:
        raise HTTPException(
            status_code=400, detail="Not enough permissions to execute this action"
        )

    team_id = user_team_link.team.id

    existing_invitation = session.exec(
        select(Invitation).where(
            col(Invitation.email) == invitation_in.email,
            col(Invitation.team_id) == team_id,
        )
    ).first()

    if (
        existing_invitation
        and existing_invitation.status == InvitationStatus.pending
        and get_datetime_utc().replace(tzinfo=None) < existing_invitation.expires_at
    ):
        raise HTTPException(
            status_code=400,
            detail="Invitation already exists for this user",
        )

    statement = select(User).where(col(User.email) == invitation_in.email)
    user_to_invite = session.exec(statement).first()

    invitation = Invitation.model_validate(
        invitation_in,
        update={
            "team_id": team_id,
            "invited_by_id": current_user.id,
            "expires_at": get_datetime_utc()
            + timedelta(hours=settings.INVITATION_TOKEN_EXPIRE_HOURS),
        },
    )

    if not user_to_invite:
        session.add(invitation)
        session.commit()
        session.refresh(invitation)

        assert invitation.id  # for type checking
        if settings.emails_enabled:
            send_invitation_email(
                invitation_id=invitation.id,
                email_to=invitation.email,
                email_from=current_user.email,
                team_name=invitation.team.name,
            )

        return invitation

    user_to_invite_team_link = get_user_team_link_by_user_id_and_team_slug(
        session=session, user_id=user_to_invite.id, team_slug=invitation_in.team_slug
    )
    if user_to_invite_team_link:
        raise HTTPException(
            status_code=400,
            detail="The user is already in the team",
        )

    session.add(invitation)
    session.commit()
    session.refresh(invitation)

    if settings.emails_enabled:
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
        col(Invitation.id) == invitation_id, col(Invitation.email) == current_user.email
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


@router.post(
    "/team-invitation-html-content/{invitation_id}",
    dependencies=[Depends(get_first_superuser)],
    response_class=HTMLResponse,
)
def invitation_html_content(invitation_id: int, session: SessionDep) -> Any:
    """
    HTML Content for Invitation email
    """
    invitation = session.get(Invitation, invitation_id)
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    token = generate_invitation_token(invitation_id=invitation_id)
    email_to = invitation.email
    email_from = invitation.sender.email
    email_data = generate_invitation_token_email(
        team_name=invitation.team.name,
        email_to=email_to,
        email_from=email_from,
        token=token,
    )

    return HTMLResponse(
        content=email_data.html_content, headers={"subject:": email_data.subject}
    )


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
    user_team_link = get_user_team_link_by_user_id_and_team_slug(
        session=session, user_id=current_user.id, team_slug=invitation.team.slug
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
