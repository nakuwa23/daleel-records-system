from rest_framework import serializers
from .models import AcademicRecord


class IssueRecordSerializer(serializers.Serializer):
    """Input for issuing a record."""
    learner_id = serializers.UUIDField()
    level_completed = serializers.CharField(max_length=100)
    academic_year = serializers.CharField(max_length=20)
    subject_results = serializers.JSONField()
    completion_outcome = serializers.ChoiceField(
        choices=["PASSED", "PROMOTED", "OTHER"], default="PROMOTED"
    )


class AcademicRecordSerializer(serializers.ModelSerializer):
    """Output representation of an issued record."""
    class Meta:
        model = AcademicRecord
        fields = [
            "record_id", "learner", "issuer", "level_completed",
            "academic_year", "subject_results", "completion_outcome",
            "status", "issued_at",
        ]
        read_only_fields = fields