from rest_framework import serializers
from .models import Question, MCQQuestion, ShortAnswerQuestion


class MCQQuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = MCQQuestion
        fields = ["id", "question", "explanation", "options", "correct_option"]

    def get_options(self, obj):
        return {
            "A": obj.option_a,
            "B": obj.option_b,
            "C": obj.option_c,
            "D": obj.option_d,
            "E": obj.option_e,
        }


class ShortAnswerQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShortAnswerQuestion
        fields = ["id", "question", "answer", "ai_answer"]


class QuestionSerializer(serializers.ModelSerializer):
    mcq_detail = MCQQuestionSerializer(read_only=True)
    short_detail = ShortAnswerQuestionSerializer(read_only=True)
    creator = serializers.CharField(source="creator.username", read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "question",
            "source",
            "verify_status",
            "created_at",
            "updated_at",
            "creator",
            "mcq_detail",
            "short_detail",
        ]


# Serializer for create
class QuestionCreateSerializer(serializers.ModelSerializer):
    type = serializers.CharField()
    answer = serializers.CharField(required=False, allow_blank=True)
    ai_answer = serializers.CharField(required=False, allow_blank=True)
    option_a = serializers.CharField(required=False, allow_blank=True)
    option_b = serializers.CharField(required=False, allow_blank=True)
    option_c = serializers.CharField(required=False, allow_blank=True)
    option_d = serializers.CharField(required=False, allow_blank=True)
    option_e = serializers.CharField(required=False, allow_blank=True)
    correct_option = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Question
        fields = [
            "id", "question", "source", "verify_status", "created_at", "updated_at", "creator", 
            "type", "answer", "ai_answer",
            "option_a", "option_b", "option_c", "option_d", "option_e", "correct_option"
        ]
        read_only_fields = ["creator"]