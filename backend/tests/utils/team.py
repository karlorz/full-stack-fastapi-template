import secrets
import uuid
from datetime import datetime

from sqlmodel import Session

from app.models import Team

from tests.utils.utils import random_lower_string


def create_random_team(
    db: Session,
    owner_id: uuid.UUID | None = None,
    is_personal_team: bool = False,
    created_at: datetime | None = None,
) -> Team:
    from tests.utils.user import create_random_user

    owner_id = owner_id or create_random_user(db).id
    name = random_lower_string()
    slug = f"{name}-{secrets.token_hex(4)}"
    description = random_lower_string()
    team_in = Team(
        name=name,
        description=description,
        slug=slug,
        owner_id=owner_id,
        is_personal_team=is_personal_team,
        created_at=created_at,
    )
    db.add(team_in)
    db.commit()
    db.refresh(team_in)
    return team_in
