#!/usr/bin/env python3
"""Regenerate CKYC_Mock_Walkthrough.ipynb with expanded detail (run from project root)."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "CKYC_Mock_Walkthrough.ipynb"


def cell_md(source: str) -> dict:
    return {"cell_type": "markdown", "metadata": {}, "source": source.splitlines(keepends=True)}


def cell_code(source: str) -> dict:
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": source.splitlines(keepends=True),
    }


NB = {
    "cells": [
        cell_md(
            """# CKYCR FastAPI mock — detailed walkthrough

This notebook gives **step-by-step visibility**: what each piece of data is, what the code is simulating (vs production CKYC), what is sent on the wire, what is stored in SQLite, and **full outputs** (no truncation) unless noted.

### Prerequisites
- Virtualenv + `pip install -r requirements.txt` (+ `jupyter` / `ipykernel` to run this file).
- Keys: `PYTHONPATH=. python scripts/generate_keys.py`
- DB: `PYTHONPATH=. python scripts/seed.py` (creates `ckyc_mock.db` + FI `IN0106`).
- **API server** in another terminal: `PYTHONPATH=. uvicorn app.main:app --host 127.0.0.1 --port 8000`

### How to read this notebook
1. Run cells **top to bottom** the first time.
2. Sections **4** (upload) and **5–6** (search) build on `PROJECT_ROOT`, `API_BASE`, `DB_PATH` from the first code cell.
3. **Full output** means: `print()` of entire JSON/XML/Base64 strings. Binary columns in SQL are shown as **full Base64** (can be long).

### What was tested originally
| Test | Purpose |
|------|---------|
| `scripts/example_search_request.py` | Signed XML search request → verify endpoint |
| `scripts/seed.py` | FI + sample `kyc_record` rows (valid-format PAN `ABCPA1234F`) |
| Manual `curl` | `/admin/fi/register`, `/ckyc/batch/upload`, `/ckyc/batch/.../status` |

Production CKYC uses CERSAI-hosted keys and SFTP batch files; this repo’s `Cersai_pub.cer` is **not** auto-linked to `keys/cersai_private.pem` unless you replace keys with a matching pair.
"""
        ),
        cell_code(
            """import os
import sys
from pathlib import Path

# Project root (folder that contains app/main.py)
PROJECT_ROOT = Path.cwd()
if not (PROJECT_ROOT / "app" / "main.py").exists():
    PROJECT_ROOT = Path.cwd().parent
os.chdir(PROJECT_ROOT)
sys.path.insert(0, str(PROJECT_ROOT))

API_BASE = os.environ.get("CKYC_MOCK_URL", "http://127.0.0.1:8000")
DB_PATH = PROJECT_ROOT / "ckyc_mock.db"

print("PROJECT_ROOT =", PROJECT_ROOT.resolve())
print("API_BASE =", API_BASE)
print("DB_PATH exists =", DB_PATH.exists(), DB_PATH)
"""
        ),
        cell_md(
            """---
## 2. Architecture — two different “bank” flows

### Flow A — Batch upload (mock REST)
- **Simulates:** The *idea* of CKYC batch upload (metadata + images → registry). The official process doc uses **signed ZIP + pipe TXT + SFTP**; this mock uses **JSON over HTTP** for simplicity.
- **Code path:** `app/routers/batch.py` → `app/services/batch_service.py` → SQLite tables `upload_batch`, `kyc_record`, …
- **Data:** Plain JSON (Base64 for photos). **No** XML-DSig on this path in the mock.

### Flow B — Secured Search API v1.3
- **Simulates:** `CKYC-API-Secured-Search-Document_Ver1.3.pdf` — encrypted PID, RSA session-key wrap, XML-DSig.
- **Code path:** `app/routers/search.py` → `app/services/search_service.py` + `app/crypto.py`
- **Data:** `application/xml` only; inner `PID_DATA` is AES-encrypted; FI signs the request; mock “CERSAI” signs the response.

```text
Upload:   Client --JSON--> FastAPI --> SQLite (kyc_record.photo_bytes, pan, …)
Search:   Client --XML+sig--> FastAPI --> decrypt PID --> SQL lookup by fi_code + ID --> encrypt response PID
```
"""
        ),
        cell_md(
            """---
## 3. SQLite model (what each table stores)

| Table | Contents |
|-------|----------|
| `fi_institution` | One row per registered FI: `fi_code`, PEM `fi_public_key_pem` (used to **encrypt response** session key), optional `registered_ip` for IP check |
| `upload_batch` | One row per batch: `batch_id`, `fi_code`, `status`, `immediate_summary_json` (JSON text of immediate validation summary) |
| `kyc_record` | One row per customer in a batch: PAN, CKYC numbers, names, `photo_bytes` BLOB, `fi_code`, processing flags |
| `kyc_identity_row` | Many rows per record: `id_type` / `id_status` (feeds `<ID_LIST>` in search response) |
| `stored_document` | Optional extra files from upload JSON `documents[]` |
| `request_id_daily` | Prevents duplicate `REQUEST_ID` for same `fi_code` on same calendar day (search) |
| `search_audit_log` | Outcome codes per verify call (no raw PID) |

The next cell prints **table list + row counts**. Later cells dump **full row contents** for inspection.
"""
        ),
        cell_code(
            """import sqlite3

if not DB_PATH.exists():
    print("No database — run: PYTHONPATH=. python scripts/seed.py")
else:
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [r[0] for r in cur.fetchall()]
    print("Tables:", tables)
    for t in tables:
        cur.execute(f'SELECT COUNT(*) FROM "{t}"')
        print(f"  {t}: {cur.fetchone()[0]} rows")
    con.close()
"""
        ),
        cell_code(
            """# Full text columns for fi_institution (PEM keys printed in full)
import sqlite3

if DB_PATH.exists():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    print("========== fi_institution (full PEM) ==========")
    for row in cur.execute("SELECT * FROM fi_institution"):
        d = dict(row)
        print("--- row ---")
        for k, v in d.items():
            print(k, ":\\n", v if v is not None else None)
    con.close()
"""
        ),
        cell_md(
            """---
## 4. Flow A — Batch upload (detailed)

### What you are simulating
- A bank **submitting** one or more KYC records after internal validation. The mock **does not** implement SFTP or ZIP signing; it **does** persist records similarly to “batch accepted → later CKYC numbers assigned” if `simulate_checker_approve` is true.

### Steps (server-side)
1. **Parse JSON** — Pydantic models in `app/schemas.py` (`BatchUploadIn`, `KycRecordIn`).
2. **Check FI** — `fi_code` must exist in `fi_institution` (else HTTP 400).
3. **Per record** — Validate PAN format (individual), decode `photo_base64` → bytes, insert `kyc_record`, optional `kyc_identity_row` / `stored_document`.
4. **Immediate summary** — Written to `upload_batch.immediate_summary_json`.
5. **If `simulate_checker_approve`** — `run_post_checker_simulation`: set batch `authorized`, assign mock `ckyc_no`, `ckyc_reference_id`, default identity rows if empty.

### Steps (cells below)
1. Print the **exact JSON request body** (what the bank sends).
2. **POST** `/ckyc/batch/upload` — print **full** HTTP response body.
3. **Query SQLite** — print **full** `upload_batch` row and **full** `kyc_record` row(s) for that batch (photo as **full Base64**).

Use a **new** `batch_reference` if you re-run and get a conflict (same primary key).
"""
        ),
        cell_code(
            """import json
import time

# --- Request body (this is exactly what the mock API consumes) ---
# Unique batch id each run (avoids duplicate primary key on re-execute)
NOTEBOOK_BATCH_ID = f"NOTEBOOK-DETAIL-{int(time.time())}"
payload = {
    "fi_code": "IN0106",
    "batch_reference": NOTEBOOK_BATCH_ID,
    "simulate_checker_approve": True,
    "records": [
        {
            "customer_type": "individual",
            "name": "Notebook Detail User",
            "pan": "ABCPA1234F",
            "fathers_name_or_na": "Detail Father",
            "dob": "01-01-1992",
            "gender": "M",
            "photo_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            "identity_rows": [{"type": "C", "status": "03"}],
        }
    ],
}

print("========== FULL JSON REQUEST BODY (UTF-8 bytes sent as HTTP body) ==========")
print(json.dumps(payload, indent=2))
"""
        ),
        cell_code(
            """# POST upload — full response body (no truncation)
import json
import urllib.error
import urllib.request

req = urllib.request.Request(
    f"{API_BASE}/ckyc/batch/upload",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=20) as resp:
        raw = resp.read().decode("utf-8")
        print("HTTP status:", resp.status)
        print("========== FULL RESPONSE BODY ==========")
        print(raw)
        upload_resp = json.loads(raw)
except urllib.error.HTTPError as e:
    print("HTTP error", e.code)
    print(e.read().decode())
    upload_resp = {}
"""
        ),
        cell_code(
            """# After upload: full SQLite rows for this batch (photo_bytes → full Base64)
import base64
import sqlite3

bid = NOTEBOOK_BATCH_ID
if DB_PATH.exists():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    print("========== upload_batch WHERE batch_id =", bid, "==========")
    cur.execute('SELECT * FROM upload_batch WHERE batch_id = ?', (bid,))
    rows = cur.fetchall()
    if not rows:
        print("(no rows — change NOTEBOOK_BATCH_ID or run upload cell successfully)")
    for row in rows:
        for k in row.keys():
            print(k, ":", row[k])
    print()
    print("========== kyc_record WHERE batch_id =", bid, "==========")
    cur.execute('SELECT * FROM kyc_record WHERE batch_id = ?', (bid,))
    for row in cur.fetchall():
        d = dict(row)
        blob = d.pop("photo_bytes", None)
        for k, v in d.items():
            print(k, ":", v)
        if blob is not None:
            print("photo_bytes (length):", len(blob))
            print("photo_bytes (full base64):", base64.b64encode(blob).decode("ascii"))
        print("--- end row ---")
    con.close()
"""
        ),
        cell_code(
            """# GET batch status — full JSON response (same data as DB, API view)
import urllib.request

try:
    with urllib.request.urlopen(f"{API_BASE}/ckyc/batch/{NOTEBOOK_BATCH_ID}/status", timeout=10) as resp:
        print("HTTP", resp.status)
        print(resp.read().decode("utf-8"))
except Exception as e:
    print(e)
"""
        ),
        cell_md(
            """---
## 5. Flow B — Secured Search: step-by-step crypto (what the code simulates)

This mirrors `scripts/example_search_request.py` and `app/crypto.py`.

### Step 0 — Plain PID_DATA (before any crypto)
This XML is the **semantic search key**: timestamp, `ID_TYPE`, `ID_NO`. In production it is never sent in the clear.

### Step 1 — AES-256-CBC
- Random 32-byte AES key (`SESSION_KEY_BYTES`).
- Plain PID UTF-8 bytes → ciphertext: **16-byte IV || AES-CBC encrypted PKCS7-padded plaintext** (`encrypt_pid_aes`).

### Step 2 — RSA OAEP-SHA256
- That 32-byte AES key is encrypted with **CERSAI public** PEM → binary blob → Base64 → `<SESSION_KEY>`.

### Step 3 — Outer XML (unsigned)
- `<REQ_ROOT><HEADER>`: `FI_CODE`, `REQUEST_ID` (≤8 digits, unique per FI per day), `VERSION` 1.3.
- `<CKYC_INQ><PID>` Base64, `<SESSION_KEY>` Base64.

### Step 4 — XML-DSig (FI private)
- Enveloped signature over `REQ_ROOT` (SignXML), RSA-SHA256.

### Server (mock)
- Verify signature PEM matches `fi_institution.fi_public_key_pem`.
- Decrypt `<SESSION_KEY>` with `keys/cersai_private.pem`.
- Decrypt `<PID>` → parse `PID_DATA` → validate time window, IDs → SQL → build response PID → re-encrypt with **new** session key, encrypt session key with **FI public**, sign with **CERSAI private**.

The cells below print **every intermediate value in full** (Base64 strings are long — that is intentional).
"""
        ),
        cell_code(
            """# Flow B — explicit steps with full printed outputs
import os
import random
from datetime import datetime, timezone

from lxml import etree

from app.crypto import (
    SESSION_KEY_BYTES,
    b64e,
    encrypt_pid_aes,
    encrypt_session_key_rsa_oaep_sha256,
    load_private_key_pem,
    load_public_key_pem,
    sign_enveloped_xml_response,
)

fi_priv = load_private_key_pem(PROJECT_ROOT / "keys" / "fi_private.pem")
cersai_pub = load_public_key_pem(PROJECT_ROOT / "keys" / "cersai_public.pem")

now = datetime.now(timezone.utc).replace(tzinfo=None)
dt = now.strftime("%d-%m-%Y %H:%M:%S")
# Unique REQUEST_ID per run (same calendar day duplicate would fail)
request_id = str(random.randint(10000000, 99999999))

# One line per str literal (safe when embedded in .ipynb JSON)
pid_inner = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    "<PID_DATA>\n"
    f"<DATE_TIME>{dt}</DATE_TIME>\n"
    "<ID_TYPE>C</ID_TYPE>\n"
    "<ID_NO>ABCPA1234F</ID_NO>\n"
    "</PID_DATA>"
).encode("utf-8")

print("========== STEP 0: Plain PID_DATA bytes (UTF-8) — full ==========")
print(pid_inner.decode("utf-8"))

session_key = os.urandom(SESSION_KEY_BYTES)
print()
print("========== STEP 1a: Random AES session key (32 bytes) hex — full ==========")
print(session_key.hex())

enc_pid = encrypt_pid_aes(pid_inner, session_key)
print()
print("========== STEP 1b: AES ciphertext binary length (IV + ciphertext):", len(enc_pid), "==========")
print("========== STEP 1c: PID field (Base64) — full ==========")
pid_b64 = b64e(enc_pid)
print(pid_b64)

enc_sk = encrypt_session_key_rsa_oaep_sha256(session_key, cersai_pub)
print()
print("========== STEP 2: SESSION_KEY ciphertext binary length:", len(enc_sk), "==========")
print("========== STEP 2b: SESSION_KEY (Base64) — full ==========")
sk_b64 = b64e(enc_sk)
print(sk_b64)

req_root = etree.Element("REQ_ROOT")
header = etree.SubElement(req_root, "HEADER")
etree.SubElement(header, "FI_CODE").text = "IN0106"
etree.SubElement(header, "REQUEST_ID").text = request_id
etree.SubElement(header, "VERSION").text = "1.3"
cinq = etree.SubElement(req_root, "CKYC_INQ")
etree.SubElement(cinq, "PID").text = pid_b64
etree.SubElement(cinq, "SESSION_KEY").text = sk_b64

unsigned_xml = etree.tostring(req_root, encoding="utf-8", xml_declaration=True)
print()
print("========== STEP 3: Unsigned REQ_ROOT XML — full ==========")
print(unsigned_xml.decode("utf-8"))

signed = sign_enveloped_xml_response(req_root, fi_priv, cersai_cert_pem=None)
signed_bytes = etree.tostring(signed, encoding="utf-8", xml_declaration=True)
print()
print("========== STEP 4: Signed request (full HTTP body bytes as UTF-8 text) ==========")
print(signed_bytes.decode("utf-8"))

SEARCH_REQUEST_BYTES = signed_bytes
"""
        ),
        cell_code(
            """# POST verify — full response body (entire XML string)
import urllib.error
import urllib.request

SEARCH_RESPONSE_BYTES = b""
req = urllib.request.Request(
    f"{API_BASE}/Search/ckycverificationservice/verify",
    data=SEARCH_REQUEST_BYTES,
    headers={"Content-Type": "application/xml"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        SEARCH_RESPONSE_BYTES = resp.read()
        print("HTTP status:", resp.status)
        print("Response length (bytes):", len(SEARCH_RESPONSE_BYTES))
        print("========== FULL RESPONSE XML (entire body) ==========")
        print(SEARCH_RESPONSE_BYTES.decode("utf-8"))
except urllib.error.HTTPError as e:
    print("HTTP error", e.code)
    err_body = e.read()
    print("========== FULL ERROR BODY ==========")
    print(err_body.decode("utf-8", errors="replace"))
"""
        ),
        cell_code(
            """# Decrypt response PID using FI private key (full decrypted XML, no truncation)
from lxml import etree

from app.crypto import SESSION_KEY_BYTES, b64d, decrypt_pid_aes, decrypt_session_key_rsa_oaep_sha256, load_private_key_pem

if not SEARCH_RESPONSE_BYTES:
    print("No response to decrypt (run previous cell successfully).")
else:
    root = etree.fromstring(SEARCH_RESPONSE_BYTES)
    enc_pid = b64d(root.findtext(".//PID", default="").strip())
    enc_sk = b64d(root.findtext(".//SESSION_KEY", default="").strip())
    fi_priv = load_private_key_pem(PROJECT_ROOT / "keys" / "fi_private.pem")
    sk = decrypt_session_key_rsa_oaep_sha256(enc_sk, fi_priv)
    assert len(sk) == SESSION_KEY_BYTES
    plain = decrypt_pid_aes(enc_pid, sk)
    print("========== Full decrypted response PID (UTF-8 XML) ==========")
    print(plain.decode("utf-8"))
"""
        ),
        cell_code(
            """# Optional: last search_audit_log rows (full rows)
import sqlite3

if DB_PATH.exists():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    print("========== search_audit_log (latest 15) ==========")
    cur.execute("SELECT * FROM search_audit_log ORDER BY id DESC LIMIT 15")
    for row in cur.fetchall():
        print(dict(row))
    con.close()
"""
        ),
        cell_md(
            """---
## 7. Mapping reference

| Topic | Upload | Search |
|-------|--------|--------|
| Wire format | JSON | XML |
| Customer identifiers | Fields in JSON → DB columns | `PID_DATA` `ID_TYPE` + `ID_NO` |
| Photo | `photo_base64` → `photo_bytes` BLOB | Encrypted inside response `<PHOTO>` Base64 |
| FI scope | `fi_code` in JSON | `<FI_CODE>` in header; must match `kyc_record.fi_code` |

---

## 8. Endpoints

| Method | Path |
|--------|------|
| GET | `/health` |
| POST | `/admin/fi/register` (header `X-Admin-Token`) |
| POST | `/ckyc/batch/upload` |
| GET | `/ckyc/batch/{batch_id}/status` |
| POST | `/Search/ckycverificationservice/verify` |

Re-run search cells if you get `Request Id is not unique` (same day) or time-window errors — the step-by-step cell uses a random 8-digit `REQUEST_ID` each time.
"""
        ),
    ],
    "metadata": {
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python", "version": "3.11.0"},
    },
    "nbformat": 4,
    "nbformat_minor": 5,
}

OUT.write_text(json.dumps(NB, indent=1), encoding="utf-8")
print("Wrote", OUT)
