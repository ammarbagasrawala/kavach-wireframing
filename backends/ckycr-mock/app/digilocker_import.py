"""Resolve digilocker_auth package from vendored path under kavach-ab-digilocker-auth-module."""

from __future__ import annotations

import sys
from pathlib import Path


def ensure_digilocker_auth_path() -> None:
    root = Path(__file__).resolve().parent.parent
    # The module was moved to the root of ckycr-mock during consolidation
    py = root / "digilocker_auth"
    if py.is_dir():
        p = str(root) # The parent of digilocker_auth should be in sys.path
        if p not in sys.path:
            sys.path.insert(0, p)
