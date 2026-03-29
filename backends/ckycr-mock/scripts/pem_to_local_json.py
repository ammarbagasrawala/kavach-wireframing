#!/usr/bin/env python3
"""Copy keys/*.pem into separate local_keys/*.json files (gitignored)."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

KEYS = ROOT / "keys"
OUT = ROOT / "local_keys"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    c_priv = KEYS / "cersai_private.pem"
    c_pub = KEYS / "cersai_public.pem"
    f_priv = KEYS / "fi_private.pem"
    f_pub = KEYS / "fi_public.pem"
    for p in (c_priv, c_pub, f_priv, f_pub):
        if not p.is_file():
            print(f"Missing {p}; run: PYTHONPATH=. python scripts/generate_keys.py")
            sys.exit(1)

    (OUT / "cersai.json").write_text(
        json.dumps(
            {
                "label": "CERSAI / CKYCR (mock registry)",
                "public_pem": c_pub.read_text(encoding="utf-8").strip(),
                "private_pem": c_priv.read_text(encoding="utf-8").strip(),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    (OUT / "fi.json").write_text(
        json.dumps(
            {
                "label": "FI / bank (default signing key)",
                "public_pem": f_pub.read_text(encoding="utf-8").strip(),
                "private_pem": f_priv.read_text(encoding="utf-8").strip(),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUT / 'cersai.json'} and {OUT / 'fi.json'}")


if __name__ == "__main__":
    main()
