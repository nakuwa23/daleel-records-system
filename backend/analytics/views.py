from django.db.models import Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import Institution, Role
from learners.models import Learner
from records.models import AcademicRecord
from verification.models import VerificationLog


def _counts_by(queryset, field):
    rows = queryset.values(field).annotate(count=Count("pk"))
    return {row[field]: row["count"] for row in rows}


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def analytics_summary(request):
    """
    Institution admins see their own institution's activity.
    Superusers see activity pooled across every institution on the platform.
    """
    user = request.user
    platform_wide = user.is_superuser

    if not platform_wide and user.role != Role.ADMINISTRATOR:
        return Response(
            {"detail": "Analytics are only available to administrators."}, status=403
        )

    institution = None
    if platform_wide:
        learners = Learner.objects.all()
        records = AcademicRecord.objects.all()
        verifications = VerificationLog.objects.all()
    else:
        institution = user.institution
        if institution is None:
            return Response(
                {"detail": "Your account is not linked to an institution."}, status=400
            )
        learners = Learner.objects.filter(created_by=institution)
        records = AcademicRecord.objects.filter(issuer=institution)
        verifications = VerificationLog.objects.filter(verified_by=institution)

    data = {
        "scope": "platform" if platform_wide else "institution",
        "institution": (
            {"institution_id": str(institution.institution_id), "name": institution.name}
            if institution
            else None
        ),
        "totals": {
            "learners": learners.count(),
            "records": records.count(),
            "verifications": verifications.count(),
            "institutions": Institution.objects.count() if platform_wide else 1,
        },
        "records_by_outcome": _counts_by(records, "completion_outcome"),
        "records_by_status": _counts_by(records, "status"),
        "verifications_by_result": _counts_by(verifications, "result"),
        "verifications_by_mode": _counts_by(verifications, "mode"),
    }

    if platform_wide:
        top = (
            Institution.objects.annotate(
                learner_count=Count("registered_learners", distinct=True),
                record_count=Count("issued_records", distinct=True),
                verification_count=Count("verifications", distinct=True),
            )
            .order_by("-record_count")
            .values(
                "institution_id", "name", "learner_count", "record_count", "verification_count"
            )[:10]
        )
        data["top_institutions"] = list(top)

    return Response(data)
