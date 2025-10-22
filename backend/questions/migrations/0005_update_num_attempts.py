from django.db import migrations


def update_num_attempts(apps, schema_editor):
    """Update num_attempts for existing questions based on actual attempts"""
    Question = apps.get_model('questions', 'Question')
    Attempt = apps.get_model('attempts', 'Attempt')
    
    for question in Question.objects.all():
        question.num_attempts = Attempt.objects.filter(question=question).count()
        question.save(update_fields=['num_attempts'])


class Migration(migrations.Migration):

    dependencies = [
        ('questions', '0004_ensure_comment_table'),
        ('attempts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(update_num_attempts, migrations.RunPython.noop),
    ]
