import secrets

from sqlmodel import Session, select

from app.core.config import MainSettings
from app.models import App, Team
from app.utils import slugify


def generate_team_slug_name(name: str, session: Session) -> str:
    slug_name = slugify(name)
    new_slug = f"{slug_name}-{secrets.token_hex(4)}"
    while session.exec(select(Team).where(Team.slug == new_slug)).first():
        new_slug = f"{slug_name}-{secrets.token_hex(4)}"

    return new_slug


def generate_app_slug_name(name: str, session: Session) -> str:
    settings = MainSettings.get_settings()

    slug_name = slugify(name)
    new_slug = slug_name

    while (
        len(new_slug) < 5
        or session.exec(select(App).where(App.slug == new_slug)).first()
        or new_slug.endswith(settings.RESERVED_APP_NAMES)
    ):
        new_slug = f"{slug_name}-{secrets.token_hex(4)}"

    return new_slug
