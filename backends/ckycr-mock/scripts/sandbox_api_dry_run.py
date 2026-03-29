#!/usr/bin/env python3
"""
Sandbox dry-run: hit integration + legacy CKYCR APIs; results printed to stdout.
Run with API up: PYTHONPATH=. python scripts/sandbox_api_dry_run.py
Optional: SANDBOX_API_BASE=http://127.0.0.1:8000
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET

try:
    import httpx
except ImportError:
    print("Install httpx: pip install httpx", file=sys.stderr)
    sys.exit(1)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BASE = os.environ.get("SANDBOX_API_BASE", "http://127.0.0.1:8000").rstrip("/")


def report(step: str, ok: bool, detail: dict[str, Any] | None = None) -> bool:
    status = "PASS" if ok else "FAIL"
    extra = f" {json.dumps(detail, default=str)}" if detail else ""
    print(f"[{status}] {step}{extra}")
    return ok


def extract_ckyc_from_pid_xml(xml_str: str) -> list[str]:
    if not xml_str or "CKYC_NO" not in xml_str:
        return []
    try:
        root = ET.fromstring(xml_str)
    except ET.ParseError:
        return []
    return [el.text.strip() for el in root.findall(".//CKYC_NO") if el.text]


def main() -> int:
    if str(PROJECT_ROOT) not in sys.path:
        sys.path.insert(0, str(PROJECT_ROOT))
    from app.verify_request_builder import build_signed_verify_request_bytes, random_request_id

    t0 = time.perf_counter()
    print(f"Sandbox dry-run — base={BASE}")
    failures = 0

    with httpx.Client(timeout=30.0, follow_redirects=False) as client:
        try:
            r = client.get(f"{BASE}/health")
            ok = r.status_code == 200 and r.json().get("status") == "ok"
            if not report("GET /health", ok, {"status_code": r.status_code}):
                failures += 1
        except Exception as e:
            report("GET /health", False, {"error": str(e)})
            print("API unreachable — start uvicorn on BASE.", file=sys.stderr)
            return 1

        demo_body = {
            "fi_code": "IN0106",
            "id_type": "C",
            "id_no": "ABCPA1234F",
            "request_id": "",
        }
        r_demo = client.post(f"{BASE}/api/demo/verify-search", json=demo_body)
        demo_json = r_demo.json() if r_demo.headers.get("content-type", "").startswith("application/json") else {}
        dec = demo_json.get("decrypted_pid_xml") or ""
        legacy_ckyc = extract_ckyc_from_pid_xml(dec) if isinstance(dec, str) else []
        demo_ok = r_demo.status_code == 200 and demo_json.get("http_status") == 200 and bool(legacy_ckyc)
        if not report(
            "POST /api/demo/verify-search",
            demo_ok,
            {"ckyc_records": len(legacy_ckyc)},
        ):
            failures += 1

        int_body = {"fi_code": "IN0106", "id_type": "C", "id_no": "ABCPA1234F"}
        r_int = client.post(f"{BASE}/integrations/ckycr/search", json=int_body)
        int_json = r_int.json() if r_int.headers.get("content-type", "").startswith("application/json") else {}
        reg = int_json.get("data", {}).get("registry") or {}
        int_ckyc = reg.get("ckyc_no_masked")
        if isinstance(int_ckyc, str):
            int_list = [int_ckyc]
        elif isinstance(int_ckyc, list):
            int_list = int_ckyc
        else:
            int_list = []
        overlap = bool(legacy_ckyc and int_list and set(legacy_ckyc) & set(int_list))
        int_ok = r_int.status_code == 200 and int_json.get("success") is True and overlap
        if not report(
            "POST /integrations/ckycr/search",
            int_ok,
            {"semantic_overlap": overlap},
        ):
            failures += 1

        r_start = client.get(f"{BASE}/auth/digilocker/start")
        start_ok = r_start.status_code in (301, 302, 303, 307, 308) and bool(
            r_start.headers.get("location", "")
        )
        if not report(
            "GET /auth/digilocker/start",
            start_ok,
            {"status_code": r_start.status_code},
        ):
            failures += 1

        r_ex = client.get(f"{BASE}/auth/digilocker/exchange", params={"exchange_code": "invalid_test_code"})
        try:
            ex_json = r_ex.json()
        except Exception:
            ex_json = {}
        ex_ok = ex_json.get("success") is False and "error" in ex_json
        if not report(
            "GET /auth/digilocker/exchange (invalid code)",
            ex_ok,
            {"status_code": r_ex.status_code},
        ):
            failures += 1

        r_idfy = client.post(f"{BASE}/integrations/idfy/start-digilocker", json={})
        try:
            idfy_j = r_idfy.json()
        except Exception:
            idfy_j = {}
        detail_s = str(idfy_j.get("detail", "")).lower()
        idfy_ok = r_idfy.status_code == 503 and ("disabled" in detail_s or "https" in detail_s)
        idfy_ok = idfy_ok or r_idfy.status_code == 200
        if not report(
            "POST /integrations/idfy/start-digilocker",
            idfy_ok,
            {"status_code": r_idfy.status_code},
        ):
            failures += 1

        tid = "00000000-0000-0000-0000-000000000001"
        r_poll = client.get(f"{BASE}/integrations/idfy/result/{tid}")
        try:
            poll_j = r_poll.json()
        except Exception:
            poll_j = {}
        poll_ok = poll_j.get("success") is True and poll_j.get("data", {}).get("status") == "pending"
        if not report(
            f"GET /integrations/idfy/result/{tid}",
            poll_ok,
            {"status_code": r_poll.status_code},
        ):
            failures += 1

        try:
            fresh_rid = random_request_id()
            xml_bytes = build_signed_verify_request_bytes(
                "IN0106", fresh_rid, "C", "ABCPA1234F"
            )
            r_xml = client.post(
                f"{BASE}/Search/ckycverificationservice/verify",
                content=xml_bytes,
                headers={"Content-Type": "application/xml"},
            )
            xml_ok = r_xml.status_code == 200 and (
                b"CKYC_INQ" in r_xml.content or b"PID" in r_xml.content
            )
            if not report(
                "POST /Search/ckycverificationservice/verify",
                xml_ok,
                {"request_id": fresh_rid, "bytes": len(r_xml.content)},
            ):
                failures += 1
        except Exception as e:
            report("POST /Search/ckycverificationservice/verify", False, {"error": str(e)})
            failures += 1

    elapsed = time.perf_counter() - t0
    if failures:
        print(f"Done in {elapsed:.2f}s — {failures} check(s) failed.")
        return 1
    print(f"Done in {elapsed:.2f}s — all checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
