from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from records.views import issue_record
from records.views import issue_record, record_detail, learner_records
from verification.views import verify_record, sync_offline_verifications

from accounts.views import InstitutionListView, RegisterView, RoleTokenObtainPairView
from analytics.views import analytics_summary
from learners.views import LearnerViewSet

router = DefaultRouter()
router.register(r"learners", LearnerViewSet, basename="learner")

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth (JWT)
    path("api/auth/token/", RoleTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/register/", RegisterView.as_view(), name="register"),

    # Domain APIs
    path("api/institutions/", InstitutionListView.as_view(), name="institution_list"),
    path("api/", include(router.urls)),
    path("api/records/issue/", issue_record, name="issue_record"),
    path("api/verify/", verify_record, name="verify_record"),
    path("api/verify/sync/", sync_offline_verifications, name="sync_offline_verifications"),
    path("api/records/<uuid:record_id>/", record_detail, name="record_detail"),
    path("api/learners/<uuid:learner_id>/records/", learner_records, name="learner_records"),
    path("api/analytics/summary/", analytics_summary, name="analytics_summary"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)