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


@pytest.mark.django_db
def test_user_attempt_list_authenticated(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="student3", password="pass123")
    client.force_authenticate(user=user)

    q1 = Question.objects.create(creator=user, question="Question 1")
    q2 = Question.objects.create(creator=user, question="Question 2")

    MCQQuestion.objects.create(
        question=q1,
        option_a="A", option_b="B", option_c="C", option_d="D",
        correct_option="B"
    )
    ShortAnswerQuestion.objects.create(
        question=q2,
        answer="Answer2"
    )

    Attempt.objects.create(attempter=user, question=q1, answer="B", is_correct=True)
    Attempt.objects.create(attempter=user, question=q2, answer="Answer2", is_correct=None)

    url = reverse("user-attempts")
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["attempter"] == "student3"
    assert data[0]["question_text"] in ["Question 1", "Question 2"]


@pytest.mark.django_db
def test_user_attempt_list_empty(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="student4", password="pass123")
    client.force_authenticate(user=user)

    url = reverse("user-attempts")
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


@pytest.mark.django_db
def test_question_attempt_list_with_attempts(django_user_model):
    client = APIClient()
    user1 = django_user_model.objects.create_user(username="student5", password="pass123")
    user2 = django_user_model.objects.create_user(username="student6", password="pass123")
    client.force_authenticate(user=user1)

    q = Question.objects.create(creator=user1, question="Test Question")
    MCQQuestion.objects.create(
        question=q,
        option_a="A", option_b="B", option_c="C", option_d="D",
        correct_option="A"
    )

    Attempt.objects.create(attempter=user1, question=q, answer="A", is_correct=True)
    Attempt.objects.create(attempter=user2, question=q, answer="B", is_correct=False)

    url = reverse("question-attempts", kwargs={"question_id": q.id})
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["question_text"] == "Test Question"
    usernames = [attempt["attempter"] for attempt in data]
    assert "student5" in usernames
    assert "student6" in usernames


@pytest.mark.django_db
def test_question_attempt_list_no_attempts(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="student7", password="pass123")
    client.force_authenticate(user=user)

    q = Question.objects.create(creator=user, question="Unattempted Question")
    ShortAnswerQuestion.objects.create(question=q, answer="Test Answer")

    url = reverse("question-attempts", kwargs={"question_id": q.id})
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0