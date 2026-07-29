from records import crypto
from accounts.models import Institution
from learners.models import Learner
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
        return False, "Incomplete record data", None

    public_key = get_public_key(issuer_id)
    if public_key is None:
        _log(record, verifier, VerificationResult.INVALID, mode)
        return False, "Unknown issuer — cannot verify", None

    is_authentic = crypto.verify_record(record, signature, public_key)
    result = VerificationResult.AUTHENTIC if is_authentic else VerificationResult.INVALID
    _log(record, verifier, result, mode)

    if not is_authentic:
        return False, "Signature invalid — record may have been altered", None

    extra = {
        "record": record,
        "learner_name": _lookup_learner_name(record.get("learnerId")),
        "issuer_name": _lookup_issuer_name(issuer_id),
    }
    return True, "Record is authentic and unaltered", extra


def _lookup_learner_name(learner_id):
    if not learner_id:
        return None
    try:
        return Learner.objects.get(pk=learner_id).full_name
    except Learner.DoesNotExist:
        return None


def _lookup_issuer_name(issuer_id):
    try:
        return Institution.objects.get(pk=issuer_id).name
    except Institution.DoesNotExist:
        return None


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