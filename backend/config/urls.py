from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from records.views import issue_record
from records.views import issue_record, record_detail, learner_records

from learners.views import LearnerViewSet

router = DefaultRouter()
router.register(r"learners", LearnerViewSet, basename="learner")

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth (JWT)
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Domain APIs
    path("api/", include(router.urls)),
    path("api/records/issue/", issue_record, name="issue_record"),

    path("api/records/<uuid:record_id>/", record_detail, name="record_detail"),
    path("api/learners/<uuid:learner_id>/records/", learner_records, name="learner_records"),
]