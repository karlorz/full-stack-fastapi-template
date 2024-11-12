from collections.abc import Generator
from typing import Annotated, Any

import jwt
import redis
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session

from app.core import security
from app.core.config import (
    MainSettings,
)
from app.core.db import engine
from app.models import TokenPayload, User
from app.utils import TokenType

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{MainSettings.get_settings().API_V1_STR}/login/access-token"
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_redis() -> Generator["redis.Redis[Any]", None, None]:
    settings = MainSettings.get_settings()
    pool = redis.ConnectionPool(
        host=settings.REDIS_SERVER,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB,
        password=settings.REDIS_PASSWORD,
    )

    redis_instance = redis.Redis(connection_pool=pool)

    try:
        yield redis_instance
    finally:
        redis_instance.close()


RedisDep = Annotated["redis.Redis[Any]", Depends(get_redis)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    settings = MainSettings.get_settings()
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    splitted_sub = token_data.sub.split("-", maxsplit=1) if token_data.sub else []
    if len(splitted_sub) == 0 or splitted_sub[0] != TokenType.user:
        raise HTTPException(
            status_code=404, detail="The token is not a valid user token"
        )
    user = session.get(User, splitted_sub[1])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_first_superuser(current_user: CurrentUser) -> User:
    settings = MainSettings.get_settings()
    if current_user.email != settings.FIRST_SUPERUSER:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough permissions to execute this action",
        )

    return current_user


def _rate_limit_per_minute(request: Request, redis: RedisDep, limit: int) -> None:
    host_ip = request.client and request.client.host or "unknown"
    current_path = request.url.path

    key = f"rate_limit:{host_ip}:{current_path}"
    value = redis.incr(key)
    redis.expire(key, time=60, nx=True)

    if value > limit:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")


def rate_limit_5_per_minute(request: Request, redis: RedisDep) -> None:
    return _rate_limit_per_minute(request, redis, 5)


def rate_limit_20_per_minute(request: Request, redis: RedisDep) -> None:
    return _rate_limit_per_minute(request, redis, 20)
