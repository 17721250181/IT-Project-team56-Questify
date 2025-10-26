import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta
from django.db.models.signals import post_save
from user.signals import create_profile_for_user
from attempts.models import Attempt
from questions.models import Question
from django.contrib.auth import get_user_model

post_save.disconnect(create_profile_for_user)

pytestmark = pytest.mark.django_db
User = get_user_model()


def test_leaderboard_filter_by_week_and_topic():
    """Test leaderboard filtering by week and topic."""
    client = APIClient()
    user = User.objects.create_user(username="user1", password="x")
    client.force_authenticate(user)

    q1 = Question.objects.create(question="Q1", type="SHORT", week="Week1", topic="Math", creator=user)
    q2 = Question.objects.create(question="Q2", type="SHORT", week="Week2", topic="Physics", creator=user)
    Attempt.objects.create(attempter=user, question=q1, is_correct=True)
    Attempt.objects.create(attempter=user, question=q2, is_correct=True)

    url = reverse("leaderboard-list") + "?week=Week1"
    res = client.get(url)
    assert res.status_code == 200
    assert res.json()["results"][0]["attempts"] == 1

    url = reverse("leaderboard-list") + "?topic=Math"
    res = client.get(url)
    assert res.status_code == 200
    assert res.json()["results"][0]["attempts"] == 1


def test_leaderboard_filter_by_date_range():
    """Test filtering by date range."""
    client = APIClient()
    user = User.objects.create_user(username="tester", password="x")
    client.force_authenticate(user)
    q = Question.objects.create(question="Q?", type="SHORT", week="Week1", topic="Math", creator=user)

    old_attempt = Attempt.objects.create(attempter=user, question=q, is_correct=True)
    recent_attempt = Attempt.objects.create(attempter=user, question=q, is_correct=True)

    # 强制修改提交时间（auto_now_add 会忽略传入值）
    old_attempt.submitted_at = timezone.now() - timedelta(days=400)
    recent_attempt.submitted_at = timezone.now() - timedelta(days=10)
    old_attempt.save(update_fields=["submitted_at"])
    recent_attempt.save(update_fields=["submitted_at"])

    # filter: only last 30 days
    from_date = (timezone.now() - timedelta(days=30)).date().isoformat()
    url = reverse("leaderboard-list") + f"?from={from_date}"
    res = client.get(url)
    assert res.status_code == 200
    data = res.json()
    assert data["results"][0]["attempts"] == 1  # old attempt excluded


def test_my_leaderboard_view_with_data():
    """Test /api/leaderboard/me when user has activity."""
    client = APIClient()
    user = User.objects.create_user(username="meuser", password="x")
    client.force_authenticate(user)
    q = Question.objects.create(question="Q?", type="SHORT", week="W1", topic="Math", creator=user)
    Attempt.objects.create(attempter=user, question=q, is_correct=True)

    url = reverse("leaderboard-me")
    res = client.get(url)
    assert res.status_code == 200
    data = res.json()
    assert data["user_id"] == user.id
    assert data["attempts"] == 1
    assert data["points"] > 0
    assert "rank" in data
    assert "total_users" in data


def test_my_leaderboard_view_without_data():
    """Test /api/leaderboard/me for user with no activity."""
    client = APIClient()
    user = User.objects.create_user(username="newuser", password="x")
    client.force_authenticate(user)

    url = reverse("leaderboard-me")
    res = client.get(url)
    assert res.status_code == 200
    data = res.json()
    assert data["user_id"] == user.id
    assert data["attempts"] == 0
    assert data["rank"] == data["total_users"] + 1