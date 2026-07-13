from django.db import transaction
from .models import AcademicRecord, DigitalSignature, RecordStatus
from . import crypto


@transaction.atomic
def issue_signed_record(*, learner, issuer, level_completed, academic_year,
                        subject_results, completion_outcome):
    """Create and cryptographically sign an academic record."""
    record = AcademicRecord.objects.create(
        learner=learner,
        issuer=issuer,
        level_completed=level_completed,
        academic_year=academic_year,
        subject_results=subject_results,
        completion_outcome=completion_outcome,
        status=RecordStatus.DRAFT,
    )

    payload = record.signable_dict()
    signature_b64 = crypto.sign_record(payload, issuer.private_key)
    record_hash = crypto.record_hash(payload)

    DigitalSignature.objects.create(
        record=record,
        signature_value=signature_b64,
        record_hash=record_hash,
        issuer_id=issuer.institution_id,
    )
    record.status = RecordStatus.SIGNED
    record.save(update_fields=["status"])
    return record


def build_qr_payload(record):
    return {
        "record": record.signable_dict(),
        "signature": record.signature.signature_value,
        "issuerId": str(record.issuer_id),
    }