import uuid
from django.db import models


class PhotoSource(models.TextChoices):
    LIVE = "LIVE", "Live capture"
    UPLOAD = "UPLOAD", "Upload (fallback)"


class Learner(models.Model):
    """
    A displaced or migrant learner is identified by a composite of attributes rather than formal ID.  
    """
    learner_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    photograph = models.ImageField(upload_to="learner_photos/", null=True, blank=True)
    photo_source = models.CharField(
        max_length=10,
        choices=PhotoSource.choices,
        default=PhotoSource.LIVE,
        help_text="LIVE is higher-assurance; UPLOAD is a flagged fallback for learners who cannot be captured live.",
    )
    date_or_estimated_age = models.CharField(
        max_length=50,
        blank=True,
        help_text="Exact DOB or estimated age, since many learners lack birth records.",
    )
    guardian_info = models.CharField(max_length=255, blank=True)
    place_of_origin = models.CharField(max_length=255, blank=True)

    created_by = models.ForeignKey(
        "accounts.Institution",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="registered_learners",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["full_name", "place_of_origin"]),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.place_of_origin or 'origin unknown'})"

    def find_potential_duplicates(self):
        """
        Flags existing profiles that share a name and origin (a lightweight first pass; fuzzy matching 
        is a documented refinement for a later sprint).
        """
        return Learner.objects.exclude(pk=self.pk).filter(
            full_name__iexact=self.full_name,
            place_of_origin__iexact=self.place_of_origin,
        )