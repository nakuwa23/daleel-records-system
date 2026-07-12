import json
import base64
import hashlib
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey,
)
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature


def generate_keypair():
    """
    Generate a new Ed25519 key pair for an institution.
    Returns (private_key_b64, public_key_b64) as base64 strings for easy storage.
    """
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key()

    private_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PrivateFormat.Raw,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )
    return (
        base64.b64encode(private_bytes).decode("ascii"),
        base64.b64encode(public_bytes).decode("ascii"),
    )

def canonical_payload(record_dict: dict) -> bytes:
    return json.dumps(
        record_dict,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")


def record_hash(record_dict: dict) -> str:
    """SHA-256 fingerprint of the canonical payload (hex), stored on the signature."""
    return hashlib.sha256(canonical_payload(record_dict)).hexdigest()


def sign_record(record_dict: dict, private_b64: str) -> str:
    """
    Sign a record's canonical payload with an institution's private key.
    Returns a base64 signature (64 raw bytes before encoding).
    """
    private_key = Ed25519PrivateKey.from_private_bytes(base64.b64decode(private_b64))
    signature = private_key.sign(canonical_payload(record_dict))
    return base64.b64encode(signature).decode("ascii")


def verify_record(record_dict: dict, signature_b64: str, public_b64: str) -> bool:
    try:
        public_key = Ed25519PublicKey.from_public_bytes(base64.b64decode(public_b64))
        signature = base64.b64decode(signature_b64)
        public_key.verify(signature, canonical_payload(record_dict))
        return True
    except (InvalidSignature, ValueError, Exception):
        return False