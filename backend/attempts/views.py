from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, F, OuterRef, Subquery
from django.db.models.functions import TruncDate
from datetime import datetime, timedelta
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

        # Update question's attempt count
        question.num_attempts = question.attempts.count()
        question.save(update_fields=['num_attempts'])

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
        user = self.request.user

        latest_attempt_subquery = Attempt.objects.filter(
            attempter=user,
            question_id=OuterRef("question_id")
        ).order_by("-submitted_at", "-id").values("id")[:1]

        return (
            Attempt.objects.filter(attempter=user)
            .annotate(latest_attempt_id=Subquery(latest_attempt_subquery))
            .filter(pk=F("latest_attempt_id"))
            .order_by("-submitted_at", "-id")
        )


class QuestionAttemptListView(generics.ListAPIView):
    """Get all attempts for a specific question"""
    serializer_class = AttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        question_id = self.kwargs['question_id']
        return Attempt.objects.filter(question_id=question_id).order_by('-submitted_at')


class UserQuestionAttemptListView(generics.ListAPIView):
    """Get all attempts for a specific question by the current user"""
    serializer_class = AttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        question_id = self.kwargs['question_id']
        user = self.request.user
        return Attempt.objects.filter(
            question_id=question_id,
            attempter=user
        ).order_by('-submitted_at')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_activity_heatmap(request):
    """
    Get user's activity data for heatmap visualization
    Returns attempts count grouped by date for the past 365 days
    """
    user = request.user
    
    # Get date range (past 365 days / 12 months)
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=365)
    
    # Query attempts grouped by date
    activity_data = (
        Attempt.objects
        .filter(attempter=user, submitted_at__date__gte=start_date)
        .annotate(date=TruncDate('submitted_at'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('date')
    )
    
    # Convert to dictionary for easier frontend processing
    activity_dict = {
        str(item['date']): item['count'] 
        for item in activity_data
    }
    
    return Response({
        'start_date': str(start_date),
        'end_date': str(end_date),
        'activity': activity_dict,
        'total_attempts': sum(activity_dict.values())
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_streak(request):
    """
    Calculate user's current streak (consecutive days with attempts)
    Returns current streak, longest streak, and today's attempt count
    """
    user = request.user
    today = datetime.now().date()
    
    # Get all unique dates where user made attempts (descending order)
    attempt_dates = (
        Attempt.objects
        .filter(attempter=user)
        .annotate(date=TruncDate('submitted_at'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('-date')
    )
    
    if not attempt_dates:
        return Response({
            'current_streak': 0,
            'longest_streak': 0,
            'today_count': 0,
            'has_attempted_today': False
        })
    
    # Convert to list of dates
    dates_with_counts = [(item['date'], item['count']) for item in attempt_dates]
    dates = [item['date'] for item in attempt_dates]
    
    # Check today's attempts
    today_count = 0
    has_attempted_today = False
    if dates and dates[0] == today:
        today_count = dates_with_counts[0][1]
        has_attempted_today = True
    
    # Calculate current streak
    current_streak = 0
    check_date = today
    
    # If user hasn't attempted today, check from yesterday
    if not has_attempted_today:
        check_date = today - timedelta(days=1)
    
    for date in dates:
        if date == check_date:
            current_streak += 1
            check_date -= timedelta(days=1)
        elif date < check_date:
            # Gap found, stop counting
            break
    
    # Calculate longest streak
    longest_streak = 0
    temp_streak = 0
    prev_date = None
    
    for date in reversed(dates):
        if prev_date is None:
            temp_streak = 1
        elif (date - prev_date).days == 1:
            temp_streak += 1
        else:
            longest_streak = max(longest_streak, temp_streak)
            temp_streak = 1
        prev_date = date
    
    longest_streak = max(longest_streak, temp_streak)
    
    return Response({
        'current_streak': current_streak,
        'longest_streak': longest_streak,
        'today_count': today_count,
        'has_attempted_today': has_attempted_today
    })
