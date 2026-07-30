from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .services import verify_presented_record
from .models import VerificationMode


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_record(request):
    qr_payload = request.data.get("qr_payload")
    if not qr_payload:
        return Response({"detail": "qr_payload is required."}, status=400)

    verifier = getattr(request.user, "institution", None) if request.user.is_authenticated else None
    is_authentic, detail, extra = verify_presented_record(
        qr_payload, verifier=verifier, mode=VerificationMode.ONLINE, request=request
    )
    response = {"authentic": is_authentic, "detail": detail}
    if extra:
        response.update(extra)
    return Response(response)


@api_view(["POST"])
@permission_classes([AllowAny])
def sync_offline_verifications(request):
    entries = request.data.get("entries")
    if not isinstance(entries, list):
        return Response({"detail": "entries must be a list."}, status=400)

    verifier = getattr(request.user, "institution", None) if request.user.is_authenticated else None

    synced = 0
    for entry in entries:
        qr_payload = entry.get("qr_payload") if isinstance(entry, dict) else None
        if not qr_payload:
            continue
        verify_presented_record(qr_payload, verifier=verifier, mode=VerificationMode.OFFLINE)
        synced += 1

    return Response({"synced": synced})