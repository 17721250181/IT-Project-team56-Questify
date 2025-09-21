from rest_framework import serializers
from .models import Attempt

class AttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attempt
        fields = ["id", "question", "answer", "is_correct", "submitted_at"]
        read_only_fields = ["is_correct", "score", "feedback", "submitted_at"]