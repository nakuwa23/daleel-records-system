from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Institution, User


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ("name", "location", "role", "created_at")
    search_fields = ("name", "location")


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "institution", "is_staff")
    list_filter = ("role", "is_staff", "is_superuser")
    fieldsets = UserAdmin.fieldsets + (
        ("Daleel", {"fields": ("role", "institution")}),
    )