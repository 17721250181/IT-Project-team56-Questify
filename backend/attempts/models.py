import uuid
from django.db import models
from django.conf import settings
from questions.models import Question
from django.contrib.auth.models import User


class Attempt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attempter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attempts")
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="attempts"
    )
    answer = models.TextField()
    is_correct = models.BooleanField(null=True, blank=True)     #Only for MCQ
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.attempter} - {self.question} ({self.is_correct})"