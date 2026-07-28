from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Institution
from .serializers import (
    InstitutionSerializer,
    RegisterSerializer,
    RoleTokenObtainPairSerializer,
)


class RoleTokenObtainPairView(TokenObtainPairView):
    serializer_class = RoleTokenObtainPairSerializer


class InstitutionListView(generics.ListAPIView):
    """Public list of institutions so a new user can join one at signup."""

    queryset = Institution.objects.all().order_by("name")
    serializer_class = InstitutionSerializer
    permission_classes = [AllowAny]


class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role,
                "is_superuser": user.is_superuser,
            },
            status=status.HTTP_201_CREATED,
        )
