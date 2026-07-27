from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .services import verify_presented_record
from .models import VerificationMode


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_record(request):
    qr_payload = request.data.get("qr_payload")
    if not qr_payload:
        return Response({"detail": "qr_payload is required."}, status=400)

    verifier = getattr(request.user, "institution", None)
    is_authentic, detail = verify_presented_record(
        qr_payload, verifier=verifier, mode=VerificationMode.ONLINE
    )
    return Response({"authentic": is_authentic, "detail": detail})