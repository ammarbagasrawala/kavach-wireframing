# Kavach Monorepo (UI + Backends)

This repository contains the complete Kavach Identity and DigiLocker integration demo, including the Next.js frontend and two Python backend services.

## 📁 Repository Structure

- `/app` - Next.js Frontend (Port 3000)
- `/backends/idfy-api` - DigiLocker/IDfy Task manager (Port 8000)
- `/backends/ckycr-mock` - CKYCR Mock Registry & Verification (Port 8001)
- `start.sh` - Unified launcher for all services
- `requirements.txt` - Unified Python dependencies

---

## 🚀 Setup from Scratch

Follow these steps to get the project running on a new machine.

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (3.11+)
- **ngrok** (Required for IDfy webhooks)

### 2. Installation

Install Frontend dependencies:
```bash
npm install
```

Install Backend dependencies:
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the root directory. You can use the `.env.example` as a template:
```bash
cp .env.example .env
```

**Required Variables:**
- `IDFY_ACCOUNT_ID` & `IDFY_API_KEY`: Get these from your IDfy dashboard.
- `NGROK_AUTHTOKEN`: Get this from your ngrok dashboard.

### 4. Seed the CKYCR Database (Optional)
If you want to start with a fresh CKYCR mock user:
```bash
cd backends/ckycr-mock
python scripts/seed_mock_data.py
cd ../..
```

### 5. Start the Monorepo
Run the unified launcher:
```bash
./start.sh
```
This will start the Next.js app, the IDfy API, and the CKYCR Mock server simultaneously.

---

## 📦 Sharing the project
When sharing this folder, **exclude** the following to keep the size small (~15MB instead of 1GB):
- `node_modules/`
- `.next/`
- `.venv/` or `venv/`
- `__pycache__/`

The recipient just needs to follow the **Installation** steps above to regenerate these.

---

## 🛠️ Troubleshooting
- **ModuleNotFoundError: No module named 'digilocker_auth'**: Ensure you ran `pip install -r requirements.txt` and that you are running `./start.sh` from the root.
- **ERR_NGROK_334**: This means a tunnel is already running. The script will try to recover automatically, but you can also kill all ngrok processes with `pkill ngrok`.
