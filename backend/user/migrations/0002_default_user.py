from django.db import migrations


def create_default_users(apps, schema_editor):
    User = apps.get_model("auth", "User")
    UserProfile = apps.get_model("user", "UserProfile")

    default_users = [
        {
            "username": "alice",
            "password": "alice123",
            "email": "alice@example.com",
            "student_id": "100001",
        },
        {
            "username": "bob",
            "password": "bob123",
            "email": "bob@example.com",
            "student_id": "100002",
        },
    ]

    for u in default_users:
        if not User.objects.filter(username=u["username"]).exists():
            user = User.objects.create_user(
                username=u["username"],
                password=u["password"],
                email=u["email"],
            )
            UserProfile.objects.create(user=user, student_id=u["student_id"])


def delete_default_users(apps, schema_editor):
    User = apps.get_model("auth", "User")
    User.objects.filter(username__in=["admin", "alice", "bob"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("user", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_default_users, delete_default_users),
    ]