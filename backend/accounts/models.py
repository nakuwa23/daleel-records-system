"""
Accounts domain module managing institutional contexts and staff authorization profiles.
"""

import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class Role(models.TextChoices):
    ISSUER_STAFF = "ISSUER_STAFF", "Issuer Staff"
    VERIFIER_STAFF = "VERIFIER_STAFF", "Verifier Staff"
    ADMINISTRATOR = "ADMINISTRATOR", "Administrator"


class InstitutionRole(models.TextChoices):
    ISSUER = "ISSUER", "Issuer"
    VERIFIER = "VERIFIER", "Verifier"
    BOTH = "BOTH", "Both"


class Institution(models.Model):
    """
    Represents an issuing or verifying authority or academic body.

    Owns an Ed25519 cryptographic key pair where the private key signs records 
    at issuance and the public key is distributed for verification. 
    
    NOTE: Storing the private key in the database is an MVP-only simplification; production system will use a KMS/HSM.
    """
    institution_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=10, choices=InstitutionRole.choices, default=InstitutionRole.BOTH)

    public_key = models.TextField(help_text="Base64 Ed25519 public key")
    private_key = models.TextField(help_text="Base64 Ed25519 private key (MVP only)")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role})"


class User(AbstractUser):
    """
    Authenticated institutional staff member or platform administrator.

    Extends Django's AbstractUser lifecycle with a UUID primary key, explicit 
    RBAC assignment via Role enums, and a relational link to a parent Institution. 
    Core authentication, hashing, and JWT flows are delegated to Django and 
    SimpleJWT.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.ISSUER_STAFF)
    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="users",
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.username} [{self.role}]"