import secrets

from sqlmodel import Session, select

from app.models import User
from app.utils import slugify


def verify_and_generate_slug_username(name: str, session: Session) -> str:
    slug_name = slugify(name)
    while session.exec(select(User).where(User.username == slug_name)).first():
        slug_name = f"{slug_name}-{secrets.token_hex(4)}"

    return slug_name
