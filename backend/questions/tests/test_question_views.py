import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from questions.models import Question, ShortAnswerQuestion, MCQQuestion


@pytest.mark.django_db
def test_question_list_authenticated_with_questions(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="testuser1", password="pass123")
    client.force_authenticate(user=user)

    # create test questions
    q1 = Question.objects.create(creator=user, question="What is Python?")
    q2 = Question.objects.create(creator=user, question="What is Django?")

    ShortAnswerQuestion.objects.create(
        question=q1,
        answer="Programming language",
        ai_answer="Python is a programming language"
    )
    MCQQuestion.objects.create(
        question=q2,
        option_a="Framework", option_b="Language", option_c="Database", option_d="Tool",
        correct_option="A"
    )

    url = reverse("question-list")
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["question"] in ["What is Python?", "What is Django?"]
    assert data[0]["creator"] == "testuser1"


@pytest.mark.django_db
def test_question_list_authenticated_empty(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="testuser2", password="pass123")
    client.force_authenticate(user=user)

    url = reverse("question-list")
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


@pytest.mark.django_db
def test_question_detail_short_answer(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="testuser3", password="pass123")
    client.force_authenticate(user=user)

    # create short answer question
    q = Question.objects.create(creator=user, question="What is the capital of Japan?")
    ShortAnswerQuestion.objects.create(
        question=q,
        answer="Tokyo",
        ai_answer="Tokyo is the capital and largest city of Japan"
    )

    url = reverse("question-detail", kwargs={"pk": q.id})
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert data["question"] == "What is the capital of Japan?"
    assert data["short_detail"] is not None
    assert data["mcq_detail"] is None
    assert data["short_detail"]["answer"] == "Tokyo"
    assert data["short_detail"]["ai_answer"] == "Tokyo is the capital and largest city of Japan"
    assert data["creator"] == "testuser3"


@pytest.mark.django_db
def test_question_detail_mcq(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="testuser4", password="pass123")
    client.force_authenticate(user=user)

    # create MCQ question
    q = Question.objects.create(creator=user, question="Which is the largest planet?")
    MCQQuestion.objects.create(
        question=q,
        option_a="Earth", option_b="Jupiter", option_c="Mars", option_d="Saturn",
        correct_option="B"
    )

    url = reverse("question-detail", kwargs={"pk": q.id})
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert data["question"] == "Which is the largest planet?"
    assert data["mcq_detail"] is not None
    assert data["short_detail"] is None
    assert data["mcq_detail"]["correct_option"] == "B"
    assert "options" in data["mcq_detail"]
    assert data["mcq_detail"]["options"]["A"] == "Earth"
    assert data["mcq_detail"]["options"]["B"] == "Jupiter"
    assert data["creator"] == "testuser4"