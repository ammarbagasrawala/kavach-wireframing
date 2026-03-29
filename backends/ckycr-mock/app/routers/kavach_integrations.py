"""Kavach-style integration endpoints: CKYCR search JSON wrapper."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from lxml import etree
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.kavach_database import get_kavach_db
from app.kavach_models import KavachAuditLog
from app.services.search_service import process_verify_request
from app.verify_request_builder import (
    build_signed_verify_request_bytes,
    decrypt_response_pid_preview,
    random_request_id,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["kavach-integrations"])


class CkycrSearchIn(BaseModel):
    fi_code: str = Field(..., min_length=1)
    id_type: str = Field(default="C", description="C=PAN, Z=CKYC number, etc.")
    id_no: str = Field(..., min_length=1)
    request_id: str | None = None
    fi_private_key_pem: str | None = None


def _pid_xml_safe_summary(pid_xml: str) -> dict:
    """Extract only non-sensitive / already-masked registry fields for API clients."""
    try:
        root = etree.fromstring(pid_xml.encode("utf-8"))
    except etree.XMLSyntaxError:
        return {"parse_error": True}

    ckyc_nodes = root.findall(".//CKYC_NO")
    ckyc_vals = [n.text.strip() for n in ckyc_nodes if n is not None and n.text and n.text.strip()]
    ref_nodes = root.findall(".//CKYC_REFERENCE_ID")
    ref_vals = [n.text.strip() for n in ref_nodes if n is not None and n.text and n.text.strip()]
    rem_nodes = root.findall(".//REMARKS")
    remarks = next((n.text.strip() for n in rem_nodes if n.text and n.text.strip()), None)

    out: dict = {}
    if ckyc_vals:
        out["ckyc_no_masked"] = ckyc_vals[0] if len(ckyc_vals) == 1 else ckyc_vals
    if ref_vals:
        out["ckyc_reference_id"] = ref_vals[0] if len(ref_vals) == 1 else ref_vals
    if remarks and ("No records" in remarks or "error" in remarks.lower()):
        out["remarks"] = remarks
    return out


@router.post("/integrations/ckycr/search")
def integrations_ckycr_search(
    body: CkycrSearchIn,
    request: Request,
    db: Session = Depends(get_db),
    kdb: Session = Depends(get_kavach_db),
):
    client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else None)
    if client_ip and "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    rid = (body.request_id or "").strip() or random_request_id()
    pem: str | None = None
    if body.fi_private_key_pem and body.fi_private_key_pem.strip():
        if not settings.allow_client_fi_private_key:
            raise HTTPException(403, "Client-supplied FI private key is disabled on this server")
        pem = body.fi_private_key_pem.strip()

    xml_bytes = build_signed_verify_request_bytes(
        body.fi_code.strip(),
        rid,
        body.id_type.strip(),
        body.id_no.strip(),
        fi_private_pem=pem,
    )

    out, status = process_verify_request(db, xml_bytes, None, client_ip=client_ip or "127.0.0.1")

    try:
        kdb.add(
            KavachAuditLog(
                action="CKYCR_SEARCH",
                kavach_id=None,
                ip_address=client_ip,
                status="SUCCESS" if status == 200 else "FAIL",
                message="CKYCR search performed",
                timestamp=datetime.now(timezone.utc),
            )
        )
        kdb.commit()
    except Exception as exc:
        logger.warning("Kavach audit log skipped: %s", exc)
        kdb.rollback()

    if status >= 400:
        err_text = ""
        try:
            err_text = out.decode("utf-8", errors="replace")[:2000]
        except Exception:
            err_text = "error"
        return {
            "success": False,
            "error": {"code": "ckycr_http_error", "message": f"Upstream returned status {status}", "detail": err_text},
        }

    decrypted = ""
    try:
        decrypted = decrypt_response_pid_preview(out, fi_private_pem=pem)
    except Exception as exc:
        return {
            "success": False,
            "error": {"code": "decrypt_failed", "message": str(exc)},
        }

    if not decrypted or "no encrypted PID" in decrypted.lower():
        return {
            "success": False,
            "error": {"code": "no_pid", "message": decrypted or "Empty PID"},
        }

    summary = _pid_xml_safe_summary(decrypted)
    return {
        "success": True,
        "data": {
            "request_id": rid,
            "fi_code": body.fi_code.strip(),
            "registry": summary,
        },
    }
