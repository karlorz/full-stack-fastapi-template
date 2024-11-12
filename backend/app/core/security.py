from datetime import timedelta
from typing import Any

import jwt
from passlib.context import CryptContext

from app.core.config import MainSettings
from app.utils import TokenType, get_datetime_utc

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


ALGORITHM = "HS256"


def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    settings = MainSettings.get_settings()
    expire = get_datetime_utc() + expires_delta
    to_encode = {"exp": expire, "sub": f"{TokenType.user.value}-{subject}"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
