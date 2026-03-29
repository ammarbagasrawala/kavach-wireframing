"""CKYC Secured Search verify logic."""

from __future__ import annotations

import base64
import json
import re
from pathlib import Path
from datetime import datetime, timedelta, timezone
from lxml import etree
from sqlalchemy import and_
from sqlalchemy.orm import Session

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
    verify_enveloped_xml_signature,
)
from app.key_store import cersai_private_pem_bytes
from app.models import FiInstitution, KycRecord, RequestIdDaily, SearchAuditLog
from app.validation import validate_id_no, validate_request_id


def _parse_dt(s: str) -> datetime:
    return datetime.strptime(s.strip(), "%d-%m-%Y %H:%M:%S")


def _mask_ckyc(no: str | None) -> str:
    if not no or len(no) < 4:
        return "XXXXXXXXXXXX"
    return "XXXXXXXXXX" + no[-4:]


def _norm_name(s: str) -> str:
    return re.sub(r"\s+", "", s or "").upper()


def _lookup_records(
    db: Session,
    fi_code: str,
    id_type: str,
    id_no: str,
) -> list[KycRecord]:
    q = db.query(KycRecord).filter(KycRecord.fi_code == fi_code)
    id_no = id_no.strip()
    ut = id_type.strip().upper()

    if ut == "C":
        return q.filter(KycRecord.pan == id_no.upper()).all()
    if ut == "Z":
        return q.filter(KycRecord.ckyc_no == id_no).all()
    if ut == "Y":
        return q.filter(KycRecord.ckyc_reference_id == id_no.upper()).all()
    if ut == "E":
        parts = id_no.split("|")
        if len(parts) != 4:
            return []
        uid4, aname, dob, gender = parts
        aname_n = _norm_name(aname)
        candidates = q.filter(
            KycRecord.aadhaar_last4 == uid4,
            KycRecord.dob == dob,
            KycRecord.gender == gender,
        ).all()
        return [r for r in candidates if _norm_name(r.name) == aname_n]
    # Generic: id_json {"A": "..."}
    rows = q.all()
    out: list[KycRecord] = []
    for r in rows:
        if not r.id_json:
            continue
        try:
            m = json.loads(r.id_json)
            if m.get(ut) == id_no:
                out.append(r)
        except json.JSONDecodeError:
            continue
    return out


def _record_to_pid_elements(
    rec: KycRecord,
    request_id_type: str,
    mask_ckyc: bool,
) -> etree._Element:
    """Build inner PID_DATA or SearchResponsePID content as Element tree fragment."""
    ckyc_disp = rec.ckyc_no or ""
    if mask_ckyc and request_id_type != "Z":
        ckyc_disp = _mask_ckyc(ckyc_disp)
    ref = rec.ckyc_reference_id or ""

    if rec.customer_type == "legal":
        root = etree.Element("PID_DATA")
        etree.SubElement(root, "CKYC_NO").text = ckyc_disp
        etree.SubElement(root, "CKYC_REFERENCE_ID").text = ref
        etree.SubElement(root, "NAME").text = rec.name
        etree.SubElement(root, "CONSTITUTION_TYPE").text = rec.constitution_type or ""
        etree.SubElement(root, "AGE").text = rec.age or "0"
        etree.SubElement(root, "PLACE_OF_INCORPORATION").text = rec.place_of_incorporation or ""
        etree.SubElement(root, "KYC_DATE").text = rec.kyc_date or ""
        etree.SubElement(root, "UPDATED_DATE").text = rec.updated_date or ""
        id_list = etree.SubElement(root, "ID_LIST")
        for ir in rec.identity_rows:
            iel = etree.SubElement(id_list, "ID")
            etree.SubElement(iel, "TYPE").text = ir.id_type
            etree.SubElement(iel, "STATUS").text = ir.id_status or ""
        etree.SubElement(root, "REMARKS").text = rec.remarks or ""
        return root

    # Individual: CKYC Secured Search v1.3 response tags (see PDF) — no <PAN> in PID_DATA.
    # Wrap in SearchResponsePID if PAN search and multiple handling done by caller.
    root = etree.Element("PID_DATA")
    etree.SubElement(root, "CKYC_NO").text = ckyc_disp
    etree.SubElement(root, "CKYC_REFERENCE_ID").text = ref
    etree.SubElement(root, "NAME").text = rec.name
    etree.SubElement(root, "FATHERS_NAME").text = rec.fathers_name_or_na or ""
    etree.SubElement(root, "AGE").text = rec.age or "0"
    img = rec.image_type or "jpg"
    etree.SubElement(root, "IMAGE_TYPE").text = img
    photo_b64 = ""
    if rec.photo_bytes:
        photo_b64 = base64.b64encode(rec.photo_bytes).decode("ascii")
    etree.SubElement(root, "PHOTO").text = photo_b64
    etree.SubElement(root, "KYC_DATE").text = rec.kyc_date or ""
    etree.SubElement(root, "UPDATED_DATE").text = rec.updated_date or ""
    id_list = etree.SubElement(root, "ID_LIST")
    for ir in rec.identity_rows:
        iel = etree.SubElement(id_list, "ID")
        etree.SubElement(iel, "TYPE").text = ir.id_type
        etree.SubElement(iel, "STATUS").text = ir.id_status or ""
    etree.SubElement(root, "REMARKS").text = rec.remarks or ""
    return root


def _pid_data_to_search_response(pid_data_el: etree._Element) -> etree._Element:
    """Wrap PID_DATA children in SearchResponsePID (for PAN non-Z)."""
    srp = etree.Element("SearchResponsePID")
    for child in list(pid_data_el):
        srp.append(child)
    return srp


def build_error_pid_data(msg: str) -> bytes:
    root = etree.Element("PID_DATA")
    etree.SubElement(root, "REMARKS").text = msg
    return etree.tostring(root, encoding="utf-8", xml_declaration=True, standalone=True)


def process_verify_request(
    db: Session,
    raw_xml: bytes,
    cersai_private_key: Path | bytes | None,
    client_ip: str | None,
) -> tuple[bytes, int]:
    """
    Process CKYC verify XML request; return (response_xml_bytes, http_status).
    Pass None to use local_keys/cersai.json or keys/cersai_private.pem via key_store.
    """
    cersai_priv_material: Path | bytes = (
        cersai_private_key if cersai_private_key is not None else cersai_private_pem_bytes()
    )
    try:
        root = etree.fromstring(raw_xml)
    except etree.XMLSyntaxError:
        return (b'<?xml version="1.0"?><ERROR>Invalid XML</ERROR>', 400)

    fi_code_el = root.find(".//FI_CODE")
    req_id_el = root.find(".//REQUEST_ID")
    if fi_code_el is None or req_id_el is None or not fi_code_el.text or not req_id_el.text:
        return (b'<?xml version="1.0"?><ERROR>Missing HEADER fields</ERROR>', 400)

    fi_code = fi_code_el.text.strip()
    request_id = req_id_el.text.strip()

    fi_row = db.query(FiInstitution).filter(FiInstitution.fi_code == fi_code).one_or_none()
    if not fi_row:
        return (b'<?xml version="1.0"?><ERROR>Institution does not exists</ERROR>', 400)

    if fi_row.registered_ip and client_ip and fi_row.registered_ip != client_ip:
        db.add(
            SearchAuditLog(
                fi_code=fi_code,
                request_id=request_id,
                id_type=None,
                client_ip=client_ip,
                outcome="ip_mismatch",
            )
        )
        db.commit()
        return (b'<?xml version="1.0"?><ERROR>The given IP does not match</ERROR>', 403)

    try:
        verify_enveloped_xml_signature(root, fi_row.fi_public_key_pem.encode())
    except Exception:
        db.add(
            SearchAuditLog(
                fi_code=fi_code,
                request_id=request_id,
                id_type=None,
                client_ip=client_ip,
                outcome="sig_fail",
            )
        )
        db.commit()
        return (
            b'<?xml version="1.0"?><ERROR>Digital signature cannot be verified</ERROR>',
            400,
        )

    sk_el = root.find(".//SESSION_KEY")
    pid_el = root.find(".//PID")
    if sk_el is None or pid_el is None or not sk_el.text or not pid_el.text:
        return (b'<?xml version="1.0"?><ERROR>Missing PID or SESSION_KEY</ERROR>', 400)

    try:
        enc_sk = b64d(sk_el.text.strip())
        enc_pid = b64d(pid_el.text.strip())
    except Exception:
        return (b'<?xml version="1.0"?><ERROR>PID Data Decoding error</ERROR>', 400)

    try:
        cersai_priv = load_private_key_pem(cersai_priv_material)
        session_key = decrypt_session_key_rsa_oaep_sha256(enc_sk, cersai_priv)
    except Exception:
        return (
            b'<?xml version="1.0"?><ERROR>Session Key Decryption error</ERROR>',
            400,
        )

    if len(session_key) != SESSION_KEY_BYTES:
        return (b'<?xml version="1.0"?><ERROR>Session Key Decryption error</ERROR>', 400)

    try:
        pid_xml = decrypt_pid_aes(enc_pid, session_key)
    except Exception:
        return (b'<?xml version="1.0"?><ERROR>PID Data Decoding error</ERROR>', 400)

    try:
        pid_root = etree.fromstring(pid_xml)
    except etree.XMLSyntaxError:
        return (b'<?xml version="1.0"?><ERROR>Invalid PID_DATA</ERROR>', 400)

    dt_el = pid_root.find("DATE_TIME")
    id_type_el = pid_root.find("ID_TYPE")
    id_no_el = pid_root.find("ID_NO")
    if dt_el is None or id_type_el is None or id_no_el is None:
        return (b'<?xml version="1.0"?><ERROR>Invalid PID_DATA</ERROR>', 400)

    date_time_s = dt_el.text or ""
    id_type = (id_type_el.text or "").strip()
    id_no = id_no_el.text or ""

    try:
        req_dt = _parse_dt(date_time_s)
    except ValueError:
        return (b'<?xml version="1.0"?><ERROR>Invalid Date-Time Stamp</ERROR>', 400)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    # Compare as naive local/UTC — doc uses IST typically; mock uses UTC window
    if abs((now - req_dt).total_seconds()) > 5 * 60:
        return (b'<?xml version="1.0"?><ERROR>Time difference should be less than 5 minutes</ERROR>', 400)

    ver_el = root.find(".//VERSION")
    version = (ver_el.text or "").strip() if ver_el is not None else ""
    if version != "1.3":
        return (b'<?xml version="1.0"?><ERROR>Please enter version number</ERROR>', 400)

    rid_err = validate_request_id(request_id)
    if rid_err:
        db.add(
            SearchAuditLog(
                fi_code=fi_code,
                request_id=request_id,
                id_type=id_type,
                client_ip=client_ip,
                outcome="bad_request_id",
            )
        )
        db.commit()
        return (f'<?xml version="1.0"?><ERROR>{rid_err}</ERROR>'.encode(), 400)

    day_ymd = now.strftime("%Y%m%d")
    existing = (
        db.query(RequestIdDaily)
        .filter(
            and_(
                RequestIdDaily.fi_code == fi_code,
                RequestIdDaily.request_id == request_id,
                RequestIdDaily.day_ymd == day_ymd,
            )
        )
        .first()
    )
    if existing:
        db.add(
            SearchAuditLog(
                fi_code=fi_code,
                request_id=request_id,
                id_type=id_type,
                client_ip=client_ip,
                outcome="duplicate_request_id",
            )
        )
        db.commit()
        return (b'<?xml version="1.0"?><ERROR>Request Id is not unique</ERROR>', 400)

    id_err = validate_id_no(id_type, id_no)
    if id_err:
        db.add(RequestIdDaily(fi_code=fi_code, request_id=request_id, day_ymd=day_ymd))
        db.add(
            SearchAuditLog(
                fi_code=fi_code,
                request_id=request_id,
                id_type=id_type,
                client_ip=client_ip,
                outcome="validation",
            )
        )
        db.commit()
        resp = _build_signed_encrypted_response(
            fi_row,
            fi_code,
            request_id,
            build_error_pid_data(id_err),
            cersai_priv_material,
        )
        return (resp, 200)

    records = _lookup_records(db, fi_code, id_type, id_no)
    if not records:
        db.add(RequestIdDaily(fi_code=fi_code, request_id=request_id, day_ymd=day_ymd))
        db.add(
            SearchAuditLog(
                fi_code=fi_code,
                request_id=request_id,
                id_type=id_type,
                client_ip=client_ip,
                outcome="no_records",
            )
        )
        db.commit()
        resp = _build_signed_encrypted_response(
            fi_row,
            fi_code,
            request_id,
            build_error_pid_data("No records found"),
            cersai_priv_material,
        )
        return (resp, 200)

    mask = id_type.upper() != "Z"
    if id_type.upper() == "C":
        pid_outer = etree.Element("PID_DATA")
        for rec in records:
            inner = _record_to_pid_elements(rec, id_type, mask)
            srp = _pid_data_to_search_response(inner)
            pid_outer.append(srp)
        pid_bytes = etree.tostring(
            pid_outer, encoding="utf-8", xml_declaration=True, standalone=True
        )
    else:
        rec = records[0]
        inner = _record_to_pid_elements(rec, id_type, mask)
        pid_bytes = etree.tostring(
            inner, encoding="utf-8", xml_declaration=True, standalone=True
        )

    db.add(RequestIdDaily(fi_code=fi_code, request_id=request_id, day_ymd=day_ymd))
    db.add(
        SearchAuditLog(
            fi_code=fi_code,
            request_id=request_id,
            id_type=id_type,
            client_ip=client_ip,
            outcome="ok",
        )
    )
    db.commit()

    resp = _build_signed_encrypted_response(
        fi_row, fi_code, request_id, pid_bytes, cersai_priv_material
    )
    return (resp, 200)


def _build_signed_encrypted_response(
    fi_row: FiInstitution,
    fi_code: str,
    request_id: str,
    pid_plain_bytes: bytes,
    cersai_private_key: Path | bytes,
) -> bytes:
    import os

    session_key = os.urandom(SESSION_KEY_BYTES)
    enc_pid = encrypt_pid_aes(pid_plain_bytes, session_key)
    fi_pub = load_public_key_pem(fi_row.fi_public_key_pem.encode())
    enc_sk = encrypt_session_key_rsa_oaep_sha256(session_key, fi_pub)

    cersai_priv = load_private_key_pem(cersai_private_key)

    req_date = datetime.now(timezone.utc).strftime("%d-%m-%Y")

    req_root = etree.Element("REQ_ROOT")
    header = etree.SubElement(req_root, "HEADER")
    etree.SubElement(header, "FI_CODE").text = fi_code
    etree.SubElement(header, "REQUEST_ID").text = request_id
    etree.SubElement(header, "REQ_DATE").text = req_date
    etree.SubElement(header, "VERSION").text = "1.3"
    cinq = etree.SubElement(req_root, "CKYC_INQ")
    etree.SubElement(cinq, "PID").text = b64e(enc_pid)
    etree.SubElement(cinq, "SESSION_KEY").text = b64e(enc_sk)
    etree.SubElement(cinq, "ERROR").text = ""

    signed = sign_enveloped_xml_response(req_root, cersai_priv, cersai_cert_pem=None)
    return etree.tostring(signed, encoding="utf-8", xml_declaration=True)
