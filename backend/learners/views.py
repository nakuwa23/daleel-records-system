from rest_framework import permissions, viewsets
from .models import Learner
from .serializers import LearnerSerializer


class IsOwnerInstitutionOrReadOnly(permissions.BasePermission):
    """
    Any authenticated user can view a learner profile (so a receiving
    institution can find a transferring learner), but only the institution
    that registered the learner or a superuser can edit or delete it.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_superuser:
            return True
        return obj.created_by_id is not None and obj.created_by_id == request.user.institution_id


class LearnerViewSet(viewsets.ModelViewSet):
    """Full CRUD for learner identity profiles."""
    queryset = Learner.objects.all().order_by("-created_at")
    serializer_class = LearnerSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerInstitutionOrReadOnly]

    def perform_create(self, serializer):
        institution = getattr(self.request.user, "institution", None)
        serializer.save(created_by=institution)