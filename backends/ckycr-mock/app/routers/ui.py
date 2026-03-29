"""

Demo UI API: server-side verify request builder + in-process verify.

Uses keys on the server — for mock/dev only; do not expose in production as-is.

"""



from fastapi import APIRouter, Depends, HTTPException

from fastapi.responses import PlainTextResponse

from pydantic import BaseModel, Field

from sqlalchemy.orm import Session



from app.config import settings

from app.database import get_db

from app.key_store import fi_public_pem_text

from app.models import FiInstitution

from app.rsa_keys import generate_rsa_keypair

from app.services.search_service import process_verify_request

from app.verify_request_builder import (

    build_signed_verify_request_bytes,

    decrypt_response_pid_preview,

    random_request_id,

)



router = APIRouter(tags=["ui-demo"])


@router.get("/api/ui/sample-fi-public-key", response_class=PlainTextResponse)

def sample_fi_public_key():

    """Return FI public PEM from local_keys/fi.json or keys/fi_public.pem."""

    try:

        text = fi_public_pem_text()

    except OSError:

        return PlainTextResponse(

            "# Add local_keys/fi.json or keys — PYTHONPATH=. python scripts/pem_to_local_json.py",

            status_code=404,

        )

    return PlainTextResponse(text)





class DemoVerifyIn(BaseModel):

    fi_code: str = Field(default="IN0106", min_length=3, max_length=6)

    request_id: str = Field(default="", description="8 digits max; empty = random")

    id_type: str = Field(default="C")

    id_no: str = Field(default="ABCPA1234F")

    fi_private_key_pem: str | None = Field(

        default=None,

        description="Optional. Dev-only: PEM used to sign REQ_ROOT for this FI (must match registered public key).",

    )





@router.post("/api/demo/verify-search")

def demo_verify_search(body: DemoVerifyIn, db: Session = Depends(get_db)):

    """

    Build signed XML using CERSAI public + FI private (server file or optional PEM in body),

    run verify in-process, return request/response XML and decrypted PID preview for the UI.

    """

    rid = body.request_id.strip() or random_request_id()

    pem: str | None = None

    if body.fi_private_key_pem and body.fi_private_key_pem.strip():

        if not settings.allow_client_fi_private_key:

            raise HTTPException(403, "Client-supplied FI private key is disabled on this server")

        pem = body.fi_private_key_pem.strip()



    xml_bytes = build_signed_verify_request_bytes(

        body.fi_code,

        rid,

        body.id_type.strip(),

        body.id_no.strip(),

        fi_private_pem=pem,

    )

    out, status = process_verify_request(

        db,

        xml_bytes,

        None,

        client_ip="127.0.0.1",

    )

    decrypted = ""

    if status == 200 and out:

        try:

            decrypted = decrypt_response_pid_preview(out, fi_private_pem=pem)

        except Exception as e:

            decrypted = f"(decrypt preview failed: {e})"



    err_text = ""

    if status >= 400:

        try:

            err_text = out.decode("utf-8", errors="replace")

        except Exception:

            err_text = str(out)



    return {

        "http_status": status,

        "request_id_used": rid,

        "request_xml": xml_bytes.decode("utf-8", errors="replace"),

        "response_xml": out.decode("utf-8", errors="replace"),

        "decrypted_pid_xml": decrypted,

        "error_body_if_any": err_text if status >= 400 else "",

        "signed_with": "client_pem" if pem else "server_fi_private_key_path",

    }





class ProxyRegisterIn(BaseModel):

    fi_code: str

    name: str

    fi_public_key_pem: str

    registered_ip: str | None = None

    admin_token: str = ""





@router.post("/api/ui/register-fi")

def ui_register_fi(body: ProxyRegisterIn, db: Session = Depends(get_db)):

    """Register FI with admin token in JSON (browser-friendly)."""

    if body.admin_token != settings.admin_token:

        raise HTTPException(403, "Invalid admin token")



    if db.query(FiInstitution).filter(FiInstitution.fi_code == body.fi_code).first():

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





class GenerateKeypairOut(BaseModel):

    public_pem: str

    private_pem: str





@router.post("/api/dev/generate-fi-keypair", response_model=GenerateKeypairOut)

def generate_fi_keypair():

    """

    Generate a new RSA key pair for FI signing (dev / onboarding only).

    Register the public half via POST /api/ui/register-fi.

    """

    if not settings.enable_dev_routes:

        raise HTTPException(404, "Not found")

    priv, pub = generate_rsa_keypair()

    return GenerateKeypairOut(

        public_pem=pub.decode("utf-8"),

        private_pem=priv.decode("utf-8"),

    )


