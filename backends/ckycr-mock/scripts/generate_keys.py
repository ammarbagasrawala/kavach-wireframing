#!/usr/bin/env python3
"""Generate RSA key pairs for mock CERSAI (server) and FI (client signing)."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.rsa_keys import generate_rsa_keypair


def main() -> None:
    root = Path(__file__).resolve().parent.parent / "keys"
    root.mkdir(parents=True, exist_ok=True)
    c_priv, c_pub = generate_rsa_keypair()
    f_priv, f_pub = generate_rsa_keypair()
    (root / "cersai_private.pem").write_bytes(c_priv)
    (root / "cersai_public.pem").write_bytes(c_pub)
    (root / "fi_private.pem").write_bytes(f_priv)
    (root / "fi_public.pem").write_bytes(f_pub)
    print(f"Wrote keys under {root}")


if __name__ == "__main__":
    main()
