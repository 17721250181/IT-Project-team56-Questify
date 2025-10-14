import uuid
from django.db import models
from django.contrib.auth.models import User


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
    num_attempts = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.question[:40]


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

# ai rubric