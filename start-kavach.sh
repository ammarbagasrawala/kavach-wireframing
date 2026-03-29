#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Kavach Dev Launcher
# Starts all three servers and kills them together on Ctrl+C
#
# Servers:
#   :3000  Next.js wireframes          (wireframes/)
#   :8000  IDfy/DigiLocker FastAPI     (digi-APIs-n-DBs/)
#   :8001  CKYCR Mock FastAPI          (e2e/API_Secured_Search_Document/)
# ─────────────────────────────────────────────────────────────

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ANSI colours
CYAN="\033[36m"; GREEN="\033[32m"; YELLOW="\033[33m"; RESET="\033[0m"

log() { echo -e "${CYAN}[kavach]${RESET} $1"; }

# Kill all child processes when the script exits (Ctrl+C or error)
PIDS=()
cleanup() {
    echo ""
    log "Shutting down all servers..."
    for pid in "${PIDS[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
    wait 2>/dev/null
    log "All servers stopped. Bye!"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# ── 1. Next.js frontend ─────────────────────────────────────
log "${GREEN}Starting Next.js${RESET} on :3000  (wireframes/)"
(
    cd "$SCRIPT_DIR/wireframes"
    npm run dev
) &
PIDS+=($!)

# ── 2. IDfy / DigiLocker FastAPI (port 8000) ────────────────
log "${GREEN}Starting IDfy FastAPI${RESET} on :8000  (digi-APIs-n-DBs/)"
(
    cd "$SCRIPT_DIR/digi-APIs-n-DBs"
    # Activate venv if present
    if [ -f ".venv/bin/activate" ]; then source .venv/bin/activate; fi
    uvicorn main:app --reload --port 8000
) &
PIDS+=($!)

# ── 3. CKYCR Mock FastAPI (port 8001) ───────────────────────
log "${GREEN}Starting CKYCR Mock${RESET} on :8001  (e2e/API_Secured_Search_Document/)"
(
    cd "$SCRIPT_DIR/e2e/API_Secured_Search_Document"
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

# Wait for any process to exit (keeps script alive)
wait -n 2>/dev/null || wait
