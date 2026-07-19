from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from learners.models import Learner
from .models import AcademicRecord
from .serializers import IssueRecordSerializer, AcademicRecordSerializer
from .services import issue_signed_record, build_qr_payload


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def issue_record(request):
    """Issue and sign an academic record."""
    serializer = IssueRecordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    institution = getattr(request.user, "institution", None)
    if institution is None:
        return Response(
            {"detail": "Your account is not linked to an institution."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        learner = Learner.objects.get(pk=data["learner_id"])
    except Learner.DoesNotExist:
        return Response({"detail": "Learner not found."}, status=status.HTTP_404_NOT_FOUND)

    record = issue_signed_record(
        learner=learner,
        issuer=institution,
        level_completed=data["level_completed"],
        academic_year=data["academic_year"],
        subject_results=data["subject_results"],
        completion_outcome=data["completion_outcome"],
    )
    return Response(
        {
            "record": AcademicRecordSerializer(record).data,
            "qr_payload": build_qr_payload(record),
        },
        status=status.HTTP_201_CREATED,
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def record_detail(request, record_id):
    """Fetch one record with its QR payload, for presentation."""
    try:
        record = AcademicRecord.objects.get(pk=record_id)
    except AcademicRecord.DoesNotExist:
        return Response({"detail": "Record not found."}, status=404)

    return Response({
        "record": AcademicRecordSerializer(record).data,
        "qr_payload": build_qr_payload(record),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def learner_records(request, learner_id):
    """List all records for a given learner (their academic history)."""
    records = AcademicRecord.objects.filter(learner_id=learner_id).order_by("-issued_at")
    return Response(AcademicRecordSerializer(records, many=True).data)