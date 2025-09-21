from rest_framework import serializers
from .models import Attempt

class AttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attempt
        fields = ["id", "student", "question", "answer", "is_correct", "score", "feedback", "submitted_at"]
        read_only_fields = ["student", "is_correct", "score", "feedback", "submitted_at"]