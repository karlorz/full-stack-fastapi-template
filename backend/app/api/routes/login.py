from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app import crud
from app.api.deps import CurrentUser, RedisDep, SessionDep, get_first_superuser
from app.core import security
from app.core.config import settings
from app.core.security import get_password_hash
from app.models import Message, NewPassword, Token, UserMePublic, UserPublic
from app.utils import (
    create_and_store_device_code,
    generate_password_reset_token,
    generate_reset_password_email,
    generate_user_code,
    send_email,
    verify_password_reset_token,
)

router = APIRouter()


class AccessTokenWithUserMe(Token):
    user: UserMePublic


@router.post("/login/access-token")
def login_access_token(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> AccessTokenWithUserMe:
    """
    OAuth2 compatible token login, get the access token and the user data
    """
    user = crud.authenticate(
        session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    elif not user.is_verified:
        raise HTTPException(status_code=400, detail="Email not verified")

    # The user is authenticated, now generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    assert user.personal_team

    user_data = UserMePublic(
        **user.model_dump(),
        personal_team_slug=user.personal_team.slug,
    )

    return AccessTokenWithUserMe(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        user=user_data,
    )


class DeviceAuthorizationResponse(BaseModel):
    device_code: str
    user_code: str
    verification_uri: str
    verification_uri_complete: str
    expires_in: int
    interval: int


@router.post("/login/device/authorization")
async def device_authorization(
    client_id: Annotated[str, Form()],
    redis: RedisDep,
) -> DeviceAuthorizationResponse:
    """
    Device Authorization Grant
    """
    user_code = generate_user_code()

    device_code = create_and_store_device_code(user_code, client_id, redis)

    verification_uri = f"{settings.server_host}/device"
    verification_uri_complete = f"{verification_uri}?code={user_code}"

    return DeviceAuthorizationResponse(
        device_code=str(device_code),
        user_code=str(user_code),
        verification_uri=verification_uri,
        verification_uri_complete=verification_uri_complete,
        expires_in=settings.DEVICE_AUTH_TTL_MINUTES * 60,
        interval=settings.DEVICE_AUTH_POLL_INTERVAL_SECONDS,
    )


@router.post("/login/test-token", response_model=UserPublic)
def test_token(current_user: CurrentUser) -> Any:
    """
    Test access token
    """
    return current_user


@router.post("/password-recovery/{email}")
def recover_password(email: str, session: SessionDep) -> Message:
    """
    Password Recovery
    """
    user = crud.get_user_by_email(session=session, email=email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    password_reset_token = generate_password_reset_token(email=email)
    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )
    if not settings.emails_enabled:
        raise HTTPException(status_code=500, detail="No email provided")
    send_email(
        email_to=user.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Password recovery email sent")


@router.post("/reset-password/")
def reset_password(session: SessionDep, body: NewPassword) -> Message:
    """
    Reset password
    """
    email = verify_password_reset_token(token=body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    hashed_password = get_password_hash(password=body.new_password)
    user.hashed_password = hashed_password
    session.add(user)
    session.commit()
    return Message(message="Password updated successfully")


@router.post(
    "/password-recovery-html-content/{email}",
    dependencies=[Depends(get_first_superuser)],
    response_class=HTMLResponse,
)
def recover_password_html_content(email: str, session: SessionDep) -> Any:
    """
    HTML Content for Password Recovery
    """
    user = crud.get_user_by_email(session=session, email=email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )
    password_reset_token = generate_password_reset_token(email=email)
    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )

    return HTMLResponse(
        content=email_data.html_content, headers={"subject:": email_data.subject}
    )
