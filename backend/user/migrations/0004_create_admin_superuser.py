from django.contrib.auth.hashers import make_password
from django.db import migrations


ADMIN_EMAIL = "admin@questify.com"
ADMIN_PASSWORD = "12345678q"


def create_admin_superuser(apps, schema_editor):
    User = apps.get_model("auth", "User")

    email = ADMIN_EMAIL.lower()
    username = email
    password_hash = make_password(ADMIN_PASSWORD)

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "username": username,
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
            "first_name": "Questify",
            "last_name": "Admin",
            "password": password_hash,
        },
    )

    if not created:
        needs_update = False

        if user.username != username:
            user.username = username
            needs_update = True

        desired_flags = {
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
        }
        for field, desired_value in desired_flags.items():
            if getattr(user, field) != desired_value:
                setattr(user, field, desired_value)
                needs_update = True

        if user.first_name != "Questify":
            user.first_name = "Questify"
            needs_update = True

        if user.last_name != "Admin":
            user.last_name = "Admin"
            needs_update = True

        user.password = password_hash
        needs_update = True

        if needs_update:
            user.save()

def remove_admin_superuser(apps, schema_editor):
    User = apps.get_model("auth", "User")
    User.objects.filter(email=ADMIN_EMAIL.lower()).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("user", "0003_userprofile_display_name"),
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.RunPython(create_admin_superuser, remove_admin_superuser),
    ]
