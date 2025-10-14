from rest_framework import serializers
from .models import Question, MCQQuestion, ShortAnswerQuestion
from attempts.models import Attempt


class MCQQuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = MCQQuestion
        fields = ["id", "question", "options", "correct_options"]

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
    attempted = serializers.SerializerMethodField()
    numAttempts = serializers.IntegerField(source="num_attempts", read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "week",
            "topic",
            "question",
            "type",
            "rating",
            "numAttempts",
            "attempted",
            "source",
            "verify_status",
            "created_at",
            "updated_at",
            "creator",
            "mcq_detail",
            "short_detail",
        ]

    def get_attempted(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False
        return Attempt.objects.filter(attempter=user, question=obj).exists()

    def get_verified(self, obj):
        return obj.verify_status == Question.VerifyStatus.APPROVED


# Serializer for creating questions
class QuestionCreateSerializer(serializers.ModelSerializer):
    type = serializers.CharField()  # "MCQ" or "ShortAnswer"

    # Optional fields depending on type
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
            "id",
            "week",
            "topic",
            "question",
            "rating",
            "num_attempts",
            "source",
            "verify_status",
            "created_at",
            "updated_at",
            "creator",
            "type",
            "answer",
            "ai_answer",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "option_e",
            "correct_option",
        ]
        read_only_fields = ["creator", "created_at", "updated_at"]