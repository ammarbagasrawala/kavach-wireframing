"""Redis-backed ephemeral JSON blobs with in-memory fallback (dev)."""

from __future__ import annotations

import json
import time
from typing import Any

from app.config import settings

_redis_client = None


async def _redis():
    global _redis_client
    if not settings.redis_url:
        return None
    if _redis_client is None:
        import redis.asyncio as redis_async

        _redis_client = redis_async.from_url(settings.redis_url, decode_responses=True)
    return _redis_client


class EphemeralJsonStore:
    """SET/GET/DEL JSON with TTL; supports getdel for one-time exchange codes."""

    def __init__(self, default_ttl_seconds: int = 3600) -> None:
        self._mem: dict[str, tuple[Any, float]] = {}
        self._default_ttl = default_ttl_seconds

    async def set_json(self, key: str, value: Any, ttl_seconds: int | None = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl
        r = await _redis()
        if r:
            await r.set(key, json.dumps(value), ex=ttl)
            return
        self._mem[key] = (value, time.time() + ttl)

    async def get_json(self, key: str) -> Any | None:
        r = await _redis()
        if r:
            raw = await r.get(key)
            if raw is None:
                return None
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                return None
        entry = self._mem.get(key)
        if not entry:
            return None
        value, exp = entry
        if time.time() > exp:
            self._mem.pop(key, None)
            return None
        return value

    async def delete(self, key: str) -> None:
        r = await _redis()
        if r:
            await r.delete(key)
            return
        self._mem.pop(key, None)

    async def getdel_json(self, key: str) -> Any | None:
        r = await _redis()
        if r:
            raw = await r.get(key)
            if raw is None:
                return None
            await r.delete(key)
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                return None
        val = await self.get_json(key)
        if val is not None:
            await self.delete(key)
        return val


ephemeral_store = EphemeralJsonStore()
