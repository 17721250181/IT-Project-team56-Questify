from rest_framework import serializers
from .models import Attempt

class AttemptSerializer(serializers.ModelSerializer):
    attempter = serializers.CharField(source="attempter.username", read_only=True)
    question_text = serializers.CharField(source="question.question", read_only=True)

    class Meta:
        model = Attempt
        fields = ["id", "question", "question_text", "answer", "is_correct", "submitted_at", "attempter"]
        read_only_fields = ["is_correct", "submitted_at", "attempter", "question_text"]