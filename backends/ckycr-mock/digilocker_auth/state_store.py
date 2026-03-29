import json
import time
from typing import Any, Optional

try:
    import redis.asyncio as redis_async
except Exception:  # pragma: no cover - optional dependency
    redis_async = None


class InMemoryStateStore:
    def __init__(self, default_ttl_seconds: int = 600):
        self._store = {}
        self._default_ttl_seconds = default_ttl_seconds

    async def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds or self._default_ttl_seconds
        self._store[key] = (value, time.time() + ttl)

    async def get(self, key: str) -> Optional[Any]:
        entry = self._store.get(key)
        if not entry:
            return None
        value, expires_at = entry
        if time.time() > expires_at:
            self._store.pop(key, None)
            return None
        return value

    async def delete(self, key: str) -> None:
        self._store.pop(key, None)


class RedisStateStore:
    def __init__(
        self,
        redis_url: Optional[str] = None,
        redis_client=None,
        default_ttl_seconds: int = 600,
    ):
        if redis_client is None:
            if redis_async is None:
                raise RuntimeError('redis package is required for RedisStateStore')
            if not redis_url:
                raise ValueError('redis_url is required when redis_client is not provided')
            self._redis = redis_async.from_url(redis_url, decode_responses=True)
            self._owns_client = True
        else:
            self._redis = redis_client
            self._owns_client = False
        self._default_ttl_seconds = default_ttl_seconds

    async def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds or self._default_ttl_seconds
        payload = json.dumps(value)
        await self._redis.set(key, payload, ex=ttl)

    async def get(self, key: str) -> Optional[Any]:
        payload = await self._redis.get(key)
        if payload is None:
            return None
        try:
            return json.loads(payload)
        except json.JSONDecodeError:
            return payload

    async def delete(self, key: str) -> None:
        await self._redis.delete(key)

    async def close(self) -> None:
        if self._owns_client:
            await self._redis.close()
