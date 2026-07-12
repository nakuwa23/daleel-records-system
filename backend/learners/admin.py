from django.contrib import admin
from .models import Learner


@admin.register(Learner)
class LearnerAdmin(admin.ModelAdmin):
    list_display = ("full_name", "place_of_origin", "photo_source", "created_by", "created_at")
    list_filter = ("photo_source", "place_of_origin")
    search_fields = ("full_name", "place_of_origin", "parent_name")
    readonly_fields = ("learner_id", "created_at")