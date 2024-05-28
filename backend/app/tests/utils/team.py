import secrets

from sqlmodel import Session

from app.models import Team
from app.tests.utils.utils import random_lower_string


def create_random_team(db: Session) -> Team:
    name = random_lower_string()
    slug = f"{name}-{secrets.token_hex(4)}"
    description = random_lower_string()
    team_in = Team(name=name, description=description, slug=slug)
    db.add(team_in)
    db.commit()
    db.refresh(team_in)
    return team_in
