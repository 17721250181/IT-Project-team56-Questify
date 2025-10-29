from collections import OrderedDict
from datetime import timedelta

from django.contrib.auth.models import User
from django.db.models import Avg, Count, Max, Q
from django.db.models.functions import Length
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from attempts.models import Attempt
from questions.models import Question, ShortAnswerQuestion
from .permissions import IsAdminEmail
from rest_framework import status


class AdminOverviewView(APIView):
    """High-level metrics for the Questify platform."""

    permission_classes = [IsAdminEmail]

    def get(self, request):
        now = timezone.now()
        last_7_days = now - timedelta(days=7)

        total_users = User.objects.count()
        active_users = User.objects.filter(last_login__gte=last_7_days).count()
        question_totals = Question.objects.aggregate(
            total=Count("id"),
            mcq=Count("id", filter=Q(type=Question.Type.MCQ)),
            short=Count("id", filter=Q(type=Question.Type.SHORT)),
            pending=Count("id", filter=Q(verify_status=Question.VerifyStatus.PENDING)),
        )
        attempt_totals = Attempt.objects.aggregate(
            total=Count("id"),
            correct=Count("id", filter=Q(is_correct=True)),
            incorrect=Count("id", filter=Q(is_correct=False)),
            unique_users=Count("attempter", distinct=True),
        )

        short_details = ShortAnswerQuestion.objects.aggregate(
            total=Count("id"),
            ai_answered=Count("id", filter=~Q(ai_answer__isnull=True) & ~Q(ai_answer__exact="")),
            last_generated=Max("question__created_at"),
        )

        overview = OrderedDict(
            users={
                "total": total_users,
                "active_last_7_days": active_users,
                "with_attempts": attempt_totals["unique_users"],
            },
            questions={
                "total": question_totals["total"],
                "mcq": question_totals["mcq"],
                "short": question_totals["short"],
                "pending_review": question_totals["pending"],
            },
            attempts={
                "total": attempt_totals["total"],
                "correct": attempt_totals["correct"],
                "incorrect": attempt_totals["incorrect"],
                "unique_users": attempt_totals["unique_users"],
            },
            ai_usage={
                "short_answer_total": short_details["total"],
                "ai_answered": short_details["ai_answered"],
                "last_generated_at": (
                    short_details["last_generated"].isoformat()
                    if short_details["last_generated"]
                    else None
                ),
            },
            generated_at=now.isoformat(),
        )

        return Response(overview)


class AdminUserActivityView(APIView):
    """Detailed per-user activity metrics."""

    permission_classes = [IsAdminEmail]

    def get(self, request):
        limit_param = request.query_params.get("limit", "20")
        try:
            limit = max(1, min(int(limit_param), 100))
        except (TypeError, ValueError):
            limit = 20

        queryset = (
            User.objects.select_related("profile")
            .annotate(
                total_questions=Count("questions", distinct=True),
                total_attempts=Count("attempts", distinct=True),
                last_question=Max("questions__created_at"),
                last_attempt=Max("attempts__submitted_at"),
            )
            .filter(Q(total_questions__gt=0) | Q(total_attempts__gt=0))
            .order_by("-total_attempts", "-total_questions", "-last_attempt")
        )

        payload = []
        for user in queryset[:limit]:
            last_activity_candidates = [
                ts
                for ts in (user.last_attempt, user.last_question, user.last_login)
                if ts is not None
            ]
            last_activity = max(last_activity_candidates).isoformat() if last_activity_candidates else None
            payload.append(
                {
                    "user_id": user.id,
                    "email": user.email,
                    "display_name": getattr(user.profile, "display_name", "") or user.email,
                    "total_questions": user.total_questions,
                    "total_attempts": user.total_attempts,
                    "last_activity": last_activity,
                    "last_login": user.last_login.isoformat() if user.last_login else None,
                }
            )

        return Response(
            {
                "limit": limit,
                "count": len(payload),
                "results": payload,
            }
        )


class AdminAIUsageView(APIView):
    """Statistics focused on AI-generated short-answer content."""

    permission_classes = [IsAdminEmail]

    def get(self, request):
        base_queryset = ShortAnswerQuestion.objects.all()
        populated_queryset = base_queryset.exclude(Q(ai_answer__isnull=True) | Q(ai_answer__exact=""))
        fallback_queryset = populated_queryset.filter(ai_answer__icontains="AI explanation failed")

        aggregates = populated_queryset.annotate(
            ai_len=Length("ai_answer"),
        ).aggregate(
            average_length=Avg("ai_len"),
            last_generated=Max("question__created_at"),
        )

        latest_items = (
            populated_queryset.select_related("question__creator")
            .order_by("-question__created_at")[:10]
        )

        recent = []
        for item in latest_items:
            question = item.question
            recent.append(
                {
                    "question_id": str(question.id),
                    "question_text": question.question[:140],
                    "creator_email": question.creator.email,
                    "created_at": question.created_at.isoformat() if question.created_at else None,
                }
            )

        response = {
            "totals": {
                "short_answers": base_queryset.count(),
                "ai_populated": populated_queryset.count(),
                "fallback_messages": fallback_queryset.count(),
            },
            "performance": {
                "ai_success_rate": (
                    populated_queryset.count() / base_queryset.count()
                    if base_queryset.exists()
                    else None
                ),
                "average_ai_answer_length": aggregates["average_length"],
                "last_generated_at": (
                    aggregates["last_generated"].isoformat()
                    if aggregates["last_generated"]
                    else None
                ),
            },
            "recent_examples": recent,
        }

        return Response(response)
    

class AdminVerifyQuestionView(APIView):
    """Approve or reject a student-submitted question."""
    permission_classes = [IsAdminEmail]

    def post(self, request, question_id):
        # status = Question.VerifyStatus
        action = request.data.get("action")

        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == "APPROVE":
            question.verify_status = Question.VerifyStatus.APPROVED
        elif action == "REJECT":
            question.verify_status = Question.VerifyStatus.REJECTED
        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

        question.save()
        return Response(
            {
                "message": f"Question {action.lower()}d successfully",
                "new_status": question.verify_status,
            },
            status=status.HTTP_200_OK,
        )