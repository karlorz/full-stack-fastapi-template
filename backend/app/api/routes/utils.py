from typing import cast

from fastapi import APIRouter
from pydantic import BaseModel

from app.api.deps import RedisDep

router = APIRouter()


class HealthCheckResponse(BaseModel):
    redis: bool


@router.get("/health-check/")
async def health_check(redis: RedisDep) -> HealthCheckResponse:
    """
    Health check.
    """
    is_redis_available: bool = False

    try:
        is_redis_available = cast(bool, await redis.ping())
    except Exception:
        pass

    return HealthCheckResponse(redis=is_redis_available)
