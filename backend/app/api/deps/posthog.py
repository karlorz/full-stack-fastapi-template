from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, Header, Request
from posthog import Posthog

from app.core.config import MainSettings


def posthog_client() -> Generator[Posthog, None, None]:
    settings = MainSettings.get_settings()

    assert settings.POSTHOG_API_KEY

    client = Posthog(
        settings.POSTHOG_API_KEY,
        settings.POSTHOG_HOST,
        disabled=not settings.posthog_enabled,
        # Explicitly disable the send parameter when PostHog is disabled to prevent
        # background thread creation. Even when PostHog is disabled via the 'disabled'
        # parameter, the client still spawns worker threads to handle event processing.
        # Since we're not actually sending events during testing, these threads serve
        # no purpose and can cause test jobs to hang indefinitely when they get stuck
        # waiting for work. By setting send=False, we prevent thread creation entirely,
        # ensuring clean test execution and avoiding hanging test suites.
        send=settings.posthog_enabled,
    )

    yield client


PosthogDep = Annotated[Posthog, Depends(posthog_client)]


def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("X-Forwarded-For")

    if forwarded_for:
        return forwarded_for.split(",")[0]

    assert request.client

    return request.client.host


def posthog_properties(
    client_ip: Annotated[str, Depends(get_client_ip)],
    user_agent: Annotated[str, Header(include_in_schema=False)],
) -> dict[str, str]:
    return {
        "$raw_user_agent": user_agent,
        "$ip": client_ip,
    }


PosthogProperties = Annotated[dict[str, str], Depends(posthog_properties)]
