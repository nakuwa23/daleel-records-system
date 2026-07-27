from records import crypto
from accounts.models import Institution
from .models import VerificationLog, VerificationResult, VerificationMode


def get_public_key(issuer_id):
    """Find an issuer's public key by ID, returning the key string or None."""
    try:
        return Institution.objects.get(pk=issuer_id).public_key
    except Institution.DoesNotExist:
        return None


def verify_presented_record(qr_payload, *, verifier=None, mode=VerificationMode.ONLINE):
    record = qr_payload.get("record")
    signature = qr_payload.get("signature")
    issuer_id = qr_payload.get("issuerId")

    if not record or not signature or not issuer_id:
        return False, "Incomplete record data"

    public_key = get_public_key(issuer_id)
    if public_key is None:
        _log(record, verifier, VerificationResult.INVALID, mode)
        return False, "Unknown issuer — cannot verify"

    is_authentic = crypto.verify_record(record, signature, public_key)
    result = VerificationResult.AUTHENTIC if is_authentic else VerificationResult.INVALID
    _log(record, verifier, result, mode)

    detail = (
        "Record is authentic and unaltered"
        if is_authentic
        else "Signature invalid — record may have been altered"
    )
    return is_authentic, detail


def _log(record, verifier, result, mode):
    """Record the verification event for auditability."""
    record_id = (record or {}).get("recordId")
    if record_id:
        VerificationLog.objects.create(
            record_id=record_id,
            verified_by=verifier,
            result=result,
            mode=mode,
        )