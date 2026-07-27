from django.contrib import admin
from .models import VerificationLog


@admin.register(VerificationLog)
class VerificationLogAdmin(admin.ModelAdmin):
    list_display = ("record_id", "result", "mode", "verified_by", "verified_at")
    list_filter = ("result", "mode")