from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.search_service import process_verify_request

router = APIRouter(tags=["search"])


@router.post("/Search/ckycverificationservice/verify")
async def ckyc_verify(
    request: Request,
    db: Session = Depends(get_db),
) -> Response:
    body = await request.body()
    client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else None)
    if client_ip and "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()
    out, status = process_verify_request(
        db,
        body,
        None,
        client_ip=client_ip,
    )
    return Response(content=out, media_type="application/xml", status_code=status)
