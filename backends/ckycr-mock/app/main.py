import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import cors_origins_list, settings
from app.database import init_db
from app.kavach_database import init_kavach_db
from app.ngrok_runtime import setup_ngrok_if_configured, teardown_ngrok
from app.routers import admin, batch, digilocker_oauth, idfy_digilocker, kavach_integrations, search, ui

_STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    import asyncio

    init_db()
    init_kavach_db()
    # Let uvicorn bind :8000 before ngrok forwards traffic here.
    await asyncio.sleep(0.35)
    setup_ngrok_if_configured()
    yield
    teardown_ngrok()


app = FastAPI(title="CKYCR Mock + Kavach integrations", version="0.2.0", lifespan=lifespan)

# Dev: Next "Network" URL (e.g. http://192.168.x.x:3000) is not in CORS_ORIGINS by default — browser blocks fetch with "Failed to fetch".
_DEV_LAN_ORIGIN_REGEX = (
    r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_list(),
    allow_origin_regex=_DEV_LAN_ORIGIN_REGEX if settings.enable_dev_routes else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(batch.router)
app.include_router(ui.router)
app.include_router(digilocker_oauth.router)
app.include_router(kavach_integrations.router)
app.include_router(idfy_digilocker.router)
if settings.enable_dev_routes:
    app.include_router(admin.router)

if _STATIC_DIR.is_dir():
    app.mount("/static", StaticFiles(directory=_STATIC_DIR), name="static")


@app.get("/health")
def health():
    out: dict = {"status": "ok"}
    pub = os.environ.get("KAVACH_IDFY_PUBLIC_BASE")
    if pub:
        out["idfy_public_base"] = pub
    return out


def _ui_index():
    index = _STATIC_DIR / "index.html"
    if not index.is_file():
        raise HTTPException(404, "UI not found")
    return FileResponse(index)


@app.get("/")
def root():
    return _ui_index()


@app.get("/ui")
def serve_ui():
    """CKYC mock web UI (autofill + flow)."""
    return _ui_index()
