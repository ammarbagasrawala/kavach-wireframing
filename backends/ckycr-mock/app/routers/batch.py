from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import KycRecord, UploadBatch
from app.schemas import BatchUploadIn
from app.services.batch_service import create_batch

router = APIRouter(prefix="/ckyc/batch", tags=["batch"])


@router.post("/upload")
def batch_upload(body: BatchUploadIn, db: Session = Depends(get_db)):
    if not body.records:
        raise HTTPException(400, "records required")
    try:
        batch, _created, immediate = create_batch(
            db,
            body.fi_code,
            body.batch_reference,
            body.records,
            body.simulate_checker_approve,
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    return {
        "batch_id": batch.batch_id,
        "status": batch.status,
        "immediate": immediate,
    }


@router.get("/{batch_id}/status")
def batch_status(batch_id: str, db: Session = Depends(get_db)):
    b = db.query(UploadBatch).filter(UploadBatch.batch_id == batch_id).one_or_none()
    if not b:
        raise HTTPException(404, "batch not found")
    rows = db.query(KycRecord).filter(KycRecord.batch_id == batch_id).all()
    return {
        "batch_id": b.batch_id,
        "fi_code": b.fi_code,
        "status": b.status,
        "created_at": b.created_at.isoformat() if b.created_at else None,
        "immediate_summary_json": b.immediate_summary_json,
        "records": [
            {
                "record_id": r.record_id,
                "fi_reference_no": r.fi_reference_no,
                "temp_reference_no": r.temp_reference_no,
                "ckyc_no": r.ckyc_no,
                "ckyc_reference_id": r.ckyc_reference_id,
                "processing_stage": r.processing_stage,
                "record_status": r.record_status,
                "remarks": r.remarks,
            }
            for r in rows
        ],
    }
