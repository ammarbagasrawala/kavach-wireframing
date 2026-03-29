Local key bundles (separate JSON files)
=======================================

  cersai.json  — Mock CKYCR / CERSAI (encrypt session keys server-side; sign responses)
  fi.json      — Default FI / bank (sign search requests; decrypt PID in responses)

Each file must contain:
  public_pem   — PEM text (string)
  private_pem  — PEM text (string)
  label        — optional description

Generate from existing keys/*.pem:

  PYTHONPATH=. python scripts/pem_to_local_json.py

If these files exist, the API prefers them over keys/*.pem (see app/key_store.py).

Real JSON files with secrets are gitignored — only *.example.json is committed.
