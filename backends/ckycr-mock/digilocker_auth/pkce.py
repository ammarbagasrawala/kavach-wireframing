import base64
import hashlib
import secrets


def base64_url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode('utf-8').rstrip('=')


def create_code_verifier(byte_length: int = 32) -> str:
    verifier = base64_url_encode(secrets.token_bytes(byte_length))
    if len(verifier) < 43:
        raise ValueError('PKCE code_verifier must be at least 43 characters')
    if len(verifier) > 128:
        raise ValueError('PKCE code_verifier must be at most 128 characters')
    return verifier


def create_code_challenge(code_verifier: str) -> str:
    digest = hashlib.sha256(code_verifier.encode('utf-8')).digest()
    return base64_url_encode(digest)


def create_pkce_pair(byte_length: int = 32) -> dict:
    code_verifier = create_code_verifier(byte_length)
    return {
        'code_verifier': code_verifier,
        'code_challenge': create_code_challenge(code_verifier),
        'code_challenge_method': 'S256',
    }


def create_state(byte_length: int = 16) -> str:
    return base64_url_encode(secrets.token_bytes(byte_length))
