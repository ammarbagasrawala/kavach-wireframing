#!/usr/bin/env python3
"""
Build a CKYC Search v1.3 verify request (encrypt PID, sign XML) and POST to the mock server.

Usage (from project root):
  PYTHONPATH=. python scripts/example_search_request.py

Requires keys/fi_private.pem, keys/cersai_public.pem from scripts/generate_keys.py or seed.
"""

import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import urllib.request

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from lxml import etree

from app.crypto import (
    SESSION_KEY_BYTES,
    b64e,
    encrypt_pid_aes,
    encrypt_session_key_rsa_oaep_sha256,
    load_private_key_pem,
    load_public_key_pem,
    sign_enveloped_xml_response,
)

BASE = os.environ.get("CKYC_MOCK_URL", "http://127.0.0.1:8000")


def build_request() -> bytes:
    fi_priv = load_private_key_pem(ROOT / "keys" / "fi_private.pem")
    cersai_pub = load_public_key_pem(ROOT / "keys" / "cersai_public.pem")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    dt = now.strftime("%d-%m-%Y %H:%M:%S")

    pid_inner = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<PID_DATA>
<DATE_TIME>{dt}</DATE_TIME>
<ID_TYPE>C</ID_TYPE>
<ID_NO>ABCPA1234F</ID_NO>
</PID_DATA>""".encode(
        "utf-8"
    )

    session_key = os.urandom(SESSION_KEY_BYTES)
    enc_pid = encrypt_pid_aes(pid_inner, session_key)
    enc_sk = encrypt_session_key_rsa_oaep_sha256(session_key, cersai_pub)

    req_root = etree.Element("REQ_ROOT")
    header = etree.SubElement(req_root, "HEADER")
    etree.SubElement(header, "FI_CODE").text = "IN0106"
    etree.SubElement(header, "REQUEST_ID").text = str(int(now.timestamp()) % 10**8)
    etree.SubElement(header, "VERSION").text = "1.3"
    cinq = etree.SubElement(req_root, "CKYC_INQ")
    etree.SubElement(cinq, "PID").text = b64e(enc_pid)
    etree.SubElement(cinq, "SESSION_KEY").text = b64e(enc_sk)

    signed = sign_enveloped_xml_response(req_root, fi_priv, cersai_cert_pem=None)
    return etree.tostring(signed, encoding="utf-8", xml_declaration=True)


def main() -> None:
    body = build_request()
    req = urllib.request.Request(
        f"{BASE}/Search/ckycverificationservice/verify",
        data=body,
        headers={"Content-Type": "application/xml"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        out = resp.read()
        print(out.decode("utf-8", errors="replace")[:2000])


if __name__ == "__main__":
    main()
