import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from questions.models import Question, SavedQuestion


@pytest.mark.django_db
class TestSavedQuestionsAPI:
    @pytest.fixture
    def client(self):
        return APIClient()

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            username="student",
            email="student@example.com",
            password="StrongPass123!"
        )

    @pytest.fixture
    def another_user(self):
        return User.objects.create_user(
            username="another",
            email="another@example.com",
            password="StrongPass123!"
        )

    @pytest.fixture
    def question(self, user):
        return Question.objects.create(
            creator=user,
            question="Explain polymorphism in Java.",
            source=Question.Source.STUDENT,
            type=Question.Type.SHORT,
            verify_status=Question.VerifyStatus.APPROVED,
        )

    def test_user_can_save_question(self, client, user, question):
        client.login(username="student", password="StrongPass123!")
        url = f"/api/questions/save/{question.id}/"
        response = client.post(url)
        assert response.status_code == 201
        assert response.data["message"] == "Question saved."
        assert SavedQuestion.objects.filter(user=user, question=question).exists()


    def test_user_can_unsave_question(self, client, user, question):
        client.login(username="student", password="StrongPass123!")
        url = f"/api/questions/save/{question.id}/"
        client.post(url)
        response = client.post(url)
        assert response.status_code == 200
        assert response.data["message"] == "Question unsaved."
        assert not SavedQuestion.objects.filter(user=user, question=question).exists()

    def test_cannot_save_nonexistent_question(self, client, user):
        import uuid
        client.login(username="student", password="StrongPass123!")
        url = f"/api/questions/save/{uuid.uuid4()}/"
        response = client.post(url)
        assert response.status_code == 404
        assert "Question not found" in response.data["error"]

    def test_anonymous_user_cannot_save(self, client, question):
        url = f"/api/questions/save/{question.id}/"
        response = client.post(url)
        assert response.status_code == 401 or response.status_code == 403
        assert SavedQuestion.objects.count() == 0

    def test_user_can_view_saved_list(self, client, user, another_user, question):
        SavedQuestion.objects.create(user=user, question=question)
        SavedQuestion.objects.create(user=another_user, question=question)

        client.login(username="student", password="StrongPass123!")
        url = "/api/questions/saved-list/"
        response = client.get(url)
        assert response.status_code == 200
        data = response.data
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["question_detail"]["question"] == "Explain polymorphism in Java."