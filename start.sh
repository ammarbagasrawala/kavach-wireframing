#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Kavach Dev Launcher  (run from wireframes/ root)
# Starts all 3 services and kills them together on Ctrl+C
#
#   :3000  Next.js UI          (this directory)
#   :8000  IDfy FastAPI        (backends/idfy-api/)
#   :8001  CKYCR Mock FastAPI  (backends/ckycr-mock/)
# ─────────────────────────────────────────────────────────────

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CYAN="\033[36m"; GREEN="\033[32m"; YELLOW="\033[33m"; RESET="\033[0m"
log() { echo -e "${CYAN}[kavach]${RESET} $1"; }

PIDS=()
cleanup() {
    echo ""
    log "Shutting down all servers..."
    for pid in "${PIDS[@]}"; do kill "$pid" 2>/dev/null || true; done
    wait 2>/dev/null
    log "All servers stopped. Bye!"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# ── 1. Next.js UI ────────────────────────────────────────────
log "${GREEN}Starting Next.js${RESET} on :3000"
( cd "$SCRIPT_DIR" && npm run dev ) &
PIDS+=($!)

# ── 2. IDfy / DigiLocker FastAPI (port 8000) ─────────────────
log "${GREEN}Starting IDfy API${RESET} on :8000  (backends/idfy-api/)"
(
    cd "$SCRIPT_DIR/backends/idfy-api"
    if [ -f ".venv/bin/activate" ]; then source .venv/bin/activate; fi
    uvicorn main:app --reload --port 8000
) &
PIDS+=($!)

# ── 3. CKYCR Mock FastAPI (port 8001) ────────────────────────
log "${GREEN}Starting CKYCR Mock${RESET} on :8001  (backends/ckycr-mock/)"
(
    cd "$SCRIPT_DIR/backends/ckycr-mock"
    if [ -f ".venv/bin/activate" ]; then source .venv/bin/activate; fi
    PYTHONPATH=. uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
) &
PIDS+=($!)

echo ""
echo -e "  ${YELLOW}Next.js  ${RESET}→  http://localhost:3000"
echo -e "  ${YELLOW}IDfy API ${RESET}→  http://localhost:8000"
echo -e "  ${YELLOW}CKYCR    ${RESET}→  http://localhost:8001"
echo ""
log "All servers started. Press ${YELLOW}Ctrl+C${RESET} to stop everything."

wait -n 2>/dev/null || wait
