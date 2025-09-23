from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Attempt
from .serializers import AttemptSerializer
from questions.models import Question

class AttemptCreateView(generics.CreateAPIView):
    queryset = Attempt.objects.all()
    serializer_class = AttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        question_id = request.data.get("question")
        user_answer = request.data.get("answer")

        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)

        is_correct = None

        # correctness for MCQ
        if hasattr(question, "mcq_detail"):
            correct = question.mcq_detail.correct_option.upper()
            is_correct = (user_answer.strip().upper() == correct)

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