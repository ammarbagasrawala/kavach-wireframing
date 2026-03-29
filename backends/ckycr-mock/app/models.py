from datetime import datetime

from sqlalchemy import (
    BLOB,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class FiInstitution(Base):
    __tablename__ = "fi_institution"

    fi_code: Mapped[str] = mapped_column(String(6), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    fi_public_key_pem: Mapped[str] = mapped_column(Text)
    registered_ip: Mapped[str | None] = mapped_column(String(64), nullable=True)

    batches: Mapped[list["UploadBatch"]] = relationship(back_populates="fi")


class UploadBatch(Base):
    __tablename__ = "upload_batch"

    batch_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    fi_code: Mapped[str] = mapped_column(String(6), ForeignKey("fi_institution.fi_code"))
    source: Mapped[str] = mapped_column(String(32), default="api")
    status: Mapped[str] = mapped_column(String(32), default="pending_checker")
    immediate_summary_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    fi: Mapped["FiInstitution"] = relationship(back_populates="batches")
    records: Mapped[list["KycRecord"]] = relationship(back_populates="batch")


class KycRecord(Base):
    __tablename__ = "kyc_record"

    record_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    batch_id: Mapped[str] = mapped_column(String(64), ForeignKey("upload_batch.batch_id"))
    fi_code: Mapped[str] = mapped_column(String(6), ForeignKey("fi_institution.fi_code"), index=True)
    customer_type: Mapped[str] = mapped_column(String(16))  # individual | legal
    fi_reference_no: Mapped[str | None] = mapped_column(String(80), nullable=True)
    temp_reference_no: Mapped[str | None] = mapped_column(String(40), nullable=True)
    ckyc_no: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    ckyc_reference_id: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    pan: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    aadhaar_last4: Mapped[str | None] = mapped_column(String(4), nullable=True)
    id_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    name: Mapped[str] = mapped_column(String(200))
    fathers_name_or_na: Mapped[str] = mapped_column(String(200), default="")
    dob: Mapped[str | None] = mapped_column(String(20), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(4), nullable=True)
    constitution_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    place_of_incorporation: Mapped[str | None] = mapped_column(String(200), nullable=True)
    photo_bytes: Mapped[bytes | None] = mapped_column(BLOB, nullable=True)
    image_type: Mapped[str | None] = mapped_column(String(8), nullable=True)
    processing_stage: Mapped[str] = mapped_column(String(64), default="immediate")
    record_status: Mapped[str] = mapped_column(String(64), default="pending")
    remarks: Mapped[str | None] = mapped_column(String(500), nullable=True)
    kyc_date: Mapped[str | None] = mapped_column(String(12), nullable=True)
    updated_date: Mapped[str | None] = mapped_column(String(12), nullable=True)
    age: Mapped[str | None] = mapped_column(String(16), nullable=True)

    batch: Mapped["UploadBatch"] = relationship(back_populates="records")
    identity_rows: Mapped[list["KycIdentityRow"]] = relationship(
        back_populates="record", cascade="all, delete-orphan"
    )
    documents: Mapped[list["StoredDocument"]] = relationship(
        back_populates="record", cascade="all, delete-orphan"
    )


class KycIdentityRow(Base):
    __tablename__ = "kyc_identity_row"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    record_id: Mapped[str] = mapped_column(String(64), ForeignKey("kyc_record.record_id"))
    id_type: Mapped[str] = mapped_column(String(8))
    id_status: Mapped[str | None] = mapped_column(String(8), nullable=True)

    record: Mapped["KycRecord"] = relationship(back_populates="identity_rows")


class StoredDocument(Base):
    __tablename__ = "stored_document"

    doc_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    record_id: Mapped[str] = mapped_column(String(64), ForeignKey("kyc_record.record_id"))
    doc_role: Mapped[str] = mapped_column(String(32))
    mime_type: Mapped[str] = mapped_column(String(80))
    content: Mapped[bytes] = mapped_column(BLOB)

    record: Mapped["KycRecord"] = relationship(back_populates="documents")


class SearchAuditLog(Base):
    __tablename__ = "search_audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fi_code: Mapped[str] = mapped_column(String(6), index=True)
    request_id: Mapped[str] = mapped_column(String(16))
    id_type: Mapped[str | None] = mapped_column(String(8), nullable=True)
    client_ip: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    outcome: Mapped[str] = mapped_column(String(80))


class RequestIdDaily(Base):
    """REQUEST_ID must be unique per FI per calendar day (CKYC Search v1.3)."""

    __tablename__ = "request_id_daily"
    __table_args__ = (UniqueConstraint("fi_code", "request_id", "day_ymd", name="uq_fi_request_day"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fi_code: Mapped[str] = mapped_column(String(6), index=True)
    request_id: Mapped[str] = mapped_column(String(16))
    day_ymd: Mapped[str] = mapped_column(String(8))


Index("ix_kyc_fi_ckyc", KycRecord.fi_code, KycRecord.ckyc_no)
Index("ix_kyc_fi_pan", KycRecord.fi_code, KycRecord.pan)
Index("ix_kyc_fi_ref", KycRecord.fi_code, KycRecord.ckyc_reference_id)
Index("ix_batch_fi_created", UploadBatch.fi_code, UploadBatch.created_at)
