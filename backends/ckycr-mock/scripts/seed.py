#!/usr/bin/env python3
"""Generate keys (if missing), register FI, and seed sample KYC records."""

import base64
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

os.chdir(ROOT)

from app.database import SessionLocal, init_db
from app.key_store import fi_public_pem_text
from app.rsa_keys import generate_rsa_keypair
from app.models import FiInstitution, KycIdentityRow, KycRecord, UploadBatch

# Extra ID_TYPE → ID_NO values stored on seed individual (lookup via id_json in search_service).
# Lengths match app/validation.py for A,B,D,F,G,02,03.
SEED_ID_JSON = {
    "A": "A123456789012345678",
    "B": "B123456789012345678",
    "D": "D123456789012345678",
    "F": "F12345678901234567890123456789012345678",
    "G": "G123456789012345678",
    "02": "LEI12345678901234567890123456789012345678901234567890123456",
    "03": "GSTINSAMPLE123456789012345678901234567890123456789012345678",
}


def ensure_keys() -> None:
    from app.config import settings

    keys_dir = ROOT / "keys"
    keys_dir.mkdir(parents=True, exist_ok=True)
    if not settings.cersai_private_key_path.exists():
        c_priv, c_pub = generate_rsa_keypair()
        (keys_dir / "cersai_private.pem").write_bytes(c_priv)
        (keys_dir / "cersai_public.pem").write_bytes(c_pub)
        print("Generated CERSAI key pair in keys/")
    if not (keys_dir / "fi_private.pem").exists():
        f_priv, f_pub = generate_rsa_keypair()
        (keys_dir / "fi_private.pem").write_bytes(f_priv)
        (keys_dir / "fi_public.pem").write_bytes(f_pub)
        print("Generated FI key pair in keys/")


def main() -> None:
    ensure_keys()
    init_db()

    fi_code = "IN0106"
    fi_pub = fi_public_pem_text()

    db = SessionLocal()
    try:
        if db.query(FiInstitution).filter(FiInstitution.fi_code == fi_code).first():
            print("FI already seeded; skipping seed inserts")
            patch_seed_id_json()
            return

        db.add(
            FiInstitution(
                fi_code=fi_code,
                name="Mock Bank",
                fi_public_key_pem=fi_pub,
                registered_ip=None,
            )
        )

        batch_id = "SEED-BATCH-001"
        db.add(UploadBatch(batch_id=batch_id, fi_code=fi_code, source="seed", status="authorized"))

        tiny_png = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
            b"\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        photo_b64 = base64.b64encode(tiny_png).decode("ascii")

        # 4th char must be ABCFGHJLPT per CKYC PAN rules (not D/E etc.)
        pan = "ABCPA1234F"
        kyc_no = "51234567890123"
        ckyc_ref = "INISAI17091999"

        r1 = KycRecord(
            record_id="seed-rec-1",
            batch_id=batch_id,
            fi_code=fi_code,
            customer_type="individual",
            fi_reference_no="CUST001",
            temp_reference_no=None,
            ckyc_no=kyc_no,
            ckyc_reference_id=ckyc_ref,
            pan=pan,
            aadhaar_last4="1234",
            id_json=json.dumps(SEED_ID_JSON),
            name="Alex",
            fathers_name_or_na="Raj",
            dob="15-09-1990",
            gender="M",
            constitution_type=None,
            place_of_incorporation=None,
            photo_bytes=tiny_png,
            image_type="png",
            processing_stage="post_kyc_generation",
            record_status="success",
            remarks="done",
            kyc_date="06-09-2016",
            updated_date="15-09-2016",
            age="27.0",
        )
        db.add(r1)
        db.add(KycIdentityRow(record_id=r1.record_id, id_type="E", id_status="03"))
        db.add(KycIdentityRow(record_id=r1.record_id, id_type="C", id_status="03"))

        r2 = KycRecord(
            record_id="seed-rec-2",
            batch_id=batch_id,
            fi_code=fi_code,
            customer_type="legal",
            fi_reference_no="CORP001",
            temp_reference_no=None,
            ckyc_no="81234567890123",
            ckyc_reference_id="LEARAV29072000",
            pan=None,
            aadhaar_last4=None,
            id_json=None,
            name="ARP limited",
            fathers_name_or_na="",
            dob=None,
            gender=None,
            constitution_type="K-Artificial Liability Partnership",
            place_of_incorporation="chennai",
            photo_bytes=None,
            image_type=None,
            processing_stage="post_kyc_generation",
            record_status="success",
            remarks="",
            kyc_date="30-07-2020",
            updated_date="30-07-2020",
            age="0",
        )
        db.add(r2)
        for t in ("01", "04", "05", "06", "07", "08", "03", "02"):
            db.add(KycIdentityRow(record_id=r2.record_id, id_type=t, id_status=""))

        db.commit()
        print(f"Seeded FI {fi_code} and sample records (PAN {pan}, CKYC {kyc_no}).")
        print(f"Tiny PNG placeholder used for PHOTO (base64 length {len(photo_b64)}).")
    finally:
        db.close()


def patch_seed_id_json() -> None:
    """Backfill id_json on seed-rec-1 so older DBs get generic ID_TYPE demos."""
    init_db()
    db = SessionLocal()
    try:
        r1 = db.query(KycRecord).filter(KycRecord.record_id == "seed-rec-1").first()
        if not r1:
            return
        r1.id_json = json.dumps(SEED_ID_JSON)
        db.commit()
        print("Patched seed-rec-1 id_json (A/B/D/F/G/02/03 demo values).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
