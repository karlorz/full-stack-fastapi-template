import secrets
import warnings
from functools import lru_cache
from typing import Annotated, Any, Literal, TypeVar

from pydantic import (
    AnyUrl,
    BeforeValidator,
    HttpUrl,
    PlainSerializer,
    PostgresDsn,
    computed_field,
    model_validator,
)
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Self


def parse_list_or_str(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


def serialize_cors(v: list[AnyUrl]) -> str:
    return ",".join([str(i) for i in v])


def _check_default_secret(var_name: str, value: str | None) -> None:
    if value == "changethis":
        message = (
            f'The value of {var_name} is "changethis", '
            "for security, please change it, at least for deployments."
        )
        if CommonSettings.get_settings().ENVIRONMENT == "local":
            warnings.warn(message, stacklevel=1)
        else:
            raise ValueError(message)


TSettingsEnv = TypeVar("TSettingsEnv", bound="SettingsEnv")


# Put outside of classmethod because mypy chokes on it on the same line, it seems
# lru_cache is hard to type
# Ref: https://github.com/python/mypy/issues/5107
@lru_cache
def _get_single_settings_instance(cls: type[TSettingsEnv]) -> TSettingsEnv:
    return cls()


class SettingsEnv(BaseSettings):
    model_config = SettingsConfigDict(
        # Use top level .env file (one level above ./backend/)
        env_file="../.env",
        env_ignore_empty=True,
        extra="ignore",
    )

    @classmethod
    def get_settings(cls) -> Self:
        return _get_single_settings_instance(cls)  # type: ignore


class CommonSettings(SettingsEnv):
    DEPLOYMENTS_DOMAIN: str = "fastapicloud.club"
    ENVIRONMENT: Literal["local", "development", "staging", "production"] = "local"
    BUILDER_API_KEY: str
    AWS_DEPLOYMENT_BUCKET: str


class DBSettings(SettingsEnv):
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""
    POSTGRES_SSL_ENABLED: bool = False

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        query = "sslmode=require" if self.POSTGRES_SSL_ENABLED else None
        return MultiHostUrl.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
            query=query,
        )

    @model_validator(mode="after")
    def _enforce_non_default_secrets(self) -> Self:
        _check_default_secret("POSTGRES_PASSWORD", self.POSTGRES_PASSWORD)
        return self


class MainSettings(SettingsEnv):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)

    # AUTH
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    DEVICE_AUTH_TTL_MINUTES: int = 5
    DEVICE_AUTH_POLL_INTERVAL_SECONDS: int = 5

    FRONTEND_HOST: str = "http://localhost:5173"

    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str,
        BeforeValidator(parse_list_or_str),
        PlainSerializer(serialize_cors, when_used="json"),
    ] = []

    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [
            self.FRONTEND_HOST
        ]

    PROJECT_NAME: str
    RESERVED_APP_NAMES: Annotated[list[str] | str, BeforeValidator(parse_list_or_str)]
    SENTRY_DSN: HttpUrl | None = None

    REDIS_SERVER: str
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str | None = None
    REDIS_DB: int = 0

    @computed_field  # type: ignore[prop-decorator]
    @property
    def REDIS_URI(self) -> str:
        return f"redis://{self.REDIS_SERVER}:{self.REDIS_PORT}/{self.REDIS_DB}"

    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    SMTP_PORT: int = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    # TODO: update type to EmailStr when sqlmodel supports it
    EMAILS_FROM_EMAIL: str | None = None
    EMAILS_FROM_NAME: str | None = None

    @model_validator(mode="after")
    def _set_default_emails_from(self) -> Self:
        if not self.EMAILS_FROM_NAME:
            self.EMAILS_FROM_NAME = self.PROJECT_NAME
        return self

    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48
    EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS: int = 48
    INVITATION_TOKEN_EXPIRE_HOURS: int = 168  # 7 days

    @computed_field  # type: ignore[prop-decorator]
    @property
    def emails_enabled(self) -> bool:
        return bool(self.SMTP_HOST and self.EMAILS_FROM_EMAIL)

    ALLOWED_SIGNUP_DOMAINS: list[str] = ["example.com"]
    ALLOWED_SIGNUP_EMAILS: list[str] = [
        "esteban@fastapilabs.com",
        "alejandra@fastapilabs.com",
        "sebastian@fastapilabs.com",
        "patrick@fastapilabs.com",
    ]

    ALLOWED_EMAIL_RECIPIENT_DOMAINS: list[str] = ["fastapilabs.com"]

    # TODO: update type to EmailStr when sqlmodel supports it
    EMAIL_TEST_USER: str = "test@example.com"
    # TODO: update type to EmailStr when sqlmodel supports it
    FIRST_SUPERUSER: str
    FIRST_SUPERUSER_PASSWORD: str
    FIRST_SUPERUSER_FULL_NAME: str

    @model_validator(mode="after")
    def _enforce_non_default_secrets(self) -> Self:
        _check_default_secret("SECRET_KEY", self.SECRET_KEY)
        _check_default_secret("FIRST_SUPERUSER_PASSWORD", self.FIRST_SUPERUSER_PASSWORD)

        return self

    EMAILABLE_KEY: str
    BUILDER_API_URL: str


class BuilderSettings(SettingsEnv):
    ECR_REGISTRY_URL: str
    AWS_REGION: str


class DepotSettings(SettingsEnv):
    DEPOT_PROJECT_ID: str
    DEPOT_TOKEN: str
    DEPOT_HOSTNAME: str = "api.depot.dev"


class CloudflareSettings(SettingsEnv):
    CLOUDFLARE_API_TOKEN_SSL: str
    CLOUDFLARE_ACCOUNT_ID: str
    CLOUDFLARE_ZONE_ID: str
