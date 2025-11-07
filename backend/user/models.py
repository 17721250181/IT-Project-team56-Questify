from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.utils import timezone

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    student_id = models.CharField(max_length=20, unique=True)
    display_name = models.CharField(max_length=150, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    profile_picture = models.ImageField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.student_id}"


class PasswordResetCode(models.Model):
    """
    Model to store password reset verification codes
    """
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Password Reset Code"
        verbose_name_plural = "Password Reset Codes"
        indexes = [
            models.Index(fields=['email', 'code']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"{self.email} - {self.code} ({'used' if self.is_used else 'active'})"
    
    def is_expired(self):
        """Check if the code has expired"""
        return timezone.now() > self.expires_at
