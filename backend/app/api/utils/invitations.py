from datetime import timedelta

from jose import JWTError, jwt

from app.core.config import settings
from app.utils import EmailData, get_datetime_utc, render_email_template, send_email


def generate_invitation_token_email(
    *, team_name: str, email_to: str, email_from: str, token: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{ project_name } - { email_from } wants you to join { team_name }"
    link = f"{settings.server_host}/team-invitation?token={token}"
    html_content = render_email_template(
        template_name="accept_invitation.html",
        context={
            "server_host": settings.server_host,
            "team_name": team_name,
            "email_to": email_to,
            "email_from": email_from,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_invitation_token(invitation_id: int) -> str:
    now = get_datetime_utc()
    expires = now + timedelta(hours=settings.INVITATION_TOKEN_EXPIRE_HOURS)
    encoded_jwt = jwt.encode(
        {
            "exp": expires,
            "nbf": now,
            "sub": f"invitation-{invitation_id}",
        },
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    return encoded_jwt


def verify_invitation_token(token: str) -> int | None:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        split_token = decoded_token["sub"].split("-")
        if split_token[0] != "invitation":
            return None
        return int(split_token[1])
    except JWTError:
        return None


def send_invitation_email(
    *, invitation_id: int, email_to: str, email_from: str, team_name: str
) -> None:
    token = generate_invitation_token(invitation_id=invitation_id)
    email_data = generate_invitation_token_email(
        team_name=team_name, email_to=email_to, email_from=email_from, token=token
    )
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
