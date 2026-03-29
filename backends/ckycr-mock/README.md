# CKYCR FastAPI mock

Mock implementation of **CKYC Secured Search API v1.3** (XML, AES PID, RSA-OAEP-SHA256 session key, XML-DSig SHA256) and a **batch upload**-style JSON API backed by SQLite.

## Setup

```bash
cd API_Secured_Search_Document
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
PYTHONPATH=. python scripts/generate_keys.py   # creates keys/cersai_*.pem and keys/fi_*.pem
rm -f ckyc_mock.db && PYTHONPATH=. python scripts/seed.py
```

Configure `ADMIN_TOKEN` and `CERSAI_PRIVATE_KEY_PATH` via environment variables if needed (see `app/config.py`).

### Optional: keys as local JSON (separate files)

You can keep **CERSAI** and **FI** material in `local_keys/cersai.json` and `local_keys/fi.json` (each with `public_pem` and `private_pem` strings). If present, the API uses them **instead of** `keys/*.pem`. Generate them from PEMs:

```bash
PYTHONPATH=. python scripts/pem_to_local_json.py
```

Committed repo only includes `local_keys/*.example.json` — real JSON files are gitignored.

## Run

```bash
PYTHONPATH=. uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The SQLite file is always resolved under the project directory (`app/config.py`), so you can start uvicorn from any working directory without hitting `attempt to write a readonly database` from a wrong relative path. Override with env `DATABASE_URL` if needed.

- Health: `GET /health`
- Search: `POST /Search/ckycverificationservice/verify` (`Content-Type: application/xml`)
- Batch upload: `POST /ckyc/batch/upload`
- Batch status: `GET /ckyc/batch/{batch_id}/status`
- Register FI (dev): `POST /admin/fi/register` with header `X-Admin-Token: dev-admin-token-change-me`
- Browser-friendly register: `POST /api/ui/register-fi` (JSON body includes `admin_token`)
- Generate FI RSA keypair (dev): `POST /api/dev/generate-fi-keypair`
- Demo search (JSON): `POST /api/demo/verify-search` — optional `fi_private_key_pem` to sign as a registered FI (dev; see `allow_client_fi_private_key` in `app/config.py`)

## React bank console (multi-FI)

The **React UI** lives in `frontend/` (Vite). It walks through key generation, FI registration, multi-record batch upload, and secured search with **per-bank keys** stored in the browser (localStorage).

```bash
# Terminal 1 — API
PYTHONPATH=. uvicorn app.main:app --host 127.0.0.1 --port 8000

# Terminal 2 — UI (proxies /api, /ckyc, /health to :8000)
cd frontend && npm install && npm run dev
```

Open **http://127.0.0.1:5173**. CORS allows this origin; in dev, API calls use the Vite proxy so cookies/origin stay simple.

Production build: `cd frontend && npm run build` — static output in `frontend/dist/` (serve with any static host; point API calls at the real API base URL or reverse-proxy).

## Test search (signed request)

```bash
PYTHONPATH=. python scripts/example_search_request.py
```

This builds a v1.3 request using `keys/fi_private.pem` (sign) and `keys/cersai_public.pem` (encrypt session key). The server decrypts with `keys/cersai_private.pem` and must match the seeded FI public key in DB.

## Documentation notebook

See [`CKYC_Mock_Walkthrough.ipynb`](CKYC_Mock_Walkthrough.ipynb) for step-by-step flows, full request/response dumps, and SQLite row dumps. To regenerate that notebook from the template script: `PYTHONPATH=. python scripts/render_walkthrough_notebook.py`.

## Synthetic data

Use **synthetic** PANs, names, and **small Base64 images** (e.g. 1×1 PNG/JPEG). Do not use real customer data in mocks.

## Security notes

- Mock only: no HSM, no production CERSAI keys. Keep private keys out of version control (see `.gitignore`).
- Set `ENABLE_DEV_ROUTES=false` in production to disable `/admin/fi/register`.
