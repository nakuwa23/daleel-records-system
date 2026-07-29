from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from records import crypto

from .models import Institution, InstitutionRole, Role, User


class RoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds the authenticated user's role to the token response so the frontend can tailor its UI."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = self.user.role
        data["is_superuser"] = self.user.is_superuser
        return data


class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ["institution_id", "name", "location", "public_key"]


class RegisterSerializer(serializers.Serializer):

    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=[Role.ISSUER_STAFF, Role.VERIFIER_STAFF]
    )
    institution_mode = serializers.ChoiceField(choices=["create", "join"])

    institution_name = serializers.CharField(required=False, allow_blank=True)
    institution_location = serializers.CharField(required=False, allow_blank=True)
    institution_id = serializers.UUIDField(required=False)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("That username is already taken.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs["institution_mode"] == "create":
            if not attrs.get("institution_name", "").strip():
                raise serializers.ValidationError(
                    {"institution_name": "Required when creating a new institution."}
                )
        else:
            institution_id = attrs.get("institution_id")
            if not institution_id:
                raise serializers.ValidationError(
                    {"institution_id": "Required when joining an existing institution."}
                )
            if not Institution.objects.filter(pk=institution_id).exists():
                raise serializers.ValidationError(
                    {"institution_id": "No institution with that ID exists."}
                )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        if validated_data["institution_mode"] == "create":
            private_key, public_key = crypto.generate_keypair()
            institution = Institution.objects.create(
                name=validated_data["institution_name"].strip(),
                location=validated_data.get("institution_location", "").strip(),
                role=InstitutionRole.BOTH,
                private_key=private_key,
                public_key=public_key,
            )
        else:
            institution = Institution.objects.get(pk=validated_data["institution_id"])

        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            role=validated_data["role"],
            institution=institution,
        )
