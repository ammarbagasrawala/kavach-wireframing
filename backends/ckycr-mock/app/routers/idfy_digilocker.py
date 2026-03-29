"""IDfy DigiLocker document fetch (optional). Webhook payloads stored in Redis/memory only — no disk."""

from __future__ import annotations

import logging
import os
import uuid
from typing import Any
from urllib.parse import parse_qsl, urlencode

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

from app.config import settings
from app.ephemeral_store import ephemeral_store

logger = logging.getLogger(__name__)
router = APIRouter(tags=["idfy-digilocker"])

IDFY_API_URL = "https://eve.idfy.com/v3/tasks/sync/verify_with_source/ind_digilocker_fetch_documents"
RESULT_PREFIX = "kavach:idfy_result:"
META_PREFIX = "kavach:idfy_meta:"


class StartIdfyDigilockerRequest(BaseModel):
    reference_id: str | None = None
    redirect_url: str | None = None  # ignored for IDfy payload; use wireframe_return_path + idfy_doc
    wireframe_return_path: str | None = None  # e.g. /create-vc or /bank
    # Extra query for the 302 back to Next (e.g. step=2&from_idfy=1) — no leading "?"
    wireframe_return_search: str | None = None
    idfy_doc: str | None = None  # "pan" | "aadhaar" — used for 302 back to Next.js
    doc_type: str | list[str] | None = "ADHAR"
    extra_fields: dict[str, Any] = Field(default_factory=dict)


class StartIdfyDigilockerResponse(BaseModel):
    task_id: str
    redirect_url: str


def _idfy_enabled() -> bool:
    return bool(settings.enable_idfy_digilocker and settings.idfy_account_id and settings.idfy_api_key)


def _webhook_base() -> str:
    runtime = os.environ.get("KAVACH_IDFY_PUBLIC_BASE")
    if runtime:
        return runtime.rstrip("/")
    static = (settings.idfy_webhook_base_url or "http://127.0.0.1:8000").rstrip("/")
    if "YOUR_SUBDOMAIN" in static or "YOUR_TUNNEL" in static:
        return "http://127.0.0.1:8000"
    return static


def _infer_idfy_doc(request_data: StartIdfyDigilockerRequest | None) -> str:
    if request_data and request_data.idfy_doc:
        return request_data.idfy_doc.strip().lower()
    dt = request_data.doc_type if request_data else "ADHAR"
    if isinstance(dt, list):
        dt = dt[0] if dt else "ADHAR"
    if isinstance(dt, str) and dt.upper() == "ADHAR":
        return "aadhaar"
    return "pan"


def _wireframe_path(request_data: StartIdfyDigilockerRequest | None) -> str:
    p = (request_data.wireframe_return_path if request_data else None) or "/create-vc"
    p = (p or "/create-vc").strip() or "/create-vc"
    if not p.startswith("/"):
        p = "/" + p
    return p


def _norm_return_search(s: str | None) -> str | None:
    if not s:
        return None
    t = s.strip()
    if t.startswith("?"):
        t = t[1:].strip()
    return t or None


def merge_wireframe_return_url(
    path: str,
    task_id: str,
    idfy_doc: str,
    extra_search: str | None,
) -> str:
    """Build path?idfy_task=…&idfy_doc=… plus optional client params (step, from_idfy, …)."""
    pairs: list[tuple[str, str]] = [("idfy_task", task_id), ("idfy_doc", idfy_doc)]
    used = {"idfy_task", "idfy_doc"}
    extra = _norm_return_search(extra_search)
    if extra:
        for k, v in parse_qsl(extra, keep_blank_values=True):
            if k in used:
                continue
            pairs.append((k, v))
            used.add(k)
    return f"{path}?{urlencode(pairs)}"


def _browser_redirect_after_idfy(task_id: str) -> str:
    """IDfy must redirect to our public HTTPS base (ngrok) — same pattern as DIGILOCKER_PAN_ADHAAR_FLOW/main.py."""
    webhook_base = _webhook_base()
    return f"{webhook_base}/integrations/idfy/return?task_id={task_id}"


def _ensure_https_public_base_for_idfy() -> str:
    """
    IDfy rejects http://127.0.0.1 (and similar) for redirect_url; you get HTTP 400 without a clear message.
    """
    wb = _webhook_base()
    if wb.lower().startswith("https://"):
        return wb
    raise HTTPException(
        status_code=503,
        detail=(
            "HTTPS public base required for IDfy (redirect_url / callback_url). "
            "Set IDFY_WEBHOOK_BASE_URL=https://… in DIGILOCKER_PAN_ADHAAR_FLOW/.env or repo .env, "
            "or fix ngrok (USE_NGROK, NGROK_AUTHTOKEN, optional NGROK_DOMAIN). "
            "If you see ERR_NGROK_334, use IDFY_WEBHOOK_BASE_URL as fallback. See README_DEV."
        ),
    )


def _idfy_task_data_dict(
    request_data: StartIdfyDigilockerRequest | None,
    task_id: str,
    callback_url: str,
) -> dict[str, Any]:
    """Build IDfy `data` object; omit null key_id/ou_id/secret so we do not send JSON nulls."""
    ref = (
        request_data.reference_id if request_data and request_data.reference_id else str(uuid.uuid4())
    )
    doc_type = request_data.doc_type if request_data else "ADHAR"
    extra = request_data.extra_fields if request_data and request_data.extra_fields else {}
    data: dict[str, Any] = {
        "version": "2",
        "reference_id": ref,
        "callback_url": callback_url,
        "doc_type": doc_type,
        "file_format": "xml",
        "redirect_url": _browser_redirect_after_idfy(task_id),
        "consent": "Y",
        "extra_fields": extra,
    }
    if settings.idfy_key_id:
        data["key_id"] = settings.idfy_key_id
    if settings.idfy_ou_id:
        data["ou_id"] = settings.idfy_ou_id
    if settings.idfy_secret:
        data["secret"] = settings.idfy_secret
    return data


@router.get("/integrations/idfy/public-base")
async def idfy_public_base():
    """Dev helper: current public base used for IDfy (ngrok or static IDFY_WEBHOOK_BASE_URL)."""
    return {"public_base": _webhook_base(), "ngrok_active": bool(os.environ.get("KAVACH_IDFY_PUBLIC_BASE"))}


@router.post("/integrations/idfy/start-digilocker", response_model=StartIdfyDigilockerResponse)
async def start_digilocker(request_data: StartIdfyDigilockerRequest | None = None):
    if not _idfy_enabled():
        raise HTTPException(status_code=503, detail="IDfy DigiLocker integration is disabled or misconfigured")

    account_id = settings.idfy_account_id
    api_key = settings.idfy_api_key
    webhook_base = _ensure_https_public_base_for_idfy()

    task_id = str(uuid.uuid4())
    group_id = str(uuid.uuid4())

    await ephemeral_store.set_json(
        f"{META_PREFIX}{task_id}",
        {
            "idfy_doc": _infer_idfy_doc(request_data),
            "wireframe_return_path": _wireframe_path(request_data),
            "wireframe_return_search": _norm_return_search(
                request_data.wireframe_return_search if request_data else None
            ),
        },
        ttl_seconds=settings.idfy_result_ttl_seconds,
    )

    callback_url = settings.idfy_webhook_url
    if not callback_url:
        callback_url = f"{webhook_base}/integrations/idfy/webhook?idfy_task_id={task_id}"

    payload = {
        "task_id": task_id,
        "group_id": group_id,
        "data": _idfy_task_data_dict(request_data, task_id, callback_url),
    }

    headers = {
        "Content-Type": "application/json",
        "account-id": account_id,
        "api-key": api_key,
    }

    logger.info("IDfy DigiLocker flow started task_id=%s webhook_base=%s", task_id, webhook_base)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(IDFY_API_URL, json=payload, headers=headers, timeout=15.0)
            response.raise_for_status()
            response_data = response.json()
        except httpx.HTTPStatusError as e:
            body = (e.response.text or "").strip()
            logger.error("IDfy API error: %s body=%s", e.response.status_code, body[:4000])
            detail = f"IDfy API error ({e.response.status_code})"
            if body:
                detail = f"{detail}: {body[:800]}"
            raise HTTPException(status_code=e.response.status_code, detail=detail) from e
        except Exception as e:
            logger.error("IDfy request failed: %s", type(e).__name__)
            raise HTTPException(status_code=500, detail="IDfy request failed") from e

    redirect_url = response_data.get("redirect_url") or response_data.get("capture_link")
    if not redirect_url and "data" in response_data:
        redirect_url = response_data["data"].get("redirect_url") or response_data["data"].get("capture_link")
    if not redirect_url and "result" in response_data and "source_output" in response_data["result"]:
        redirect_url = response_data["result"]["source_output"].get("redirect_url")
    if not redirect_url:
        logger.warning("IDfy response missing redirect_url")
        redirect_url = ""

    return StartIdfyDigilockerResponse(task_id=task_id, redirect_url=redirect_url)


@router.post("/integrations/idfy/webhook")
async def idfy_webhook(request: Request, idfy_task_id: str | None = None):
    if not _idfy_enabled():
        return {"status": "ignored"}

    try:
        payload = await request.json()
    except Exception:
        return {"status": "error", "message": "invalid json"}

    task_id = idfy_task_id or request.query_params.get("idfy_task_id")
    if not task_id:
        task_id = payload.get("task_id")
    if not task_id and "data" in payload:
        task_id = payload["data"].get("task_id")

    if task_id:
        await ephemeral_store.set_json(
            f"{RESULT_PREFIX}{task_id}",
            {"payload": payload},
            ttl_seconds=settings.idfy_result_ttl_seconds,
        )
        logger.info("IDfy webhook stored for task_id=%s", task_id)
        return {"status": "received"}
    logger.warning("IDfy webhook without task_id")
    return {"status": "error", "message": "missing task_id"}


@router.get("/integrations/idfy/result/{task_id}")
async def get_idfy_result(task_id: str):
    """
    Poll for webhook completion. Returns success envelope with task data when ready.
    """
    if not task_id:
        raise HTTPException(status_code=400, detail="task_id required")
    data = await ephemeral_store.get_json(f"{RESULT_PREFIX}{task_id}")
    if not data:
        return {
            "success": True,
            "data": {"status": "pending", "task_id": task_id},
        }
    return {
        "success": True,
        "data": {"status": "completed", "task_id": task_id, "result": data.get("payload")},
    }


@router.get("/integrations/idfy/return")
async def idfy_return(task_id: str | None = None):
    """
    Browser landing after IDfy/DigiLocker — 302 to wireframe so polling + UI state stay in sync.
    """
    if not task_id:
        return {"success": False, "error": {"code": "missing_task", "message": "task_id query required"}}

    meta = await ephemeral_store.get_json(f"{META_PREFIX}{task_id}")
    idfy_doc = "pan"
    path = "/create-vc"
    extra_search: str | None = None
    if isinstance(meta, dict):
        idfy_doc = meta.get("idfy_doc") or idfy_doc
        path = meta.get("wireframe_return_path") or path
        extra_search = meta.get("wireframe_return_search")
        if isinstance(extra_search, str):
            extra_search = _norm_return_search(extra_search)
        else:
            extra_search = None
    if not path.startswith("/"):
        path = "/" + path

    base = (settings.kavach_wireframe_origin or "http://localhost:3000").rstrip("/")
    dest = f"{base}{merge_wireframe_return_url(path, task_id, idfy_doc, extra_search)}"
    return RedirectResponse(url=dest, status_code=302)
