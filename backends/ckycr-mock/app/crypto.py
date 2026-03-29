"""CKYC Search API v1.3 crypto: AES PID, RSA-OAEP-SHA256 session key, XML-DSig (SHA256)."""

from __future__ import annotations

import base64
import os
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.serialization import load_pem_private_key, load_pem_public_key
from lxml import etree
from signxml import XMLSigner, XMLVerifier, methods
from signxml.algorithms import CanonicalizationMethod
from signxml.verifier import SignatureConfiguration

from app.rsa_keys import generate_rsa_keypair  # noqa: F401 — re-exported for callers

AES_BLOCK = 16
SESSION_KEY_BYTES = 32  # 256-bit


def load_private_key_pem(path_or_pem: Path | str | bytes):
    if isinstance(path_or_pem, bytes):
        data = path_or_pem
    else:
        data = Path(path_or_pem).read_bytes()
    return load_pem_private_key(data, password=None)


def load_public_key_pem(path_or_pem: Path | str | bytes):
    if isinstance(path_or_pem, bytes):
        data = path_or_pem
    else:
        data = Path(path_or_pem).read_bytes()
    return load_pem_public_key(data)


def encrypt_pid_aes(pid_xml_bytes: bytes, session_key: bytes) -> bytes:
    """AES-256-CBC with random IV prepended (PKCS7 padding)."""
    if len(session_key) != SESSION_KEY_BYTES:
        raise ValueError("Session key must be 256 bits")
    iv = os.urandom(AES_BLOCK)
    pad_len = AES_BLOCK - (len(pid_xml_bytes) % AES_BLOCK)
    padded = pid_xml_bytes + bytes([pad_len]) * pad_len
    cipher = Cipher(algorithms.AES(session_key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    ct = encryptor.update(padded) + encryptor.finalize()
    return iv + ct


def decrypt_pid_aes(blob: bytes, session_key: bytes) -> bytes:
    if len(session_key) != SESSION_KEY_BYTES:
        raise ValueError("Session key must be 256 bits")
    if len(blob) < AES_BLOCK + AES_BLOCK:
        raise ValueError("Invalid encrypted PID length")
    iv = blob[:AES_BLOCK]
    ct = blob[AES_BLOCK:]
    cipher = Cipher(algorithms.AES(session_key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    padded = decryptor.update(ct) + decryptor.finalize()
    pad_len = padded[-1]
    if pad_len < 1 or pad_len > AES_BLOCK:
        raise ValueError("Invalid PKCS7 padding")
    return padded[:-pad_len]


def encrypt_session_key_rsa_oaep_sha256(session_key: bytes, public_key) -> bytes:
    return public_key.encrypt(
        session_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )


def decrypt_session_key_rsa_oaep_sha256(blob: bytes, private_key) -> bytes:
    return private_key.decrypt(
        blob,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )


def b64e(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii")


def b64d(s: str) -> bytes:
    return base64.b64decode(s, validate=False)


def verify_enveloped_xml_signature(req_root: etree._Element, fi_public_key_pem: bytes) -> None:
    """Verify XML-DSig enveloped signature; assert signing key matches registered FI public key PEM."""
    config = SignatureConfiguration(require_x509=False)
    result = XMLVerifier().verify(req_root, expect_config=config)
    if result.signature_key.strip() != fi_public_key_pem.strip():
        raise ValueError("Signature key does not match registered FI public key")


def sign_enveloped_xml_response(
    req_root: etree._Element,
    cersai_private_key,
    cersai_cert_pem: bytes | None = None,
) -> etree._Element:
    """
    Sign entire REQ_ROOT with CERSAI private key (rsa-sha256, enveloped).
    If cert_pem is provided, include KeyInfo for clients that expect a certificate chain.
    """
    signer = XMLSigner(
        method=methods.enveloped,
        signature_algorithm="rsa-sha256",
        digest_algorithm="sha256",
        c14n_algorithm=CanonicalizationMethod.CANONICAL_XML_1_0,
    )
    if cersai_cert_pem:
        return signer.sign(req_root, key=cersai_private_key, cert=cersai_cert_pem)
    return signer.sign(req_root, key=cersai_private_key)
