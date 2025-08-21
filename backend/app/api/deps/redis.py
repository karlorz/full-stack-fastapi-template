from collections.abc import Generator
from typing import Annotated

import redis
import redis.asyncio
from fastapi import Depends

from app.core.config import CommonSettings


def get_redis() -> Generator[redis.Redis, None, None]:
    settings = CommonSettings.get_settings()
    pool = redis.ConnectionPool.from_url(settings.REDIS_URI)

    redis_instance = redis.Redis(connection_pool=pool)

    try:
        yield redis_instance
    finally:
        redis_instance.close()


RedisDep = Annotated[redis.Redis, Depends(get_redis)]


def get_async_redis() -> Generator[redis.asyncio.Redis, None, None]:
    settings = CommonSettings.get_settings()

    pool = redis.asyncio.ConnectionPool.from_url(
        settings.REDIS_URI, decode_responses=True
    )

    redis_instance = redis.asyncio.Redis(connection_pool=pool)

    yield redis_instance


AsyncRedisDep = Annotated[redis.asyncio.Redis, Depends(get_async_redis)]
