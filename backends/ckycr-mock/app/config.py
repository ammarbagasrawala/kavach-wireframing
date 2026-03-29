from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Project root (parent of `app/`) — stable regardless of cwd (avoids sqlite readonly / wrong file)
_PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _default_sqlite_url() -> str:
    db = (_PROJECT_ROOT / "ckyc_mock.db").resolve()
    # Absolute path: sqlite:////abs/path (SQLAlchemy expects leading / in path segment)
    return f"sqlite:///{db.as_posix()}"


def _default_kavach_sqlite_url() -> str:
    db = (_PROJECT_ROOT / "kavach_app.db").resolve()
    return f"sqlite:///{db.as_posix()}"


def _env_files() -> tuple[Path, ...]:
    """Repo .env first, then DIGILOCKER_PAN_ADHAAR_FLOW/.env (later wins on duplicate keys)."""
    files: list[Path] = [_PROJECT_ROOT / ".env"]
    digi = _PROJECT_ROOT / "DIGILOCKER_PAN_ADHAAR_FLOW" / ".env"
    if digi.is_file():
        files.append(digi)
    return tuple(files)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_env_files(), extra="ignore", env_file_encoding="utf-8")

    database_url: str = Field(default_factory=_default_sqlite_url)
    # Separate DB for Kavach identity / audit (no raw PII)
    kavach_database_url: str = Field(default_factory=_default_kavach_sqlite_url)
    redis_url: str | None = Field(default=None, description="Optional Redis for OAuth state and IDfy task cache")
    cersai_private_key_path: Path = Field(default_factory=lambda: _PROJECT_ROOT / "keys" / "cersai_private.pem")
    cersai_public_key_path: Path = Field(default_factory=lambda: _PROJECT_ROOT / "keys" / "cersai_public.pem")
    fi_private_key_path: Path = Field(default_factory=lambda: _PROJECT_ROOT / "keys" / "fi_private.pem")
    admin_token: str = "dev-admin-token-change-me"
    enable_dev_routes: bool = True  # set ENABLE_DEV_ROUTES=false in production
    # Dev-only: allow /api/demo/verify-search to accept fi_private_key_pem for per-bank signing.
    allow_client_fi_private_key: bool = True
    # Comma-separated origins for React dev server and Kavach wireframes (Next.js).
    cors_origins: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:3000,http://127.0.0.1:3000"
    )
    # DigiLocker OAuth (digilocker-auth module)
    digilocker_client_id: str = ""
    digilocker_client_secret: str | None = None
    digilocker_redirect_uri: str = "http://127.0.0.1:8000/auth/digilocker/callback"
    digilocker_base_url: str = "https://api.digitallocker.gov.in"
    digilocker_mock: bool = True
    digilocker_mock_authorize_url: str = "http://127.0.0.1:8000/auth/digilocker/mock"
    digilocker_scope: str = "files.read user.info"
    digilocker_flow: str = "signin"
    digilocker_verified_mobile: str = "Y"
    # After OAuth callback: redirect here with exchange_code query (wireframe origin)
    digilocker_frontend_redirect: str = "http://localhost:3000/bank"
    # IDfy DigiLocker fetch (optional)
    enable_idfy_digilocker: bool = False
    idfy_account_id: str | None = None
    idfy_api_key: str | None = None
    idfy_webhook_url: str | None = None
    idfy_key_id: str | None = None
    idfy_ou_id: str | None = None
    idfy_secret: str | None = None
    idfy_result_ttl_seconds: int = 3600
    # Public base URL for IDfy callbacks (use ngrok in dev if IDfy strips localhost ports)
    idfy_webhook_base_url: str = "http://127.0.0.1:8000"
    # Auto-ngrok (see app/ngrok_runtime.py; tokens often live in DIGILOCKER_PAN_ADHAAR_FLOW/.env)
    use_ngrok: bool = False
    ngrok_authtoken: str | None = None
    ngrok_local_port: int = 8000
    # Optional: reserved ngrok hostname (e.g. xxxx.ngrok-free.dev) — passed to pyngrok connect
    ngrok_domain: str | None = None
    # Browser redirect after IDfy lands on /integrations/idfy/return (302 to wireframe)
    kavach_wireframe_origin: str = "http://localhost:3000"


settings = Settings()


def cors_origins_list() -> list[str]:
    return [x.strip() for x in settings.cors_origins.split(",") if x.strip()]
