import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from questions.models import Question, ShortAnswerQuestion, MCQQuestion


@pytest.mark.django_db
def test_create_short_answer_question(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="realuser", password="realpass")
    client.force_authenticate(user=user)

    payload ={
        "type": "SHORT",
        "question": "Why do we use inheritance in OOP?",
        "answer": "To promote code reuse and model hierarchical relationships between classes.",
        "week": "Week 4",
        "topic": "Inheritance"
        }

    url = reverse("question-create")
    response = client.post(url, payload, format="json")

    assert response.status_code == 201
    data = response.json()

    assert data["type"] == "SHORT"
    assert data["answer"] == "To promote code reuse and model hierarchical relationships between classes."
    assert data["creator"] == "realuser"

    assert "ai_answer" in data
    assert len(data["ai_answer"]) > 0

    #assert Question.objects.count() == 1
    assert ShortAnswerQuestion.objects.count() == 6


@pytest.mark.django_db
def test_create_mcq_question(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="realuser2", password="realpass")
    client.force_authenticate(user=user)

    payload = {
        "type": "MCQ",
        "question": "Which keyword in Java is used to create a subclass?",
        "option_a": "super",
        "option_b": "this",
        "option_c": "extends",
        "option_d": "implements",
        "option_e": "class",
        "correct_options": ["C"],
        "week": "Week 4",
        "topic": "Inheritance"
    }

    url = reverse("question-create")
    response = client.post(url, payload, format="json")

    assert response.status_code == 201
    data = response.json()

    assert data["type"] == "MCQ"
    assert "options" in data
    assert data["options"]["B"] == "this"
    assert data["correct_options"] == ["C"]
    assert data["creator"] == "realuser2"

    # assert Question.objects.count() == 1
    assert MCQQuestion.objects.count() == 6