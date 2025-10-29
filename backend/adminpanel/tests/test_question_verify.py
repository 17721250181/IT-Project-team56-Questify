from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from questions.models import Question

@override_settings(ADMIN_EMAILS={"admin@questify.com"})
class AdminVerifyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@questify.com",
            password="StrongPass123!",
            is_staff=True,
            is_superuser=True,
        )
        self.regular_user = User.objects.create_user(
            username="student",
            email="student@example.com",
            password="StrongPass123!",
        )
        self.question = Question.objects.create(
            creator=self.regular_user,
            question="Explain encapsulation in OOP.",
            source=Question.Source.STUDENT,
            type=Question.Type.SHORT,
            verify_status=Question.VerifyStatus.PENDING,
        )

    def test_admin_can_approve_question(self):
        self.client.force_authenticate(user=self.admin_user)
        url = f"/api/admin/verify/{self.question.id}/"
        response = self.client.post(url, {"action": "APPROVE"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.question.refresh_from_db()
        self.assertEqual(self.question.verify_status, Question.VerifyStatus.APPROVED)

    def test_admin_can_reject_question(self):
        self.client.force_authenticate(user=self.admin_user)
        url = f"/api/admin/verify/{self.question.id}/"
        response = self.client.post(url, {"action": "REJECT"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.question.refresh_from_db()
        self.assertEqual(self.question.verify_status, Question.VerifyStatus.REJECTED)

    def test_invalid_action_returns_400(self):
        self.client.force_authenticate(user=self.admin_user)
        url = f"/api/admin/verify/{self.question.id}/"
        response = self.client.post(url, {"action": "INVALID"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid action", response.json()["error"])

    def test_question_not_found_returns_404(self):
        self.client.force_authenticate(user=self.admin_user)
        import uuid
        fake_id = uuid.uuid4()
        url = f"/api/admin/verify/{fake_id}/"
        response = self.client.post(url, {"action": "APPROVE"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Question not found", response.json()["error"])

    def test_non_admin_forbidden(self):
        self.client.force_authenticate(user=self.regular_user)
        url = f"/api/admin/verify/{self.question.id}/"
        response = self.client.post(url, {"action": "APPROVE"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)