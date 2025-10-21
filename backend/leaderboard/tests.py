from django.urls import reverse
from rest_framework.test import APIClient
from django.test import TestCase
from django.contrib.auth import get_user_model
from attempts.models import Attempt
from questions.models import Question

class LeaderboardRankTest(TestCase):
    def setUp(self):
        U = get_user_model()
        self.alice = U.objects.create_user(username="alice", password="x")
        self.bob = U.objects.create_user(username="bob", password="x")
        self.client = APIClient()
        self.client.force_authenticate(self.alice)

        q = Question.objects.create(question="q?", type="SHORT", week="W1", topic="Math")
        Attempt.objects.create(attempter=self.alice, question=q, is_correct=True)
        Attempt.objects.create(attempter=self.bob,   question=q, is_correct=True)
        Attempt.objects.create(attempter=self.bob,   question=q, is_correct=True)

    def test_order(self):
        res = self.client.get(reverse("leaderboard-list"))
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data["results"]), 2)
        # bob이 정답 2회로 더 높은 점수
        self.assertEqual(res.data["results"][0]["username"], "bob")
