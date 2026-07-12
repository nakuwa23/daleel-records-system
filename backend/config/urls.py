from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from learners.views import LearnerViewSet

router = DefaultRouter()
router.register(r"learners", LearnerViewSet, basename="learner")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]