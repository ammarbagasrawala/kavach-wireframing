"""Optional ngrok tunnel for IDfy webhook + redirect URLs (same idea as DIGILOCKER_PAN_ADHAAR_FLOW/main.py)."""

from __future__ import annotations

import logging
import os
import time

from app.config import settings

logger = logging.getLogger(__name__)

_ngrok_started = False


def _apply_https_webhook_fallback(reason: str) -> str | None:
    """
    When auto-ngrok cannot bind (e.g. ERR_NGROK_334: reserved domain already online elsewhere),
    use IDFY_WEBHOOK_BASE_URL if it is HTTPS so IDfy redirect_url/callback_url still work.
    """
    b = (settings.idfy_webhook_base_url or "").strip().rstrip("/")
    if b.lower().startswith("https://"):
        os.environ["KAVACH_IDFY_PUBLIC_BASE"] = b
        logger.warning(
            "ngrok unavailable (%s); using IDFY_WEBHOOK_BASE_URL=%s for IDfy public base",
            reason,
            b,
        )
        return b
    logger.error(
        "ngrok failed and IDFY_WEBHOOK_BASE_URL is not HTTPS (got %r). "
        "IDfy rejects http://127.0.0.1 redirect URLs. Set IDFY_WEBHOOK_BASE_URL=https://your-tunnel "
        "or stop the other process using your reserved ngrok domain.",
        b or "(empty)",
    )
    return None


def setup_ngrok_if_configured() -> str | None:
    """
    If USE_NGROK and NGROK_AUTHTOKEN are set, expose local API on a public HTTPS URL
    and set KAVACH_IDFY_PUBLIC_BASE so IDfy callbacks work.
    """
    global _ngrok_started
    if not settings.use_ngrok or not (settings.ngrok_authtoken or "").strip():
        logger.info("ngrok disabled (USE_NGROK=false or NGROK_AUTHTOKEN empty)")
        return None
    try:
        from pyngrok import ngrok
        from pyngrok.exception import PyngrokNgrokHTTPError

        ngrok.set_auth_token(settings.ngrok_authtoken.strip())
        port = settings.ngrok_local_port

        # Previous uvicorn/ngrok may have left a tunnel online (ERR_NGROK_334). Clear before connect.
        try:
            ngrok.kill()
        except Exception:
            pass

        domain = (settings.ngrok_domain or "").strip()

        def _connect():
            if domain:
                return ngrok.connect(port, domain=domain)
            return ngrok.connect(port)

        try:
            tunnel = _connect()
        except PyngrokNgrokHTTPError as e:
            err = str(e).lower()
            if "already online" in err or "err_ngrok_334" in err or "334" in err:
                logger.warning("ngrok: stale tunnel detected, killing agent and retrying once")
                try:
                    ngrok.kill()
                except Exception:
                    pass
                time.sleep(0.5)
                try:
                    tunnel = _connect()
                except PyngrokNgrokHTTPError as e2:
                    fb = _apply_https_webhook_fallback(f"ERR_NGROK_334 after retry: {e2}")
                    if fb:
                        return fb
                    raise
            else:
                raise

        public_url = tunnel.public_url.rstrip("/")
        os.environ["KAVACH_IDFY_PUBLIC_BASE"] = public_url
        _ngrok_started = True
        logger.info("ngrok: public URL %s -> localhost:%s (IDfy webhook/redirect)", public_url, port)
        return public_url
    except Exception as e:
        fb = _apply_https_webhook_fallback(str(e))
        if fb:
            return fb
        logger.exception("ngrok failed to start: %s", e)
        return None


def teardown_ngrok() -> None:
    global _ngrok_started
    if settings.use_ngrok and (settings.ngrok_authtoken or "").strip():
        try:
            from pyngrok import ngrok

            ngrok.kill()
        except Exception as e:
            logger.warning("ngrok shutdown: %s", e)
    os.environ.pop("KAVACH_IDFY_PUBLIC_BASE", None)
    _ngrok_started = False
