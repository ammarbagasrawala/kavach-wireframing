"""Build CKYC Search v1.3 signed XML request bytes (same crypto as scripts/example_search_request.py)."""

from __future__ import annotations

import os
import random
from datetime import datetime, timezone
from pathlib import Path

from lxml import etree

from app.config import settings
from app.key_store import cersai_public_pem_bytes, fi_private_pem_bytes
from app.crypto import (
    SESSION_KEY_BYTES,
    b64d,
    b64e,
    decrypt_pid_aes,
    decrypt_session_key_rsa_oaep_sha256,
    encrypt_pid_aes,
    encrypt_session_key_rsa_oaep_sha256,
    load_private_key_pem,
    load_public_key_pem,
    sign_enveloped_xml_response,
)


def build_signed_verify_request_bytes(
    fi_code: str,
    request_id: str,
    id_type: str,
    id_no: str,
    *,
    date_time: str | None = None,
    version: str = "1.3",
    fi_private_key_path: Path | None = None,
    fi_private_pem: str | bytes | None = None,
    cersai_public_key_path: Path | None = None,
) -> bytes:
    """Build full signed REQ_ROOT XML as UTF-8 bytes."""
    if cersai_public_key_path is not None:
        cersai_pub = load_public_key_pem(cersai_public_key_path)
    else:
        cersai_pub = load_public_key_pem(cersai_public_pem_bytes())

    if fi_private_pem is not None:
        pem = fi_private_pem if isinstance(fi_private_pem, bytes) else fi_private_pem.encode("utf-8")
        fi_priv = load_private_key_pem(pem)
    elif fi_private_key_path is not None:
        fi_priv = load_private_key_pem(fi_private_key_path)
    else:
        fi_priv = load_private_key_pem(fi_private_pem_bytes())

    if date_time is None:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        date_time = now.strftime("%d-%m-%Y %H:%M:%S")

    pid_inner = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        "<PID_DATA>\n"
        f"<DATE_TIME>{date_time}</DATE_TIME>\n"
        f"<ID_TYPE>{id_type}</ID_TYPE>\n"
        f"<ID_NO>{id_no}</ID_NO>\n"
        "</PID_DATA>"
    ).encode("utf-8")

    session_key = os.urandom(SESSION_KEY_BYTES)
    enc_pid = encrypt_pid_aes(pid_inner, session_key)
    enc_sk = encrypt_session_key_rsa_oaep_sha256(session_key, cersai_pub)

    req_root = etree.Element("REQ_ROOT")
    header = etree.SubElement(req_root, "HEADER")
    etree.SubElement(header, "FI_CODE").text = fi_code.strip()
    etree.SubElement(header, "REQUEST_ID").text = request_id.strip()
    etree.SubElement(header, "VERSION").text = version
    cinq = etree.SubElement(req_root, "CKYC_INQ")
    etree.SubElement(cinq, "PID").text = b64e(enc_pid)
    etree.SubElement(cinq, "SESSION_KEY").text = b64e(enc_sk)

    signed = sign_enveloped_xml_response(req_root, fi_priv, cersai_cert_pem=None)
    return etree.tostring(signed, encoding="utf-8", xml_declaration=True)


def random_request_id() -> str:
    return str(random.randint(10000000, 99999999))


def decrypt_response_pid_preview(
    response_xml: bytes,
    fi_private_key_path: Path | None = None,
    fi_private_pem: str | bytes | None = None,
) -> str:
    """Decrypt response PID for UI preview (mock only)."""
    root = etree.fromstring(response_xml)
    pid_el = root.find(".//PID")
    sk_el = root.find(".//SESSION_KEY")
    if pid_el is None or sk_el is None or not (pid_el.text or "").strip():
        return "(no encrypted PID in response — likely an error XML)"
    enc_pid = b64d(pid_el.text.strip())
    enc_sk = b64d((sk_el.text or "").strip())
    if not enc_sk or not enc_pid:
        return ""
    if fi_private_pem is not None:
        pem = fi_private_pem if isinstance(fi_private_pem, bytes) else fi_private_pem.encode("utf-8")
        fi_priv = load_private_key_pem(pem)
    elif fi_private_key_path is not None:
        fi_priv = load_private_key_pem(fi_private_key_path)
    else:
        fi_priv = load_private_key_pem(fi_private_pem_bytes())
    sk = decrypt_session_key_rsa_oaep_sha256(enc_sk, fi_priv)
    plain = decrypt_pid_aes(enc_pid, sk)
    return plain.decode("utf-8")
