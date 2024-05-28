import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_first_superuser
from app.api.utils.teams import verify_and_generate_slug_name
from app.core.security import get_password_hash, verify_password
from app.models import (
    EmailVerificationToken,
    Message,
    Role,
    Team,
    UpdatePassword,
    UserCreate,
    UserPublic,
    UserRegister,
    UserTeamLink,
    UserUpdateMe,
)
from app.utils import (
    generate_verification_email,
    generate_verification_email_token,
    send_email,
    verify_email_verification_token,
)

router = APIRouter()


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    """
    Update own user.
    """

    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.patch("/me/password", response_model=Message)
def update_password_me(
    *, session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    """
    Update own password.
    """
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    session.commit()
    return Message(message="Password updated successfully")


@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    session.delete(current_user)
    session.commit()
    return Message(message="User deleted successfully")


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user


@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    """
    Create new user without the need to be logged in.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user_create = UserCreate.model_validate(user_in)
    user = crud.create_user(session=session, user_create=user_create, is_verified=False)

    # TODO: uncomment when email service is ready
    # if not settings.emails_enabled:
    #     raise HTTPException(status_code=500, detail="No email configuration provided")

    token = generate_verification_email_token(email=user_in.email)
    email_data = generate_verification_email(email_to=user_in.email, token=token)
    send_email(
        email_to=user_in.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return user


@router.post("/verify-email")
def verify_email_token(session: SessionDep, payload: EmailVerificationToken) -> Any:
    """
    Verify email token
    """
    email = verify_email_verification_token(token=payload.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        logging.error(
            "User with requested token was not found", extra={"token": payload.token}
        )
        raise HTTPException(status_code=400, detail="Invalid token")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    user.is_verified = True
    team_slug = verify_and_generate_slug_name(session=session, name=user.username)
    team = Team(name=user.full_name, slug=team_slug)
    user_team_link = UserTeamLink(team=team, user=user, role=Role.admin)

    session.add(user)
    session.add(user_team_link)
    session.commit()
    return Message(message="Email successfully verified")


@router.post(
    "/verify-email-html-content/{email}",
    dependencies=[Depends(get_first_superuser)],
    response_class=HTMLResponse,
)
def verify_email_html_content(email: str, session: SessionDep) -> Any:
    """
    HTML Content for Email verification email
    """
    user = crud.get_user_by_email(session=session, email=email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )

    token = generate_verification_email_token(email=email)
    email_data = generate_verification_email(email_to=email, token=token)
    return HTMLResponse(
        content=email_data.html_content, headers={"subject:": email_data.subject}
    )
