import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from questions.models import Question, ShortAnswerQuestion, MCQQuestion


@pytest.mark.django_db
def test_question_list_authenticated_with_questions(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="testuser1", password="pass123")
    client.force_authenticate(user=user)

    # create short answer question
    q1 = Question.objects.create(
        creator=user,
        question="What is Python?",
        type="SHORT",
        week="Week 1",
        topic="Intro to Programming",
    )
    ShortAnswerQuestion.objects.create(
        question=q1,
        answer="Programming language",
        ai_answer="Python is a programming language"
    )

    # create mcq question
    q2 = Question.objects.create(
        creator=user,
        question="What is Django?",
        type="MCQ",
        week="Week 2",
        topic="Web Frameworks",
    )
    MCQQuestion.objects.create(
        question=q2,
        option_a="Framework",
        option_b="Language",
        option_c="Database",
        option_d="Tool",
        option_e="Package",
        correct_options=["A"],
    )

    url = reverse("question-list")
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()

    assert len(data) == 12
    questions = [q["question"] for q in data]
    assert "What is Python?" in questions
    assert "What is Django?" in questions


@pytest.mark.django_db
def test_question_list_authenticated_empty(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="testuser2", password="pass123")
    client.force_authenticate(user=user)

    url = reverse("question-list")
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 10


@pytest.mark.django_db
def test_question_detail_short_answer(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="testuser3", password="pass123")
    client.force_authenticate(user=user)

    q = Question.objects.create(
        creator=user,
        question="What is the capital of Japan?",
        type="SHORT",
        week="Week 3",
        topic="Geography",
    )
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
    assert data["short_detail"]["answer"] == "Tokyo"
    assert data["short_detail"]["ai_answer"].startswith("Tokyo")
    assert data["mcq_detail"] is None
    assert data["creator"] == "testuser3"


@pytest.mark.django_db
def test_question_detail_mcq(django_user_model):
    client = APIClient()
    user = django_user_model.objects.create_user(username="testuser4", password="pass123")
    client.force_authenticate(user=user)

    q = Question.objects.create(
        creator=user,
        question="Which is the largest planet?",
        type="MCQ",
        week="Week 4",
        topic="Astronomy",
    )
    MCQQuestion.objects.create(
        question=q,
        option_a="Earth",
        option_b="Jupiter",
        option_c="Mars",
        option_d="Saturn",
        option_e="Neptune",
        correct_options=["B"],
    )

    url = reverse("question-detail", kwargs={"pk": q.id})
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert data["question"] == "Which is the largest planet?"
    assert data["mcq_detail"]["correct_options"] == ["B"]
    assert data["mcq_detail"]["options"]["B"] == "Jupiter"
    assert data["short_detail"] is None
    assert data["creator"] == "testuser4"