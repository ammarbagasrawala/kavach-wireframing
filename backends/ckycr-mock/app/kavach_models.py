"""Kavach app schema: identity metadata and audit only — no raw PII."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.kavach_database import KavachBase


def _uuid() -> str:
    return str(uuid.uuid4())


class KavachUser(KavachBase):
    __tablename__ = "kavach_users"

    kavach_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    did: Mapped[str] = mapped_column(String(512), unique=True, index=True)
    public_key_jwk: Mapped[str] = mapped_column(Text, nullable=False)
    kyc_level: Mapped[str] = mapped_column(
        String(32), default="UNVERIFIED"
    )  # UNVERIFIED | BASELINE_EKYC | FULL_VKYC
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE")  # ACTIVE | LOCKED | SUSPENDED
    phone_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    email_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    vkyc_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    devices: Mapped[list["KavachDevice"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    kyc_requests: Mapped[list["KavachKycRequest"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class KavachDevice(KavachBase):
    __tablename__ = "kavach_devices"

    device_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    kavach_id: Mapped[str] = mapped_column(String(128), ForeignKey("kavach_users.kavach_id", ondelete="CASCADE"), index=True)
    fcm_token: Mapped[str | None] = mapped_column(String(512), nullable=True)
    device_attestation: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["KavachUser"] = relationship(back_populates="devices")


class KavachKycRequest(KavachBase):
    __tablename__ = "kavach_kyc_requests"

    request_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    kavach_id: Mapped[str] = mapped_column(String(128), ForeignKey("kavach_users.kavach_id", ondelete="CASCADE"), index=True)
    rp_id: Mapped[str] = mapped_column(String(64), index=True)
    purpose: Mapped[str] = mapped_column(Text, default="")
    fields_requested: Mapped[list[str]] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(32), default="PENDING")  # PENDING | GRANTED | DENIED | REVOKED | EXPIRED
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    granted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user: Mapped["KavachUser"] = relationship(back_populates="kyc_requests")


class KavachAuditLog(KavachBase):
    __tablename__ = "kavach_audit_logs"
    __table_args__ = (Index("ix_kavach_audit_kavach_time", "kavach_id", "timestamp"),)

    log_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=_uuid)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    kavach_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(64), index=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    device_fingerprint_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    target_rp: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="SUCCESS")  # SUCCESS | FAIL | WARN
    message: Mapped[str] = mapped_column(Text, default="")  # Must not contain raw PII
