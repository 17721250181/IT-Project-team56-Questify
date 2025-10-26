import pytest
from rest_framework.test import APIClient
from questions.models import Question, Comment, ShortAnswerQuestion
from user.models import UserProfile
import uuid
from django.urls import reverse

@pytest.mark.django_db
def test_create_invalid_type(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="wrongtype", password="123")
    client.force_authenticate(user=user)
    url = reverse("question-create")
    payload = {"type": "TEXT", "question": "???", "week": "Week1", "topic": "Basics"}
    res = client.post(url, payload, format="json")
    assert res.status_code == 400
    assert "Invalid type" in res.json()["error"]


@pytest.mark.django_db
def test_create_mcq_missing_options(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="mcqfail", password="123")
    client.force_authenticate(user=user)
    url = reverse("question-create")
    payload = {
        "type": "MCQ",
        "question": "Incomplete MCQ?",
        "option_a": "A",  # deliberately missing others
        "week": "Week1",
        "topic": "Basics",
    }
    res = client.post(url, payload, format="json")
    assert res.status_code == 400
    assert "must include 5 options" in res.json()["error"]


@pytest.mark.django_db
def test_ai_explanation_exception(monkeypatch, django_user_model):
    """Mock requests.post to raise error, covering except branch."""
    import requests
    client = APIClient()
    user = django_user_model.objects.create_user(username="aiexc", password="123")
    client.force_authenticate(user=user)

    def fake_post(*args, **kwargs):
        raise requests.RequestException("fake error")
    monkeypatch.setattr(requests, "post", fake_post)

    payload = {
        "type": "SHORT",
        "question": "Why?",
        "answer": "Because.",
        "week": "W1",
        "topic": "OOP"
    }
    url = reverse("question-create")
    res = client.post(url, payload, format="json")
    assert res.status_code == 201
    assert "AI explanation failed" in res.json()["ai_answer"]

@pytest.mark.django_db
def test_question_list_filters_and_ordering(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="filteruser", password="pass")
    client.force_authenticate(user=user)

    Question.objects.create(creator=user, question="Inheritance", week="Week 4", topic="OOP", type="SHORT")
    Question.objects.create(creator=user, question="Polymorphism", week="Week 5", topic="OOP", type="MCQ")

    base_url = reverse("question-list")

    # search
    res = client.get(base_url + "?search=Inherit")
    assert res.status_code == 200
    assert any("Inheritance" in q["question"] for q in res.json())

    # week filter
    res = client.get(base_url + "?week=Week4")
    assert res.status_code == 200

    # topic filter
    res = client.get(base_url + "?topic=OOP")
    assert res.status_code == 200

    # type filter
    res = client.get(base_url + "?type=short")
    assert res.status_code == 200

    # invalid min_rating (ValueError branch)
    res = client.get(base_url + "?min_rating=abc")
    assert res.status_code == 200

    # ordering param
    res = client.get(base_url + "?ordering=rating_asc")
    assert res.status_code == 200

@pytest.mark.django_db
def test_reply_no_content_returns_400(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="replytest", password="123")
    client.force_authenticate(user=user)
    q = Question.objects.create(creator=user, question="Q", week="W1", topic="T", type="SHORT")
    c = Comment.objects.create(author=user, question=q, content="Parent")
    url = f"/api/questions/comments/{c.id}/reply/"
    res = client.post(url, {"content": ""})
    assert res.status_code == 400
    assert "Content is required" in res.json()["error"]


@pytest.mark.django_db
def test_like_unlike_comment_not_found(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="likefail", password="123")
    client.force_authenticate(user=user)
    url = "/api/questions/comments/99999/like/"
    res = client.post(url)
    assert res.status_code == 404