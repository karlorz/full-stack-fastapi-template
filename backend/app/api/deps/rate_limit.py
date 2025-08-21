from typing import cast

from fastapi import HTTPException, Request

from .redis import RedisDep


def _rate_limit_per_minute(request: Request, redis: RedisDep, limit: int) -> None:
    host_ip = request.client and request.client.host or "unknown"
    current_path = request.url.path

    key = f"rate_limit:{host_ip}:{current_path}"
    value = cast(int, redis.incr(key))
    redis.expire(key, time=60, nx=True)

    if value > limit:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")


def rate_limit_5_per_minute(request: Request, redis: RedisDep) -> None:
    return _rate_limit_per_minute(request, redis, 5)


def rate_limit_20_per_minute(request: Request, redis: RedisDep) -> None:
    return _rate_limit_per_minute(request, redis, 20)
