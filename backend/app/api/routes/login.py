from datetime import timedelta
from typing import Annotated, Any, Literal

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    Form,
    HTTPException,
    Request,
    status,
)
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app import crud
from app.api.deps import (
    CurrentUser,
    PosthogDep,
    PosthogProperties,
    RedisDep,
    SessionDep,
    rate_limit_5_per_minute,
    rate_limit_20_per_minute,
)
from app.core import security
from app.core.config import MainSettings
from app.core.exceptions import OAuth2Exception
from app.core.security import get_password_hash
from app.models import Message, NewPassword, Token, UserMePublic, UserPublic
from app.utils import (
    authorize_device_code,
    create_and_store_device_code,
    generate_password_reset_token,
    generate_reset_password_email,
    generate_user_code,
    get_datetime_utc,
    get_device_authorization_data,
    get_device_authorization_data_by_user_code,
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
    settings = MainSettings.get_settings()
    user = crud.authenticate(
        session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user"
        )
    elif not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified"
        )

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


@router.post(
    "/login/device/authorization", dependencies=[Depends(rate_limit_5_per_minute)]
)
async def device_authorization(
    client_id: Annotated[str, Form()],
    redis: RedisDep,
    request: Request,
) -> DeviceAuthorizationResponse:
    """
    Device Authorization Grant
    """
    settings = MainSettings.get_settings()
    user_code = generate_user_code()
    request_ip = request.client.host if request.client else None

    device_code = create_and_store_device_code(
        user_code=user_code, request_ip=request_ip, client_id=client_id, redis=redis
    )

    verification_uri = f"{settings.FRONTEND_HOST}/device"
    verification_uri_complete = f"{verification_uri}?code={user_code}"

    return DeviceAuthorizationResponse(
        device_code=str(device_code),
        user_code=str(user_code),
        verification_uri=verification_uri,
        verification_uri_complete=verification_uri_complete,
        expires_in=settings.DEVICE_AUTH_TTL_MINUTES * 60,
        interval=settings.DEVICE_AUTH_POLL_INTERVAL_SECONDS,
    )


class DeviceAuthorizationInfo(BaseModel):
    device_code: str
    created_at: str
    request_ip: str | None


@router.get(
    "/login/device/authorization/{user_code}",
    dependencies=[Depends(rate_limit_5_per_minute)],
)
async def device_authorization_info(
    user_code: str,
    redis: RedisDep,
) -> DeviceAuthorizationInfo:
    """
    Get device authorization info
    """
    auth_data = get_device_authorization_data_by_user_code(user_code, redis)

    if auth_data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    return DeviceAuthorizationInfo(
        device_code=auth_data.device_code,
        created_at=auth_data.created_at.isoformat(),
        request_ip=auth_data.request_ip,
    )


@router.post(
    "/login/device/token",
    response_model=Token,
    dependencies=[Depends(rate_limit_20_per_minute)],
)
async def login_token(
    client_id: Annotated[str, Form()],
    device_code: Annotated[str, Form()],
    grant_type: Annotated[  # noqa: ARG001
        Literal["urn:ietf:params:oauth:grant-type:device_code"], Form()
    ],
    redis: RedisDep,
) -> Any:
    auth_data = get_device_authorization_data(device_code, redis=redis)

    if auth_data is None or auth_data.client_id != client_id:
        raise OAuth2Exception(
            error="invalid_request",
            error_description="Invalid device code",
        )

    now = get_datetime_utc()

    if now > auth_data.expires_at:
        raise OAuth2Exception(
            error="expired_token",
            error_description="Device code expired",
        )

    if auth_data.status == "pending":
        raise OAuth2Exception(error="authorization_pending")

    assert auth_data.status == "authorized"

    return Token(access_token=auth_data.access_token)


class AuthorizeDeviceIn(BaseModel):
    user_code: str


@router.post("/login/device/authorize")
async def authorize_device(
    data: AuthorizeDeviceIn,
    current_user: CurrentUser,
    redis: RedisDep,
    background_tasks: BackgroundTasks,
    posthog: PosthogDep,
    posthog_properties: PosthogProperties,
) -> Any:
    settings = MainSettings.get_settings()
    device_data = get_device_authorization_data_by_user_code(data.user_code, redis)

    if device_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Code not found"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = security.create_access_token(
        current_user.id, expires_delta=access_token_expires
    )

    authorize_device_code(device_data.device_code, access_token, redis)

    background_tasks.add_task(
        posthog.capture,
        "device_authorized",
        distinct_id=current_user.id,
        properties={
            "device_code": device_data.device_code,
            **posthog_properties,
        },
    )

    return {"success": True}


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
    settings = MainSettings.get_settings()
    user = crud.get_user_by_email(session=session, email=email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this email does not exist in the system.",
        )
    password_reset_token = generate_password_reset_token(email=email)
    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )
    if not settings.emails_enabled:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No email service configured",
        )
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this email does not exist in the system.",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user"
        )
    hashed_password = get_password_hash(password=body.new_password)
    user.hashed_password = hashed_password
    session.add(user)
    session.commit()
    return Message(message="Password updated successfully")
