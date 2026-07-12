from rest_framework import viewsets
from .models import Learner
from .serializers import LearnerSerializer


class LearnerViewSet(viewsets.ModelViewSet):
    """Full CRUD for learner identity profiles."""
    queryset = Learner.objects.all().order_by("-created_at")
    serializer_class = LearnerSerializer

    def perform_create(self, serializer):
        institution = getattr(self.request.user, "institution", None)
        serializer.save(created_by=institution)