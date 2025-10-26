from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile

@receiver(post_save, sender=User)
def create_profile_for_user(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(
            user=instance,
            student_id=f"TEMP-{instance.pk}",
            display_name=instance.first_name or instance.username,
        )
