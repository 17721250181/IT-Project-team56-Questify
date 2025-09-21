import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from questions.models import Question, ShortAnswerQuestion, MCQQuestion


@pytest.mark.django_db
def test_create_short_answer_question_real_openai(django_user_model, settings):
    client = APIClient()
    user = django_user_model.objects.create_user(username="realuser", password="realpass")
    client.force_authenticate(user=user)

    payload = {
        "type": "SHORT",
        "question": "What is the capital of France?",
        "answer": "Paris"
    }

    url = reverse("question-create")
    response = client.post(url, payload, format="json")

    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "SHORT"
    assert data["answer"] == "Paris"

    print("AI Explanation:", data["ai_answer"])
    assert "Paris" in data["ai_answer"] or len(data["ai_answer"]) > 0

    assert Question.objects.count() == 1
    assert ShortAnswerQuestion.objects.count() == 1


@pytest.mark.django_db
def test_create_mcq_question_real(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="realuser2", password="realpass")
    client.force_authenticate(user=user)

    payload = {
        "type": "MCQ",
        "question": "Which of the following is a prime number?",
        "option_a": "4",
        "option_b": "7",
        "option_c": "9",
        "option_d": "12",
        "option_e": "15",
        "correct_option": "B"
    }

    url = reverse("question-create")
    response = client.post(url, payload, format="json")

    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "MCQ"
    assert data["correct_option"] == "B"
    assert "options" in data

    assert Question.objects.count() == 1
    assert MCQQuestion.objects.count() == 1