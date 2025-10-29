from rest_framework import serializers
from .models import Question, MCQQuestion, ShortAnswerQuestion, Comment, QuestionRating, SavedQuestion
from attempts.models import Attempt
from user.models import UserProfile


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
    creator = serializers.SerializerMethodField()
    attempted = serializers.SerializerMethodField()
    numAttempts = serializers.IntegerField(source="num_attempts", read_only=True)
    ratingCount = serializers.IntegerField(source="rating_count", read_only=True)
    userRating = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            "id",
            "week",
            "topic",
            "question",
            "type",
            "rating",
            "ratingCount",
            "userRating",
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

    def get_creator(self, obj):
        """Get creator's display name from profile, fallback to email"""
        profile = getattr(obj.creator, 'profile', None)
        if profile and profile.display_name:
            return profile.display_name
        # Fallback to email (which is the login username)
        return obj.creator.email or obj.creator.username or "User"

    def get_attempted(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False
        return Attempt.objects.filter(attempter=user, question=obj).exists()

    def get_verified(self, obj):
        return obj.verify_status == Question.VerifyStatus.APPROVED

    def get_userRating(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return None
        prefetch_result = getattr(obj, "user_rating_for_requester", None)
        if prefetch_result:
            return prefetch_result[0].score
        rating = obj.ratings.filter(user=user).first()
        return rating.score if rating else None


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


class AuthorSerializer(serializers.Serializer):
    id = serializers.IntegerField(source='author.id', read_only=True)
    name = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()

    def _get_display_name(self, author):
        """Get author's display name from profile, fallback to email"""
        profile = getattr(author, 'profile', None)
        if profile and profile.display_name:
            return profile.display_name
        # Fallback to email (which is the login username)
        return author.email or author.username or "User"

    def get_name(self, obj):
        return self._get_display_name(obj.author)

    def get_display_name(self, obj):
        return self._get_display_name(obj.author)

    def get_profile_image(self, obj):
        profile = getattr(obj.author, 'profile', None)
        if not profile or not profile.profile_picture:
            return None
        request = self.context.get('request')
        url = profile.profile_picture.url
        return request.build_absolute_uri(url) if request else url

class ReplySerializer(serializers.ModelSerializer):
    author = AuthorSerializer(source='*', read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at', 'like_count', 'is_liked_by_user']

    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        user = request.user
        return user.is_authenticated and obj.likes.filter(id=user.id).exists()

class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(source='*', read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at', 'like_count', 'is_liked_by_user', 'replies']

    def get_replies(self, obj):
        serializer = ReplySerializer(obj.replies.all(), many=True, context=self.context)
        return serializer.data

    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        user = request.user
        return user.is_authenticated and obj.likes.filter(id=user.id).exists()



class SavedQuestionSerializer(serializers.ModelSerializer):
    question_detail = serializers.SerializerMethodField()

    class Meta:
        model = SavedQuestion
        fields = ["id", "question", "saved_at", "question_detail"]

    def get_question_detail(self, obj):
        return {
            "id": obj.question.id,
            "question": obj.question.question,
            "verify_status": obj.question.verify_status,
            "topic": obj.question.topic,
            "week": obj.question.week,
        }