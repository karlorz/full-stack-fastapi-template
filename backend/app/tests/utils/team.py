from sqlmodel import Session

from app.models import Team
from app.tests.utils.utils import random_lower_string


def create_random_team(db: Session) -> Team:
    team_in = Team(name=random_lower_string(), description=random_lower_string())
    db.add(team_in)
    db.commit()
    db.refresh(team_in)
    return team_in
