import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from questions.models import Question, MCQQuestion, ShortAnswerQuestion
from attempts.models import Attempt


@pytest.mark.django_db
def test_create_mcq_attempt(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="student1", password="pass123")
    client.force_authenticate(user=user)

    # create MCQ question
    q = Question.objects.create(creator=user, question="Which number is prime?")
    MCQQuestion.objects.create(
        question=q,
        option_a="4",
        option_b="7",
        option_c="9",
        option_d="12",
        option_e="15",
        correct_option="B"
    )

    payload = {
        "question": str(q.id),
        "answer": "B"
    }

    url = reverse("attempt-create")
    response = client.post(url, payload, format="json")

    assert response.status_code == 201
    data = response.json()

    # check response data
    assert data["answer"] == "B"
    assert data["is_correct"] is True

    # check database
    assert Attempt.objects.count() == 1
    attempt = Attempt.objects.first()
    assert attempt.attempter.username == "student1"
    assert attempt.is_correct is True


@pytest.mark.django_db
def test_create_short_answer_attempt(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="student2", password="pass123")
    client.force_authenticate(user=user)

    # create Short Answer Question
    q = Question.objects.create(creator=user, question="What is the capital of France?")
    ShortAnswerQuestion.objects.create(
        question=q,
        answer="Paris",
        ai_answer="Paris is the capital city of France."
    )

    payload = {
        "question": str(q.id),
        "answer": "Paris"
    }

    url = reverse("attempt-create")
    response = client.post(url, payload, format="json")

    assert response.status_code == 201
    data = response.json()

    # check response data
    assert data["answer"] == "Paris"
    assert data["is_correct"] is None

    # check database
    assert Attempt.objects.count() == 1
    attempt = Attempt.objects.first()
    assert attempt.attempter.username == "student2"
    assert attempt.is_correct is None