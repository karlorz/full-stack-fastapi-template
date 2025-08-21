import contextlib

from app.api.deps.redis import get_redis as _get_redis

get_redis = contextlib.contextmanager(_get_redis)


class SecondaryStorage:
    def set(self, key: str, value: str) -> None:
        with get_redis() as redis:
            redis.set(key, value)

    def get(self, key: str) -> str | None:
        with get_redis() as redis:
            return redis.get(key)  # type: ignore

    def delete(self, key: str) -> None:
        with get_redis() as redis:
            redis.delete(key)
