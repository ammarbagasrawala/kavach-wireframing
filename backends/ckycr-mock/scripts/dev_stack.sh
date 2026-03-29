#!/usr/bin/env bash
# Start FastAPI (CKYCR + Kavach integrations) + Kavach wireframes (Next.js).
# Usage: from repo root —  bash scripts/dev_stack.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WF="$ROOT/kavach-ab-digilocker-auth-module/kavach-wireframing"

export DIGILOCKER_MOCK_AUTHORIZE_URL="${DIGILOCKER_MOCK_AUTHORIZE_URL:-http://127.0.0.1:8000/auth/digilocker/mock}"

cleanup() {
  kill "${UV_PID:-0}" "${NEXT_PID:-0}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cd "$ROOT"
if [[ -d .venv ]]; then
  # shellcheck source=/dev/null
  source .venv/bin/activate
fi

echo "==> FastAPI: http://127.0.0.1:8000  (docs: /docs)"
echo "    IDfy: ENABLE_IDFY_DIGILOCKER + credentials; USE_NGROK=true + NGROK_AUTHTOKEN starts tunnel automatically (see DIGILOCKER_PAN_ADHAAR_FLOW/.env)."
PYTHONPATH=. uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
UV_PID=$!

cd "$WF"
if [[ ! -f .env.local ]] && [[ -f .env.local.example ]]; then
  echo "==> No .env.local — copying from .env.local.example (first time)"
  cp .env.local.example .env.local
fi

echo "==> Next.js:  http://localhost:3000  — open http://localhost:3000/create-vc"
npm run dev &
NEXT_PID=$!

wait
