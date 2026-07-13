from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from learners.models import Learner
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