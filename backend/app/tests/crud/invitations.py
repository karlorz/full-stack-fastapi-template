from datetime import datetime, timedelta

from sqlmodel import Session, select

from app.core.config import settings
from app.models import Invitation, InvitationCreate, Team, User
from app.utils import get_datetime_utc


def create_invitation(
    *,
    session: Session,
    invitation_in: InvitationCreate,
    invited_by: User,
    invitation_status: str,
    expires_at: datetime = get_datetime_utc()
    + timedelta(hours=settings.INVITATION_TOKEN_EXPIRE_HOURS),
) -> Invitation:
    invited_user = session.exec(
        select(User).where(User.email == invitation_in.email)
    ).first()

    team = session.exec(select(Team).where(Team.id == invitation_in.team_id)).first()

    assert team

    invitation = Invitation.model_validate(
        invitation_in,
        update={
            "team_id": team.id,
            "invited_user_id": invited_user.id if invited_user else None,
            "invited_by_id": invited_by.id,
            "status": invitation_status,
            "expires_at": expires_at,
        },
    )
    session.add(invitation)
    session.commit()
    session.refresh(invitation)
    return invitation
