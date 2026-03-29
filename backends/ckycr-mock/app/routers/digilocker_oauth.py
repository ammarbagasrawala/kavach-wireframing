"""DigiLocker OAuth (digilocker-auth): start, callback, mock, one-time exchange."""

from __future__ import annotations

import logging
import secrets
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse

from app.config import settings
from app.digilocker_import import ensure_digilocker_auth_path
from app.ephemeral_store import ephemeral_store

logger = logging.getLogger(__name__)
router = APIRouter(tags=["digilocker-oauth"])

ensure_digilocker_auth_path()

from digilocker_auth import DigilockerClient  # noqa: E402
from digilocker_auth import InMemoryStateStore  # noqa: E402

_oauth_state_store = None
_dl_client = None

EXCHANGE_PREFIX = "kavach:dl_exchange:"
EXCHANGE_TTL = 300


def get_oauth_state_store():
    global _oauth_state_store
    if _oauth_state_store is not None:
        return _oauth_state_store
    if settings.redis_url:
        from digilocker_auth import RedisStateStore

        try:
            _oauth_state_store = RedisStateStore(redis_url=settings.redis_url, default_ttl_seconds=600)
        except Exception as exc:
            logger.warning("Redis state store unavailable, using memory: %s", exc)
            _oauth_state_store = InMemoryStateStore(default_ttl_seconds=600)
    else:
        _oauth_state_store = InMemoryStateStore(default_ttl_seconds=600)
    return _oauth_state_store


def _client() -> DigilockerClient:
    global _dl_client
    if _dl_client is None:
        _dl_client = DigilockerClient(
            client_id=settings.digilocker_client_id or "mock",
            client_secret=settings.digilocker_client_secret,
            redirect_uri=settings.digilocker_redirect_uri,
            base_url=settings.digilocker_base_url,
            mock_mode=settings.digilocker_mock,
            mock_authorize_url=settings.digilocker_mock_authorize_url,
        )
    return _dl_client


def _mask_mobile(mobile: str) -> str:
    d = "".join(c for c in mobile if c.isdigit())
    if len(d) < 4:
        return "**********"
    return "**********" + d[-4:]


@router.get("/auth/digilocker/start")
async def digilocker_start(request: Request):
    client = _client()
    store = get_oauth_state_store()
    return_to = request.query_params.get("return_to")
    auth = await client.create_authorization_request(
        {
            "scope": settings.digilocker_scope,
            "dl_flow": settings.digilocker_flow,
            "verified_mobile": settings.digilocker_verified_mobile,
        },
        store,
    )
    if return_to:
        await ephemeral_store.set_json(
            f"kavach:dl_return:{auth['state']}",
            {"return_to": return_to},
            ttl_seconds=600,
        )
    return RedirectResponse(auth["url"])


@router.get("/auth/digilocker/callback")
async def digilocker_callback(request: Request):
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    return_to = request.query_params.get("return_to")
    if not return_to and state:
        blob = await ephemeral_store.getdel_json(f"kavach:dl_return:{state}")
        if blob and isinstance(blob, dict):
            return_to = blob.get("return_to")

    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")

    client = _client()
    store = get_oauth_state_store()
    try:
        tokens = await client.handle_callback(code, state, store)
    except Exception as exc:
        logger.warning("DigiLocker token exchange failed: %s", type(exc).__name__)
        raise HTTPException(status_code=400, detail="DigiLocker authentication failed") from exc

    profile = None
    try:
        profile = await client.get_user_details(tokens["access_token"])
    except Exception as exc:
        logger.warning("DigiLocker user profile fetch failed: %s", type(exc).__name__)

    exchange_code = secrets.token_urlsafe(32)
    await ephemeral_store.set_json(
        f"{EXCHANGE_PREFIX}{exchange_code}",
        {"tokens": tokens, "profile": profile or {}},
        ttl_seconds=EXCHANGE_TTL,
    )

    target = (return_to or settings.digilocker_frontend_redirect).strip()
    join = "&" if "?" in target else "?"
    redirect_url = f"{target}{join}exchange_code={exchange_code}&digilocker=1"

    return RedirectResponse(redirect_url)


@router.get("/auth/digilocker/mock")
async def digilocker_mock(request: Request):
    state = request.query_params.get("state") or "mock_state"
    redirect_uri = request.query_params.get(
        "redirect_uri",
        settings.digilocker_redirect_uri,
    )
    code = request.query_params.get("code", "mock_code")
    target = f"{redirect_uri}?code={code}&state={state}&mock=1"
    return RedirectResponse(target)


@router.get("/auth/digilocker/exchange")
async def digilocker_exchange(exchange_code: str):
    if not exchange_code:
        raise HTTPException(status_code=400, detail="exchange_code required")
    payload = await ephemeral_store.getdel_json(f"{EXCHANGE_PREFIX}{exchange_code}")
    if not payload:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": {"code": "invalid_exchange", "message": "Invalid or expired exchange code"},
            },
        )

    profile = payload.get("profile") or {}
    mobile = str(profile.get("mobile") or "")
    masked = {
        "masked_mobile": _mask_mobile(mobile),
        "digilocker_mock": bool(profile.get("mock")),
        "connected": True,
    }
    # Do not return name, email, full mobile, or tokens
    return {"success": True, "data": masked}
