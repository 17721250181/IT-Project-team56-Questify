import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from questions.models import Question, Comment, ShortAnswerQuestion
import uuid

@pytest.mark.django_db
class TestCommentAPI:
    @pytest.fixture
    def setup_data(self):
        # user
        user1 = User.objects.get(username="alice")
        user2 = User.objects.get(username="bob")

        # create question
        question = Question.objects.create(
            id=uuid.uuid4(),
            question="Explain the concept of inheritance in OOSD.",
            creator=user2,
            source="STUDENT",
            type="SHORT",
            week="Week 6",
            topic="OOSD Classes",
        )
        saq = ShortAnswerQuestion.objects.create(
            question=question,
            answer="Inheritance allows one class to acquire the properties and methods of another class.",
            ai_answer="It enables code reuse and establishes an 'is-a' relationship between classes.",
        )
        client = APIClient()
        client.force_authenticate(user=user1)
        client.force_authenticate(user=user2)
        return {"user1": user1, "user2": user2, "question": question, "client": client}

    def test_create_comment(self, setup_data):
        client = setup_data["client"]
        user = setup_data["user1"]
        question = setup_data["question"]
        client.login(username="alice", password="alice123")

        url = f"/api/questions/{question.id}/comments/"
        response = client.post(url, {"content": "This is a test comment."}, format="json")

        assert response.status_code == 201
        assert Comment.objects.count() == 1
        assert Comment.objects.first().content == "This is a test comment."

    def test_get_comment_list(self, setup_data):
        user = setup_data["user1"]
        question = setup_data["question"]
        Comment.objects.create(author=user, question=question, content="Root comment")
        Comment.objects.create(author=user, question=question, content="Another comment")

        client = setup_data["client"]
        url = f"/api/questions/{question.id}/comments/"
        response = client.get(url)
        assert response.status_code == 200
        assert len(response.data) == 2
        assert "content" in response.data[0]

    def test_reply_comment(self, setup_data):
        user = setup_data["user1"]
        question = setup_data["question"]
        parent = Comment.objects.create(author=user, question=question, content="Root comment")

        client = setup_data["client"]
        client.login(username="alice", password="alice123")

        url = f"/api/questions/comments/{parent.id}/reply/"
        response = client.post(url, {"content": "This is a reply"}, format="json")

        assert response.status_code == 201
        parent.refresh_from_db()
        assert parent.replies.count() == 1
        reply = parent.replies.first()
        assert reply.content == "This is a reply"
        assert reply.parent == parent

    def test_like_unlike_comment(self, setup_data):
        user1 = setup_data["user1"]
        user2 = setup_data["user2"]
        question = setup_data["question"]
        comment = Comment.objects.create(author=user1, question=question, content="Like test")

        client = setup_data["client"]
        client.login(username="bob", password="bob123")

        like_url = f"/api/questions/comments/{comment.id}/like/"
        unlike_url = f"/api/questions/comments/{comment.id}/unlike/"

        # like
        response = client.post(like_url)
        assert response.status_code == 200
        assert comment.likes.count() == 1

        # unlike
        response = client.post(unlike_url)
        assert response.status_code == 200
        comment.refresh_from_db()
        assert comment.likes.count() == 0