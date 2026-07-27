import uuid
from django.db import models


class VerificationResult(models.TextChoices):
    AUTHENTIC = "AUTHENTIC", "Authentic"
    INVALID = "INVALID", "Invalid"


class VerificationMode(models.TextChoices):
    ONLINE = "ONLINE", "Online"
    OFFLINE = "OFFLINE", "Offline"


class VerificationLog(models.Model):
    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    record_id = models.UUIDField(help_text="The record that was checked (may be external).")
    verified_by = models.ForeignKey(
        "accounts.Institution",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verifications",
    )
    verified_at = models.DateTimeField(auto_now_add=True)
    result = models.CharField(max_length=10, choices=VerificationResult.choices)
    mode = models.CharField(max_length=10, choices=VerificationMode.choices, default=VerificationMode.ONLINE)

    def __str__(self):
        return f"{self.record_id} -> {self.result} ({self.mode})"