import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models import Avg, Count


class Question(models.Model):
    class Source(models.TextChoices):
        STUDENT = "STUDENT", "Student"
        TEACHING_TEAM = "TEACHING_TEAM", "Teaching Team"

    class VerifyStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    class Type(models.TextChoices):
        MCQ = "MCQ", "mcq"
        SHORT = "SHORT", "short"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="questions")
    question = models.TextField()
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.STUDENT)
    verify_status = models.CharField(
        max_length=20,
        choices=VerifyStatus.choices,
        default=VerifyStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    week = models.CharField(max_length=50, blank=True, null=True)
    topic = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=50, choices=Type.choices, null=True)
    rating = models.FloatField(default=0.0)
    rating_count = models.PositiveIntegerField(default=0)
    num_attempts = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.question[:40]

    def recalculate_rating(self):
        aggregate = self.ratings.aggregate(avg=Avg("score"), count=Count("id"))
        average = aggregate.get("avg") or 0.0
        count = aggregate.get("count") or 0
        self.rating = round(float(average), 2) if average else 0.0
        self.rating_count = count
        self.save(update_fields=["rating", "rating_count", "updated_at"])


class MCQQuestion(models.Model):
    question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name="mcq_detail")
    # explanation = models.TextField(blank=True, null=True)
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    option_e = models.CharField(max_length=255)
    correct_options = models.JSONField(default=list)


class ShortAnswerQuestion(models.Model):
    question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name="short_detail")
    answer = models.TextField()
    ai_answer = models.TextField()

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.author.username}: {self.content[:20]}'

    @property
    def like_count(self):
        return self.likes.count()


class QuestionRating(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="ratings")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="question_ratings")
    score = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("question", "user")
        constraints = [
            models.CheckConstraint(
                    condition=models.Q(score__gte=1) & models.Q(score__lte=5),
                    name="rating_score_range",
                )
        ]

    def __str__(self):
        return f"{self.user.username} → {self.question_id}: {self.score}"


class SavedQuestion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_questions")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="saved_by_users")
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "question")

    def __str__(self):
        return f"{self.user.username} saved {self.question.id}"