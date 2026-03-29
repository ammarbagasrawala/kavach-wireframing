"""
Load CERSAI / FI key material from local JSON files OR fall back to keys/*.pem.

Place JSON under project root/local_keys/ (gitignored):
  - local_keys/cersai.json   — mock CKYCR / CERSAI
  - local_keys/fi.json       — default FI (bank) signing key

Each file:
  {
    "public_pem": "-----BEGIN PUBLIC KEY-----\\n...",
    "private_pem": "-----BEGIN PRIVATE KEY-----\\n...",
    "label": "optional description"
  }
"""

from __future__ import annotations

import json
from pathlib import Path

from app.config import settings

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOCAL_KEYS = _PROJECT_ROOT / "local_keys"
CERSAI_JSON = LOCAL_KEYS / "cersai.json"
FI_JSON = LOCAL_KEYS / "fi.json"


def _fi_public_pem_path() -> Path:
    return Path(settings.fi_private_key_path).parent / "fi_public.pem"


def _read_json_keys(path: Path) -> dict | None:
    if not path.is_file():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    if not isinstance(data, dict):
        return None
    return data


def cersai_private_pem_bytes() -> bytes:
    d = _read_json_keys(CERSAI_JSON)
    if d and d.get("private_pem"):
        return str(d["private_pem"]).strip().encode("utf-8")
    return Path(settings.cersai_private_key_path).read_bytes()


def cersai_public_pem_bytes() -> bytes:
    d = _read_json_keys(CERSAI_JSON)
    if d and d.get("public_pem"):
        return str(d["public_pem"]).strip().encode("utf-8")
    return Path(settings.cersai_public_key_path).read_bytes()


def fi_private_pem_bytes() -> bytes:
    d = _read_json_keys(FI_JSON)
    if d and d.get("private_pem"):
        return str(d["private_pem"]).strip().encode("utf-8")
    return Path(settings.fi_private_key_path).read_bytes()


def fi_public_pem_text() -> str:
    d = _read_json_keys(FI_JSON)
    if d and d.get("public_pem"):
        return str(d["public_pem"]).strip()
    return _fi_public_pem_path().read_text(encoding="utf-8")
