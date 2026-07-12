import uuid
from django.db import models


class RecordStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    SIGNED = "SIGNED", "Signed"
    SYNCED = "SYNCED", "Synced"


class CompletionOutcome(models.TextChoices):
    PASSED = "PASSED", "Passed"
    PROMOTED = "PROMOTED", "Promoted"
    OTHER = "OTHER", "Other"


class AcademicRecord(models.Model):
    record_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    learner = models.ForeignKey(
        "learners.Learner",
        on_delete=models.CASCADE,
        related_name="academic_records",   # cumulative history
    )
    issuer = models.ForeignKey(
        "accounts.Institution",
        on_delete=models.PROTECT,          
        related_name="issued_records",
    )

    level_completed = models.CharField(max_length=100)
    academic_year = models.CharField(max_length=20)
    subject_results = models.JSONField(
        default=dict,
        help_text="Finalized per-subject results, e.g. {'Math': 87, 'English': 72}.",
    )
    completion_outcome = models.CharField(
        max_length=10, choices=CompletionOutcome.choices, default=CompletionOutcome.PROMOTED
    )

    status = models.CharField(max_length=10, choices=RecordStatus.choices, default=RecordStatus.DRAFT)
    issued_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.learner.full_name} - {self.level_completed} ({self.academic_year})"

    def signable_dict(self):
        return {
            "recordId": str(self.record_id),
            "learnerId": str(self.learner_id),
            "issuerId": str(self.issuer_id),
            "levelCompleted": self.level_completed,
            "academicYear": self.academic_year,
            "subjectResults": self.subject_results,
            "completionOutcome": self.completion_outcome,
        }


class DigitalSignature(models.Model):
    record = models.OneToOneField(
        AcademicRecord,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="signature",
    )
    signature_value = models.TextField(help_text="Base64 Ed25519 signature (64 bytes).")
    record_hash = models.CharField(max_length=64, help_text="SHA-256 hex of the canonical payload.")
    issuer_id = models.UUIDField()
    signed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Signature for {self.record_id}"