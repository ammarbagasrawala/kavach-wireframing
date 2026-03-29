import os
import uuid
import json
import logging
import urllib.parse
from typing import Dict, Any, Optional, Literal, Union, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load environment variables from .env file
load_dotenv()

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start ngrok if enabled
    if os.getenv("USE_NGROK", "true").lower() == "true":
        from pyngrok import ngrok
        
        # Set authtoken if provided in environment
        auth_token = os.getenv("NGROK_AUTHTOKEN")
        if auth_token:
            ngrok.set_auth_token(auth_token)
            
        port = int(os.getenv("PORT", "8000"))
        public_url = ngrok.connect(port).public_url
        logger.info(f"ngrok tunnel started! Your webhook URL is: {public_url}")
        # Override the webhook base URL for the app to use
        os.environ["WEBHOOK_BASE_URL"] = public_url
    yield
    # Cleanup on shutdown
    if os.getenv("USE_NGROK", "true").lower() == "true":
        from pyngrok import ngrok
        ngrok.kill()

app = FastAPI(
    title="DigiLocker Integration API",
    description="FastAPI service for IDfy DigiLocker document fetch integration",
    version="1.0.0",
    lifespan=lifespan
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for webhook results
results_store: Dict[str, Any] = {}

class StartDigilockerResponse(BaseModel):
    task_id: str
    redirect_url: str

class StartDigilockerRequest(BaseModel):
    # Optional overrides
    reference_id: Optional[str] = None
    redirect_url: Optional[str] = None
    doc_type: Optional[Union[str, List[str]]] = "ADHAR"
    extra_fields: Optional[Dict[str, Any]] = {}

IDFY_API_URL = "https://eve.idfy.com/v3/tasks/sync/verify_with_source/ind_digilocker_fetch_documents"

@app.get("/status")
async def health_check():
    """Health check so the frontend can detect if the backend is alive."""
    return {"status": "ok", "service": "DigiLocker Integration API", "version": "1.0.0"}

@app.get("/")
async def serve_ui():
    """Serve the frontend application for running the flow."""
    if not os.path.exists("index.html"):
        return {"error": "index.html not found. Start the frontend setup."}
    return FileResponse("index.html")

@app.post("/start-digilocker", response_model=StartDigilockerResponse)
async def start_digilocker(request_data: Optional[StartDigilockerRequest] = None):
    """
    Trigger the IDfy DigiLocker API and return the task_id and redirect_url.
    """
    # Retrieve credentials from environment
    account_id = os.getenv("IDFY_ACCOUNT_ID")
    api_key = os.getenv("IDFY_API_KEY")
    webhook_base = os.getenv("WEBHOOK_BASE_URL", "http://localhost:8000")
    
    if not account_id or not api_key:
        logger.error("Missing IDfy credentials in environment variables")
        raise HTTPException(status_code=500, detail="Server Configuration Error: Missing credentials")

    # Generate task and group UUIDs
    task_id = str(uuid.uuid4())
    group_id = str(uuid.uuid4())
    
    # Callback URL for the webhook
    callback_url = os.getenv("IDFY_WEBHOOK_URL")
    if not callback_url:
        webhook_base = os.environ.get("WEBHOOK_BASE_URL", "http://localhost:8000")
        callback_url = f"{webhook_base.rstrip('/')}/webhook/idfy?task_id={task_id}"

    # Payload Construction
    # If a custom redirect_url is provided, we bounce it through our ngrok `/app-redirect`
    # We MUST URL encode the target URL so IDfy's javascript redirect doesn't break on unescaped slashes/colons.
    if request_data and request_data.redirect_url:
        target_encoded = urllib.parse.quote_plus(request_data.redirect_url)
        actual_redirect = f"{webhook_base.rstrip('/')}/app-redirect?task_id={task_id}&target={target_encoded}"
    else:
        actual_redirect = f"{webhook_base.rstrip('/')}/?task_id={task_id}"

    payload = {
        "task_id": task_id,
        "group_id": group_id,
        "data": {
            "version": "2",
            "reference_id": request_data.reference_id if request_data and request_data.reference_id else str(uuid.uuid4()),
            "key_id": os.getenv("IDFY_KEY_ID"),
            "ou_id": os.getenv("IDFY_OU_ID"),
            "secret": os.getenv("IDFY_SECRET"),
            "callback_url": callback_url,
            # Use the specified doc_type or fallback to ADHAR
            "doc_type": request_data.doc_type if request_data else "ADHAR",
            "file_format": "xml",         # Based on user requirements
            "redirect_url": actual_redirect,
            "consent": "Y",               # Based on user requirements
            "extra_fields": request_data.extra_fields if request_data and request_data.extra_fields else {}
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "account-id": account_id,
        "api-key": api_key
    }
    
    logger.info(f"Starting DigiLocker flow with task_id: {task_id}")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(IDFY_API_URL, json=payload, headers=headers, timeout=15.0)
            response.raise_for_status()
            
            response_data = response.json()
            
            # Extract redirect url based on IDfy's response structure
            redirect_url = response_data.get("redirect_url") or response_data.get("capture_link")
            
            if not redirect_url and "data" in response_data:
                 redirect_url = response_data["data"].get("redirect_url") or response_data["data"].get("capture_link")
            
            # Check the nested 'result' -> 'source_output' property as per API documentation
            if not redirect_url and "result" in response_data and "source_output" in response_data["result"]:
                 redirect_url = response_data["result"]["source_output"].get("redirect_url")
            
            if not redirect_url:
                logger.warning(f"Could not find redirect_url in IDfy response. Full response: {response_data}")
                # IDfy sometimes may not return a capture link on failure directly but rather an error
                redirect_url = "UNKNOWN_REDIRECT_URL"
            
            return StartDigilockerResponse(
                task_id=task_id,
                redirect_url=redirect_url
            )
            
        except httpx.HTTPStatusError as e:
            logger.error(f"IDfy API returned an error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=f"IDfy API error: {e.response.text}")
        except Exception as e:
            logger.error(f"Failed to communicate with IDfy API: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/webhook/idfy")
async def idfy_webhook(request: Request, task_id: Optional[str] = None):
    """
    Webhook endpoint to receive responses from IDfy upon completion.
    """
    try:
        payload = await request.json()
        logger.info(f"Received IDfy webhook: {payload}")
        
        # Extract task_id from payload if query param isn't present
        if not task_id:
            task_id = payload.get("task_id")
        
        if not task_id and "data" in payload:
            task_id = payload["data"].get("task_id")
            
        if task_id:
            # Store the result securely in memory so the frontend can poll for it later
            results_store[task_id] = payload
            logger.info(f"Stored webhook result for task_id: {task_id}")
            
            # Save to disk in a request-wise folder
            folder_path = os.path.join("results", task_id)
            os.makedirs(folder_path, exist_ok=True)
            file_path = os.path.join(folder_path, "result.json")
            import json
            with open(file_path, "w") as f:
                json.dump(payload, f, indent=4)
            logger.info(f"Saved result.json locally at {file_path}")
            
            return {"status": "received", "message": "Webhook processed successfully"}
        else:
            logger.warning("Webhook received without an identifiable task_id")
            return {"status": "error", "message": "Webhook received without an identifiable task_id"}
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        # Return 200 OK so webhook is marked as delivered, avoiding unnecessary retries for parsing errors.
        return {"status": "error", "message": "Failed to process payload"}

@app.get("/result/{task_id}")
async def get_result(task_id: str):
    """
    Endpoint for frontend to poll to check if webhook has arrived.
    """
    logger.info(f"Checking result for task_id: {task_id}")
    
    # Check in-memory store first for speed
    if task_id in results_store:
        return {
            "status": "completed",
            "task_id": task_id,
            "data": results_store[task_id]
        }
        
    # Check persistent disk storage
    import os, json
    file_path = os.path.join("results", task_id, "result.json")
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            data = json.load(f)
            # Hydrate memory cache for speed later
            results_store[task_id] = data
            return {
                "status": "completed",
                "task_id": task_id,
                "data": data
            }
            
    else:
        return {
            "status": "pending",
            "task_id": task_id,
            "message": "Waiting for webhook completion."
        }

@app.get("/app-redirect")
async def app_redirect(target: str, task_id: str):
    # Safely bounce the user back to the target URL with their task_id
    separator = "&" if "?" in target else "?"
    full_url = f"{target}{separator}idfy_task_id={task_id}"
    logger.info(f"Bouncing user back to Next.js app: {full_url}")
    return RedirectResponse(url=full_url)
