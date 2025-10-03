from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Attempt
from .serializers import AttemptSerializer
from questions.models import Question
from rest_framework.permissions import AllowAny

class AttemptCreateView(generics.CreateAPIView):
    queryset = Attempt.objects.all()
    serializer_class = AttemptSerializer
    permission_classes = [AllowAny]  # Allow all for testing

    def create(self, request, *args, **kwargs):
        # Debug output
        print(f"User: {request.user}")
        print(f"Is authenticated: {request.user.is_authenticated}")
        print(f"Session key: {request.session.session_key}")
        print(f"Cookies: {request.COOKIES.keys()}")
        print(f"CSRF token in header: {request.META.get('HTTP_X_CSRFTOKEN')}")
        
        question_id = request.data.get("question")
        user_answer = request.data.get("answer")

        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response({
                "error": "Authentication required",
                "details": "Please login to submit answers"
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Get the question
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({
                "error": "Question not found"
            }, status=status.HTTP_404_NOT_FOUND)

        is_correct = None

        # Check correctness for MCQ
        if hasattr(question, "mcq_detail"):
            correct = question.mcq_detail.correct_options
            
            # Handle different answer formats
            if isinstance(user_answer, list):
                user_answer_list = [str(ans).strip().upper() for ans in user_answer]
            else:
                user_answer_list = [str(user_answer).strip().upper()]

            is_correct = sorted(user_answer_list) == sorted(correct)

        attempt = Attempt.objects.create(
            attempter=request.user,
            question=question,
            answer=user_answer,
            is_correct=is_correct
        )

        return Response({
            "id": attempt.id,
            "is_correct": attempt.is_correct,
            "answer": attempt.answer,
            "submitted_at": attempt.submitted_at
        }, status=status.HTTP_201_CREATED)


class UserAttemptListView(generics.ListAPIView):
    """Get all attempts by the current user"""
    serializer_class = AttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Attempt.objects.filter(attempter=self.request.user).order_by('-submitted_at')


class QuestionAttemptListView(generics.ListAPIView):
    """Get all attempts for a specific question"""
    serializer_class = AttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        question_id = self.kwargs['question_id']
        return Attempt.objects.filter(question_id=question_id).order_by('-submitted_at')