from rest_framework import serializers
from .models import Attempt

class AttemptSerializer(serializers.ModelSerializer):
    attempter = serializers.CharField(source="attempter.username", read_only=True)
    question_text = serializers.CharField(source="question.question", read_only=True)
    topic = serializers.CharField(source="question.topic", read_only=True)
    week = serializers.CharField(source="question.week", read_only=True)
    type = serializers.CharField(source="question.type", read_only=True)

    class Meta:
        model = Attempt
        fields = ["id", "question", "question_text", "answer", "is_correct", "submitted_at", "attempter", "topic", "week", "type"]
        read_only_fields = ["is_correct", "submitted_at", "attempter", "question_text", "topic", "week", "type"]