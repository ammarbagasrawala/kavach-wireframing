from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import FiInstitution
from app.schemas import FiRegisterIn

router = APIRouter(prefix="/admin", tags=["admin"])


def require_dev_enabled() -> None:
    if not settings.enable_dev_routes:
        raise HTTPException(404, "Not found")


def verify_token(x_admin_token: str | None = Header(None)) -> None:
    require_dev_enabled()
    if x_admin_token != settings.admin_token:
        raise HTTPException(403, "Forbidden")


@router.post("/fi/register")
def register_fi(
    body: FiRegisterIn,
    db: Session = Depends(get_db),
    _: None = Depends(verify_token),
):
    existing = db.query(FiInstitution).filter(FiInstitution.fi_code == body.fi_code).one_or_none()
    if existing:
        raise HTTPException(409, "FI already registered")
    row = FiInstitution(
        fi_code=body.fi_code,
        name=body.name,
        fi_public_key_pem=body.fi_public_key_pem.strip(),
        registered_ip=body.registered_ip,
    )
    db.add(row)
    db.commit()
    return {"fi_code": row.fi_code, "name": row.name}
