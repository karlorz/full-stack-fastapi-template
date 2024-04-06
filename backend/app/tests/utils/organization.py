from sqlmodel import Session

from app.models import Organization
from app.tests.utils.utils import random_lower_string


def create_random_organization(db: Session) -> Organization:
    organization_in = Organization(
        name=random_lower_string(), description=random_lower_string()
    )
    db.add(organization_in)
    db.commit()
    db.refresh(organization_in)
    return organization_in
