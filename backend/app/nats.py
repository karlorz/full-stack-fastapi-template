import asyncio
import secrets
from collections.abc import AsyncGenerator
from datetime import datetime
from typing import Annotated
from uuid import UUID

import nats
from asyncer import syncify
from fastapi import Depends
from nats.aio.client import Client
from nats.js import JetStreamContext
from nats.js.errors import FetchTimeoutError
from pydantic import AliasPath, BaseModel, Field

from app.core.config import CommonSettings

common_settings = CommonSettings.get_settings()


async def make_nats_client() -> Client:
    nc = await nats.connect(
        common_settings.NATS_HOST_NAME,
        user_credentials=common_settings.NATS_CREDS,
        name=f"fastapicloud-{secrets.token_hex(4)}",
    )
    return nc


def get_jetstream_app_logs_subscribe_subject(*, team_slug: str, app_slug: str) -> str:
    return f"logs.apps.{team_slug}.{app_slug}.>"


def get_jetstream_deployment_logs_subject(
    *, team_slug: str, app_slug: str, deployment_id: str | UUID
) -> str:
    return f"logs.apps.{team_slug}.{app_slug}.{deployment_id}"


# Dependencies


async def get_nats_client() -> AsyncGenerator[Client, None]:
    client = await make_nats_client()
    try:
        yield client
    finally:
        await client.close()


NatsDep = Annotated[Client, Depends(get_nats_client)]


async def get_jetstream_context(client: NatsDep) -> JetStreamContext:
    js = client.jetstream()
    return js


JetStreamDep = Annotated[JetStreamContext, Depends(get_jetstream_context)]


class Log(BaseModel):
    team: str | None = Field(
        default=None,
        validation_alias=AliasPath("kubernetes", "pod_labels", "fastapicloud_team"),
    )
    app: str | None = Field(
        default=None,
        validation_alias=AliasPath("kubernetes", "pod_labels", "fastapicloud_app"),
    )
    deployment: UUID | None = Field(
        default=None,
        validation_alias=AliasPath(
            "kubernetes", "pod_labels", "fastapicloud_deployment"
        ),
    )
    timestamp: datetime
    message: str


class LogsResponse(BaseModel):
    logs: list[Log]


def get_logs(*, jetstream: JetStreamContext, subject: str) -> LogsResponse:
    subscription = syncify(jetstream.pull_subscribe)(
        subject=subject, stream=common_settings.NATS_JETSTREAM_NAME
    )
    # The default timeout of 5 seconds would mean it would keep trying, waiting to
    # get the entire batch size of messages (which might not exist), so it would wait
    # for the entire 5 seconds. But a very short timeout, like 0.00001, would make it
    # timeout before getting the first message.
    try:
        messages = syncify(subscription.fetch)(batch=1000, timeout=0.5)
    except (FetchTimeoutError, asyncio.TimeoutError):
        messages = []

    logs: list[Log] = []
    # Last 100 logs
    for msg in list(reversed(messages))[:100]:
        logs.insert(0, Log.model_validate_json(msg.data))

    return LogsResponse(logs=logs)
