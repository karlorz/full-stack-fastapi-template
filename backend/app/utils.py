import logging
import re
import unicodedata
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Literal

import emails  # type: ignore
import jwt
from jinja2 import Template
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel
from redis import Redis

from app.core.config import settings


@dataclass
class EmailData:
    html_content: str
    subject: str


class TokenType(str, Enum):
    user = "user"
    reset = "reset"
    email = "email"
    update = "update"


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


def slugify(value: str) -> str:
    """
    Convert to ASCII. Convert spaces or repeated
    dashes to single dashes. Remove characters that aren't alphanumerics,
    underscores, or hyphens. Convert to lowercase. Also strip leading and
    trailing whitespace, dashes, and underscores.
    """
    value = str(value)
    value = (
        unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    )
    value = re.sub(r"[^\w\s-]", "", value.lower())
    return re.sub(r"[-\s]+", "-", value).strip("-_")


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent / "email-templates" / "build" / template_name
    ).read_text()
    html_content = Template(template_str).render(context)
    return html_content


def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> None:
    assert settings.emails_enabled, "no provided configuration for email variables"
    message = emails.Message(
        subject=subject,
        html=html_content,
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
    )
    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    elif settings.SMTP_SSL:
        smtp_options["ssl"] = True
    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD
    response = message.send(to=email_to, smtp=smtp_options)
    logging.info(f"send email result: {response}")


def generate_test_email(email_to: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    html_content = render_email_template(
        template_name="test_email.html",
        context={"project_name": settings.PROJECT_NAME, "email": email_to},
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_reset_password_email(email_to: str, email: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Password recovery for user {email}"
    link = f"{settings.server_host}/reset-password?token={token}"
    html_content = render_email_template(
        template_name="reset_password.html",
        context={
            "server_host": settings.server_host,
            "project_name": settings.PROJECT_NAME,
            "username": email,
            "email": email_to,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_new_account_email(
    email_to: str, username: str, password: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {username}"
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "server_host": settings.server_host,
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "password": password,
            "email": email_to,
            "link": settings.server_host,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_verification_email_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS)
    now = get_datetime_utc()
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": f"{TokenType.email.value}-{email}"},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    return encoded_jwt


def generate_verification_update_email_token(email: str, old_email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS)
    now = get_datetime_utc()
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {
            "exp": exp,
            "nbf": now,
            "sub": f"{TokenType.update.value}-{email}",
            "old_email": old_email,
        },
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    return encoded_jwt


def generate_verification_email(email_to: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Verify your email address"
    link = f"{settings.server_host}/verify-email?token={token}"
    html_content = render_email_template(
        template_name="verify_email.html",
        context={
            "server_host": settings.server_host,
            "project_name": settings.PROJECT_NAME,
            "email": email_to,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def verify_email_verification_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        splitted_sub = decoded_token["sub"].split("-", maxsplit=1)
        if len(splitted_sub) == 2 and splitted_sub[0] == TokenType.email:
            return str(splitted_sub[1])
        return None
    except InvalidTokenError:
        return None


def verify_update_email_verification_token(token: str) -> dict[str, Any] | None:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        splitted_sub = decoded_token["sub"].split("-", maxsplit=1)
        old_email = decoded_token.get("old_email")
        if len(splitted_sub) == 2 and splitted_sub[0] == TokenType.update:
            return {"email": splitted_sub[1], "old_email": old_email}
        return None
    except InvalidTokenError:
        return None


def generate_password_reset_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = get_datetime_utc()
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": f"{TokenType.reset.value}-{email}"},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        splitted_sub = decoded_token["sub"].split("-", maxsplit=1)
        if len(splitted_sub) == 2 and splitted_sub[0] == TokenType.reset:
            return str(splitted_sub[1])
        return None
    except InvalidTokenError:
        return None


def generate_verification_update_email(
    full_name: str, email_to: str, token: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Verify your email address"
    link = f"{settings.server_host}/verify-update-email?token={token}"
    html_content = render_email_template(
        template_name="email_update_confirmation.html",
        context={
            "server_host": settings.server_host,
            "project_name": settings.PROJECT_NAME,
            "username": full_name,
            "email": email_to,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_account_deletion_email(email_to: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Account deletion"
    html_content = render_email_template(
        template_name="account_deletion.html",
        context={
            "server_host": settings.server_host,
            "project_name": settings.PROJECT_NAME,
            "email": email_to,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_user_code() -> str:
    """Generates a unique user code for device auth."""

    # RFC 8628 suggest to return an easy to type code, but since
    # we'll automatically open the browser when authenticating
    # from the CLI, it should be fine to return a uuid, this
    # means we don't have to worry about potential user code
    # collisions.
    return str(uuid.uuid4())


class DeviceAuthorizationData(BaseModel):
    device_code: str
    client_id: str
    expires_at: datetime
    status: Literal["pending", "authorized"]
    access_token: str | None = None


def create_and_store_device_code(
    user_code: str, client_id: str, redis: "Redis[Any]"
) -> str:
    """Create a new device code and store it in Redis.

    The device code is generated and stored in Redis with the following structure:
    - key: auth:device:<device_code>
    - value: {
        "device_code": <device_code>,
        "client_id": <client_id>,
        "expires_at": <expires_at>,
        "status": "pending",
        "access_token": null
    }

    Additionally, a mapping from the user code to the device code is stored in Redis with the following structure:
    - key: auth:user-code:<user_code>
    - value: <device_code>

    The device code is returned if it was successfully stored in Redis.
    """
    now = get_datetime_utc()

    device_code = str(uuid.uuid4())

    data = DeviceAuthorizationData(
        device_code=device_code,
        client_id=client_id,
        expires_at=now + timedelta(minutes=settings.DEVICE_AUTH_TTL_MINUTES),
        status="pending",
    )

    pipeline = redis.pipeline(True)

    pipeline.set(
        f"auth:device:{device_code}",
        data.model_dump_json(),
        ex=settings.DEVICE_AUTH_TTL_MINUTES * 60,
    )
    pipeline.set(
        f"auth:user-code:{user_code}",
        device_code,
        ex=settings.DEVICE_AUTH_TTL_MINUTES * 60,
    )

    pipeline.execute()

    return device_code


def get_device_authorization_data(
    device_code: str, redis: "Redis[Any]"
) -> DeviceAuthorizationData | None:
    """Retrieve device authorization data from Redis using the device code."""
    data = redis.get(f"auth:device:{device_code}")

    if data:
        return DeviceAuthorizationData.model_validate_json(data)

    return None


def get_device_authorization_data_by_user_code(
    user_code: str, redis: "Redis[Any]"
) -> DeviceAuthorizationData | None:
    """Retrieve device authorization data from Redis using the user code."""
    device_code = redis.get(f"auth:user-code:{user_code}")

    if device_code:
        return get_device_authorization_data(device_code.decode(), redis)

    return None


def authorize_device_code(
    device_code: str, access_token: str, redis: "Redis[Any]"
) -> None:
    """Authorize the device code in Redis using the device code."""

    data = get_device_authorization_data(device_code, redis)

    if not data:
        raise ValueError("Device code not found")

    data.status = "authorized"
    data.access_token = access_token

    redis.set(
        f"auth:device:{device_code}",
        data.model_dump_json(),
        ex=settings.DEVICE_AUTH_TTL_MINUTES * 60,
    )
