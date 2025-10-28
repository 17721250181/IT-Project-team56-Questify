from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from attempts.models import Attempt
from questions.models import Question, ShortAnswerQuestion


@override_settings(ADMIN_EMAILS={"admin@questify.com"})
class AdminViewsTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin_user, _ = User.objects.get_or_create(
            username="admin@questify.com",
            defaults={
                "email": "admin@questify.com",
                "first_name": "Admin",
            },
        )
        self.admin_user.email = "admin@questify.com"
        self.admin_user.first_name = "Admin"
        self.admin_user.is_staff = True
        self.admin_user.is_superuser = True
        self.admin_user.set_password("StrongPass123!")
        self.admin_user.save()

        self.initial_user_count = User.objects.count()
        self.initial_question_count = Question.objects.count()
        self.initial_short_question_count = Question.objects.filter(type=Question.Type.SHORT).count()
        self.initial_short_answer_count = ShortAnswerQuestion.objects.count()

        self.regular_user = User.objects.create_user(
            username="student@example.com",
            email="student@example.com",
            password="StrongPass123!",
            first_name="Student",
        )

        self.question = Question.objects.create(
            creator=self.regular_user,
            question="Explain polymorphism in object-oriented programming.",
            type=Question.Type.SHORT,
            source=Question.Source.STUDENT,
            verify_status=Question.VerifyStatus.PENDING,
        )
        ShortAnswerQuestion.objects.create(
            question=self.question,
            answer="Ability of objects to take on many forms.",
            ai_answer="Polymorphism lets objects implement shared interfaces with tailored behaviour.",
        )
        Attempt.objects.create(
            attempter=self.regular_user,
            question=self.question,
            answer="It allows overriding methods.",
            is_correct=True,
        )

    def test_non_admin_email_cannot_access_overview(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get("/api/admin/overview/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_overview_returns_basic_metrics(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get("/api/admin/overview/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn("users", data)
        self.assertGreaterEqual(data["users"]["total"], self.initial_user_count + 1)
        self.assertIn("questions", data)
        self.assertGreaterEqual(data["questions"]["short"], self.initial_short_question_count + 1)
        self.assertIn("ai_usage", data)
        self.assertGreaterEqual(data["ai_usage"]["ai_answered"], self.initial_short_answer_count + 1)

    def test_user_activity_endpoint_returns_results(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get("/api/admin/user-activity/?limit=5")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()

        self.assertGreaterEqual(payload["count"], 1)
        users = payload["results"]
        self.assertTrue(any(item["email"] == "student@example.com" for item in users))

    def test_ai_usage_endpoint_reports_statistics(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get("/api/admin/ai-usage/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        stats = response.json()

        self.assertGreaterEqual(stats["totals"]["short_answers"], self.initial_short_answer_count + 1)
        self.assertGreaterEqual(stats["totals"]["ai_populated"], self.initial_short_answer_count + 1)
        self.assertIsNotNone(stats["performance"]["average_ai_answer_length"])
