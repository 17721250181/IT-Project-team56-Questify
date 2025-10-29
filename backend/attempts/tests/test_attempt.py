import uuid
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from questions.models import Question, MCQQuestion, ShortAnswerQuestion
from attempts.models import Attempt


class AttemptTests(APITestCase):
    def setUp(self):
        # Create user & login
        self.user = User.objects.create_user(username="test@example.com", email="test@example.com", password="StrongPass123!")
        self.client.login(username="test@example.com", password="StrongPass123!")

        # Create base questions
        self.mcq_question = Question.objects.create(
            creator=self.user,
            question="What is 2 + 2?",
            type="MCQ",
            week="Week1",
            topic="Math",
            source="STUDENT"
        )
        self.mcq_detail = MCQQuestion.objects.create(
            question=self.mcq_question,
            option_a="1",
            option_b="2",
            option_c="3",
            option_d="4",
            option_e="5",
            correct_options=["D"]
        )

        self.short_question = Question.objects.create(
            creator=self.user,
            question="Explain polymorphism in OOP.",
            type="SHORT",
            week="Week2",
            topic="OOP",
            source="STUDENT"
        )
        self.short_detail = ShortAnswerQuestion.objects.create(
            question=self.short_question,
            answer="It allows one interface to be used for different types.",
            ai_answer="Polymorphism enables a single interface to represent different underlying data types."
        )

    # --- Create Attempt Tests ---
    def test_create_mcq_attempt_correct(self):
        """Test creating a correct MCQ attempt"""
        url = reverse("attempt-create")
        data = {"question": str(self.mcq_question.id), "answer": "D"}
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["is_correct"])
        self.assertEqual(response.data["answer"], "D")

        # Check DB updated
        self.assertEqual(Attempt.objects.count(), 1)
        attempt = Attempt.objects.first()
        self.assertTrue(attempt.is_correct)
        self.assertEqual(self.mcq_question.attempts.count(), 1)

    def test_create_mcq_attempt_incorrect(self):
        """Test creating an incorrect MCQ attempt"""
        url = reverse("attempt-create")
        data = {"question": str(self.mcq_question.id), "answer": "A"}
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(response.data["is_correct"])

    def test_create_short_answer_attempt(self):
        """Short answer attempt should not have correctness"""
        url = reverse("attempt-create")
        data = {"question": str(self.short_question.id), "answer": "Some explanation"}
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data["is_correct"])

    def test_create_attempt_invalid_question(self):
        """Posting attempt for non-existent question"""
        url = reverse("attempt-create")
        data = {"question": str(uuid.uuid4()), "answer": "D"}
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("error", response.data)

    def test_create_attempt_unauthenticated(self):
        """Unauthorized attempt creation"""
        self.client.logout()
        url = reverse("attempt-create")
        data = {"question": str(self.mcq_question.id), "answer": "D"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # --- List Tests ---
    def test_list_user_attempts(self):
        """List all attempts by current user"""
        Attempt.objects.create(attempter=self.user, question=self.mcq_question, answer="D", is_correct=True)
        url = reverse("user-attempts")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["question_text"], "What is 2 + 2?")

    def test_list_user_attempts_returns_latest_per_question(self):
        """Only latest attempt per question is returned for the user"""
        old_attempt = Attempt.objects.create(
            attempter=self.user,
            question=self.mcq_question,
            answer="A",
            is_correct=False,
        )
        old_attempt.submitted_at = timezone.now() - timedelta(minutes=10)
        old_attempt.save(update_fields=["submitted_at"])

        latest_attempt = Attempt.objects.create(
            attempter=self.user,
            question=self.mcq_question,
            answer="D",
            is_correct=True,
        )

        second_question = Question.objects.create(
            creator=self.user,
            question="Capital of France?",
            type="SHORT",
            week="Week3",
            topic="Geography",
            source="STUDENT"
        )
        Attempt.objects.create(
            attempter=self.user,
            question=second_question,
            answer="Paris",
            is_correct=None,
        )

        url = reverse("user-attempts")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        returned_question_ids = {str(attempt["question"]) for attempt in response.data}
        self.assertSetEqual(returned_question_ids, {str(self.mcq_question.id), str(second_question.id)})

        mcq_entry = next(item for item in response.data if str(item["question"]) == str(self.mcq_question.id))
        self.assertEqual(mcq_entry["id"], str(latest_attempt.id))
        self.assertTrue(mcq_entry["is_correct"])

    def test_list_attempts_for_question(self):
        """List all attempts for a specific question"""
        Attempt.objects.create(attempter=self.user, question=self.mcq_question, answer="A", is_correct=False)
        url = reverse("question-attempts", kwargs={"question_id": self.mcq_question.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertFalse(response.data[0]["is_correct"])

    def test_list_attempts_unauthenticated(self):
        """Unauthorized attempt list access"""
        self.client.logout()
        url = reverse("user-attempts")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # --- Heatmap Tests ---
    def test_user_activity_heatmap(self):
        """Return activity data for last 365 days"""
        # Create attempts on different days
        now = timezone.now()
        for i in range(3):
            Attempt.objects.create(
                attempter=self.user,
                question=self.mcq_question,
                answer="D",
                is_correct=True,
                submitted_at=now - timedelta(days=i)
            )

        url = reverse("user-activity-heatmap")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("activity", response.data)
        self.assertIn("total_attempts", response.data)
        self.assertGreaterEqual(response.data["total_attempts"], 3)

    def test_user_activity_heatmap_unauthenticated(self):
        """Unauthorized user cannot access heatmap"""
        self.client.logout()
        url = reverse("user-activity-heatmap")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
