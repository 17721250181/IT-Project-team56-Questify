from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    student_id = models.CharField(max_length=20, unique=True)
    updated_at = models.DateTimeField(auto_now=True)
    profile_picture = models.ImageField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.student_id}"