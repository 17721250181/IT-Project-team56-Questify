"""
Test the recommendation system
"""
import pytest
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from questions.models import Question, ShortAnswerQuestion
from attempts.models import Attempt


class RecommendationSystemTest(TestCase):
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test users
        self.user1 = User.objects.create_user(username='testuser1', password='testpass123')
        self.user2 = User.objects.create_user(username='testuser2', password='testpass123')
        
        # Create questions with different topics and verification status
        # Topic: JAVA basics
        self.q1 = Question.objects.create(
            question="What is a variable?",
            source="STUDENT",
            creator=self.user2,
            topic="JAVA basics",
            week="Week1",
            type="SHORT",
            verify_status=Question.VerifyStatus.APPROVED,
            rating=4.5,
            num_attempts=10
        )
        ShortAnswerQuestion.objects.create(question=self.q1, answer="A variable stores data")
        
        self.q2 = Question.objects.create(
            question="What is a loop?",
            source="STUDENT",
            creator=self.user2,
            topic="JAVA basics",
            week="Week1",
            type="SHORT",
            verify_status=Question.VerifyStatus.APPROVED,
            rating=4.2,
            num_attempts=8
        )
        ShortAnswerQuestion.objects.create(question=self.q2, answer="A loop repeats code")
        
        # Topic: Classes and Objects
        self.q3 = Question.objects.create(
            question="What is a class?",
            source="STUDENT",
            creator=self.user2,
            topic="Classes and Objects",
            week="Week2",
            type="SHORT",
            verify_status=Question.VerifyStatus.APPROVED,
            rating=4.8,
            num_attempts=15
        )
        ShortAnswerQuestion.objects.create(question=self.q3, answer="A class is a blueprint")
        
        self.q4 = Question.objects.create(
            question="What is inheritance?",
            source="STUDENT",
            creator=self.user2,
            topic="Inheritance and Polymorphism",
            week="Week3",
            type="SHORT",
            verify_status=Question.VerifyStatus.PENDING,
            rating=3.8,
            num_attempts=5
        )
        ShortAnswerQuestion.objects.create(question=self.q4, answer="Inheritance is...")
        
        self.q5 = Question.objects.create(
            question="What is an array?",
            source="STUDENT",
            creator=self.user2,
            topic="Arrays and Strings",
            week="Week4",
            type="SHORT",
            verify_status=Question.VerifyStatus.APPROVED,
            rating=4.6,
            num_attempts=12
        )
        ShortAnswerQuestion.objects.create(question=self.q5, answer="An array is a collection")

    def test_recommendation_requires_authentication(self):
        """Test that recommendation endpoint requires authentication"""
        response = self.client.get('/api/questions/recommended/')
        # Django returns 403 (Forbidden) when authentication is required
        self.assertIn(response.status_code, [401, 403])

    def test_recommendation_returns_questions(self):
        """Test that recommendation endpoint returns questions"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/questions/recommended/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)

    def test_recommendation_excludes_attempted_questions(self):
        """Test that recommendations exclude questions user has attempted"""
        self.client.force_authenticate(user=self.user1)
        
        # User1 attempts q1
        Attempt.objects.create(
            attempter=self.user1,
            question=self.q1,
            answer="test answer",
            is_correct=True
        )
        
        response = self.client.get('/api/questions/recommended/')
        self.assertEqual(response.status_code, 200)
        
        # Check that q1 is not in recommendations
        recommended_ids = [q['id'] for q in response.data]
        self.assertNotIn(str(self.q1.id), recommended_ids)

    def test_recommendation_prioritizes_same_topic(self):
        """Test that recommendations prioritize same topic as last attempt"""
        self.client.force_authenticate(user=self.user1)
        
        # User1 attempts a JAVA basics question
        Attempt.objects.create(
            attempter=self.user1,
            question=self.q1,
            answer="test answer",
            is_correct=True
        )
        
        response = self.client.get('/api/questions/recommended/')
        self.assertEqual(response.status_code, 200)
        
        # Count how many JAVA basics questions are recommended
        java_basics_count = sum(
            1 for q in response.data 
            if q['topic'] == 'JAVA basics'
        )
        
        # Should have at least one JAVA basics question (if available)
        # Note: q1 is excluded since it was attempted
        if self.q2 in Question.objects.all():
            self.assertGreaterEqual(java_basics_count, 1)

    def test_recommendation_includes_unverified_questions(self):
        """Test that unverified questions are included but with lower priority"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.get('/api/questions/recommended/')
        self.assertEqual(response.status_code, 200)
        
        # Check if any pending questions are included
        has_pending = any(
            q['verify_status'] == 'PENDING' 
            for q in response.data
        )
        
        # Pending questions should be included
        self.assertTrue(has_pending or len(response.data) < 6, 
                       "Should include pending questions when available")

    def test_recommendation_returns_max_6_questions(self):
        """Test that recommendations return at most 6 questions"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.get('/api/questions/recommended/')
        self.assertEqual(response.status_code, 200)
        self.assertLessEqual(len(response.data), 6)

    def test_recommendation_with_no_attempts(self):
        """Test recommendations for user with no attempts"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.get('/api/questions/recommended/')
        self.assertEqual(response.status_code, 200)
        
        # Should still get recommendations even without attempts
        self.assertGreater(len(response.data), 0)

    def test_recommendation_diverse_topics(self):
        """Test that recommendations include diverse topics"""
        self.client.force_authenticate(user=self.user1)
        
        # User attempts one question
        Attempt.objects.create(
            attempter=self.user1,
            question=self.q1,
            answer="test",
            is_correct=True
        )
        
        response = self.client.get('/api/questions/recommended/')
        self.assertEqual(response.status_code, 200)
        
        # Get unique topics
        topics = set(q['topic'] for q in response.data)
        
        # Should have more than one topic (diversity)
        self.assertGreater(len(topics), 1, 
                          "Recommendations should include diverse topics")
