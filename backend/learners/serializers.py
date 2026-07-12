from rest_framework import serializers
from .models import Learner


class LearnerSerializer(serializers.ModelSerializer):
    potential_duplicates = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Learner
        fields = [
            "learner_id", "full_name", "photograph", "photo_source",
            "date_or_estimated_age", "parent_name", "parent_contact",
            "place_of_origin", "created_by", "created_at", "potential_duplicates",
        ]
        read_only_fields = ["learner_id", "created_by", "created_at"]

    def get_potential_duplicates(self, obj):
        return [
            {"learner_id": str(d.learner_id), "full_name": d.full_name}
            for d in obj.find_potential_duplicates()
        ]