"""Batch upload mock: store records and simulate immediate + periodic stages."""

from __future__ import annotations

import base64
import json
import re
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models import FiInstitution, KycIdentityRow, KycRecord, StoredDocument, UploadBatch

PAN_PATTERN = re.compile(r"^[A-Z]{3}[ABCFGHJLPT][A-Z][0-9]{4}[A-Z]$")


def _gen_ckyc_no(customer_type: str) -> str:
    first = "5" if customer_type == "individual" else "8"
    rest = "".join(str(uuid.uuid4().int % 10) for _ in range(13))
    return (first + rest)[:14]


def _gen_ckyc_ref_id() -> str:
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    s = "".join(alphabet[uuid.uuid4().int % 36] for _ in range(14))
    return s


def create_batch(
    db: Session,
    fi_code: str,
    batch_reference: str | None,
    records_in: list,
    simulate_checker_approve: bool,
) -> tuple[UploadBatch, list[KycRecord], dict]:
    if not db.query(FiInstitution).filter(FiInstitution.fi_code == fi_code).first():
        raise ValueError("Institution does not exist; register FI via /admin/fi/register")

    batch_id = batch_reference or f"BATCH-{uuid.uuid4().hex[:16]}"
    batch = UploadBatch(
        batch_id=batch_id,
        fi_code=fi_code,
        source="api",
        status="pending_checker",
        immediate_summary_json=None,
        created_at=datetime.utcnow(),
    )
    db.add(batch)
    db.flush()

    immediate: dict = {"record_results": []}
    created: list[KycRecord] = []

    for idx, rec in enumerate(records_in):
        rid = str(uuid.uuid4())
        errs: list[str] = []
        if rec.customer_type == "individual" and rec.pan:
            if not PAN_PATTERN.match(rec.pan.upper()):
                errs.append("Invalid PAN format")
        if rec.customer_type == "individual" and not rec.pan and not rec.id_json:
            errs.append("Provide pan or id_json for lookup")
        if rec.customer_type == "legal" and not rec.name:
            errs.append("Name required for legal entity")

        if errs:
            immediate["record_results"].append(
                {"index": idx, "fi_reference_no": rec.fi_reference_no, "status": "validation_failure", "errors": errs}
            )
            continue

        photo_bytes = None
        if rec.photo_base64:
            try:
                photo_bytes = base64.b64decode(rec.photo_base64)
            except Exception:
                errs.append("Invalid photo_base64")
                immediate["record_results"].append(
                    {"index": idx, "fi_reference_no": rec.fi_reference_no, "status": "validation_failure", "errors": errs}
                )
                continue

        id_json_str = json.dumps(rec.id_json) if rec.id_json else None
        temp_ref = f"TMP{uuid.uuid4().hex[:16].upper()}"

        kyc = KycRecord(
            record_id=rid,
            batch_id=batch_id,
            fi_code=fi_code,
            customer_type=rec.customer_type,
            fi_reference_no=rec.fi_reference_no,
            temp_reference_no=temp_ref,
            ckyc_no=None,
            ckyc_reference_id=None,
            pan=rec.pan.upper() if rec.pan else None,
            aadhaar_last4=rec.aadhaar_last4,
            id_json=id_json_str,
            name=rec.name,
            fathers_name_or_na=rec.fathers_name_or_na or "",
            dob=rec.dob,
            gender=rec.gender,
            constitution_type=rec.constitution_type,
            place_of_incorporation=rec.place_of_incorporation,
            photo_bytes=photo_bytes,
            image_type=rec.image_type,
            processing_stage="immediate",
            record_status="accepted_pending_checker",
            remarks="",
            kyc_date=rec.kyc_date or datetime.utcnow().strftime("%d-%m-%Y"),
            updated_date=rec.updated_date or datetime.utcnow().strftime("%d-%m-%Y"),
            age=rec.age,
        )
        db.add(kyc)
        created.append(kyc)

        if rec.identity_rows:
            for ir in rec.identity_rows:
                db.add(
                    KycIdentityRow(
                        record_id=rid,
                        id_type=ir.get("type", ""),
                        id_status=ir.get("status", ""),
                    )
                )

        if rec.documents:
            for d in rec.documents:
                try:
                    raw = base64.b64decode(d.content_base64)
                except Exception:
                    continue
                db.add(
                    StoredDocument(
                        doc_id=str(uuid.uuid4()),
                        record_id=rid,
                        doc_role=d.role,
                        mime_type=d.mime_type,
                        content=raw,
                    )
                )

        immediate["record_results"].append(
            {
                "index": idx,
                "record_id": rid,
                "fi_reference_no": rec.fi_reference_no,
                "temp_reference_no": temp_ref,
                "status": "accepted",
            }
        )

    batch.immediate_summary_json = json.dumps(immediate)
    db.commit()
    db.refresh(batch)

    if simulate_checker_approve and created:
        run_post_checker_simulation(db, batch_id)

    return batch, created, immediate


def run_post_checker_simulation(db: Session, batch_id: str) -> None:
    batch = db.query(UploadBatch).filter(UploadBatch.batch_id == batch_id).one_or_none()
    if not batch:
        return
    batch.status = "authorized"
    db.flush()

    records = db.query(KycRecord).filter(KycRecord.batch_id == batch_id).all()
    for r in records:
        if r.record_status != "accepted_pending_checker":
            continue
        r.processing_stage = "post_kyc_generation"
        r.record_status = "success"
        r.ckyc_no = _gen_ckyc_no(r.customer_type)
        r.ckyc_reference_id = _gen_ckyc_ref_id()
        r.remarks = "done"
        n_id = db.query(KycIdentityRow).filter(KycIdentityRow.record_id == r.record_id).count()
        if n_id == 0:
            if r.customer_type == "individual":
                db.add(KycIdentityRow(record_id=r.record_id, id_type="E", id_status="03"))
                if r.pan:
                    db.add(KycIdentityRow(record_id=r.record_id, id_type="C", id_status="03"))
            else:
                db.add(KycIdentityRow(record_id=r.record_id, id_type="01", id_status=""))

    db.commit()
