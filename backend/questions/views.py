from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from django.db.models import Q, Prefetch, Value
from django.db.models.functions import Lower, Replace
from .models import Question, ShortAnswerQuestion, MCQQuestion, Comment, QuestionRating, SavedQuestion
from .serializers import QuestionCreateSerializer, QuestionSerializer, CommentSerializer, ReplySerializer, SavedQuestionSerializer
import os
import re
import requests
from django.conf import settings
from django.shortcuts import get_object_or_404


DEFAULT_WEEK_OPTIONS = [
    "Week1",
    "Week2",
    "Week3",
    "Week4",
    "Week5",
    "Week6",
    "Week7",
    "Week8",
    "Week9",
    "Week10",
    "Week11",
    "Week12",
]

DEFAULT_TOPIC_OPTIONS = [
    "JAVA basics",
    "Classes and Objects",
    "Software Tools and Bagel",
    "Arrays and Strings",
    "Input and Output",
    "Inheritance and Polymorphism",
    "Interfaces and Polymorphism",
    "Modelling Classes and Relationships",
    "Generics",
    "Collections and Maps",
    "Design Patterns",
    "Exceptions",
    "Software Testing and Design",
    "Event Driven Programming",
    "Advanced Java",
]


def merge_with_defaults(defaults, extras, extra_sort_key=None):
    seen = set()
    merged = []

    for value in defaults:
        if value and value not in seen:
            merged.append(value)
            seen.add(value)

    filtered_extras = [value for value in extras if value and value not in seen]
    if extra_sort_key:
        filtered_extras.sort(key=extra_sort_key)
    merged.extend(filtered_extras)
    return merged


def week_sort_key(value):
    match = re.search(r"\d+", value or "")
    return (int(match.group()) if match else float("inf"), value or "")


class QuestionCreateView(generics.CreateAPIView):
    serializer_class = QuestionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        type = request.data.get("type")

        user = request.user

        # create question objects
        question = Question.objects.create(
            question=request.data["question"],
            source="STUDENT",
            creator=user,
            week = request.data["week"],
            topic = request.data["topic"],
            type=type
        )

        if type == "SHORT":
            answer = request.data.get("answer", "")

            # create ai explanation using openai api
            ai_answer = self.get_ai_explanation(question.question, answer)
            # store the SAQ
            ShortAnswerQuestion.objects.create(
                question=question,
                answer=answer,
                ai_answer = ai_answer
            )
            return Response({
                "id": question.id,
                "question": question.question,
                "type": "SHORT",
                "creator": user.username,
                "answer": answer,
                "ai_answer": ai_answer
            }, status=status.HTTP_201_CREATED)

        elif type == "MCQ":
            option_a = request.data.get("option_a")
            option_b = request.data.get("option_b")
            option_c = request.data.get("option_c")
            option_d = request.data.get("option_d")
            option_e = request.data.get("option_e")
            correct_options = request.data.get("correct_options")

            # assume must have 5 options
            if not all([option_a, option_b, option_c, option_d, option_e, correct_options]):
                return Response({"error": "MCQ must include 5 options and a correct_option"},
                                status=status.HTTP_400_BAD_REQUEST)

            mcq_q = MCQQuestion.objects.create(
                question=question,
                option_a=option_a,
                option_b=option_b,
                option_c=option_c,
                option_d=option_d,
                option_e=option_e,
                correct_options=correct_options,
            )

            return Response({
                "id": question.id,
                "type": "MCQ",
                "question": question.question,
                "creator": user.username,
                "options": {
                    "A": mcq_q.option_a,
                    "B": mcq_q.option_b,
                    "C": mcq_q.option_c,
                    "D": mcq_q.option_d,
                    "E": mcq_q.option_e,
                },
                "correct_options": mcq_q.correct_options,
                # "explanation": mcq_q.explanation,
            }, status=status.HTTP_201_CREATED)

        else:
            return Response({"error": "Invalid type (must be 'SHORT' or 'MCQ')"},
                            status=status.HTTP_400_BAD_REQUEST)


    # def get_ai_explanation(self, question_text, answer_text):
    #     client = OpenAI(api_key=settings.OPENAI_API_KEY)
    #     prompt = f"""
    #     You are an assistant generating explanations for short-answer questions.
    #     Question: {question_text}
    #     Expected answer: {answer_text}
    #     Please provide a clear, short explanation that helps a student understand the answer.
    #     """
    #     try:
    #         response = client.chat.completions.create(
    #             model="gpt-4o-mini",
    #             messages=[{"role": "user", "content": prompt}],
    #         )
    #         return response.choices[0].message.content
    #     except Exception as e:
    #         return f"AI explanation failed: {e}"

    def get_ai_explanation(self, question_text, answer_text):
        prompt = f"""
        You are an assistant generating explanations for short-answer questions.
        Question: {question_text}
        Expected answer: {answer_text}
        Please provide a clear, short explanation that helps a student understand the answer.
        """

        try:
            headers = {
                "Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY') or settings.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
            }

            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()

        except Exception as e:
            return f"AI explanation failed: {e}"


class QuestionListView(generics.ListAPIView):
    """Get all questions"""
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Question.objects.all().select_related("creator")

        params = self.request.query_params
        search = params.get("search")
        if search:
            search = search.strip()
            if search:
                queryset = queryset.filter(
                    Q(question__icontains=search) |
                    Q(topic__icontains=search) |
                    Q(week__icontains=search) |
                    Q(creator__username__icontains=search)
                )

        weeks = params.getlist("week")
        if weeks:
            normalized_weeks = [
                re.sub(r"\s+", "", week.strip().lower())
                for week in weeks
                if week and week.strip()
            ]
            if normalized_weeks:
                queryset = queryset.annotate(
                    week_normalized=Replace(Lower("week"), Value(" "), Value(""))
                ).filter(week_normalized__in=normalized_weeks)

        topics = params.getlist("topic")
        if topics:
            queryset = queryset.filter(topic__in=topics)

        types = params.getlist("type")
        if types:
            normalized_types = [t.upper() for t in types if t]
            queryset = queryset.filter(type__in=normalized_types)

        sources = params.getlist("source")
        if sources:
            queryset = queryset.filter(source__in=sources)

        verified = params.get("verified")
        if verified in {"true", "1", "yes"}:
            queryset = queryset.filter(verify_status=Question.VerifyStatus.APPROVED)

        min_rating = params.get("min_rating")
        if min_rating:
            try:
                queryset = queryset.filter(rating__gte=float(min_rating))
            except ValueError:
                pass

        max_rating = params.get("max_rating")
        if max_rating:
            try:
                queryset = queryset.filter(rating__lte=float(max_rating))
            except ValueError:
                pass

        creator_id = params.get("creator")
        if creator_id:
            queryset = queryset.filter(creator_id=creator_id)

        ordering_param = params.get("ordering", "newest")
        ordering_map = {
            "newest": "-created_at",
            "oldest": "created_at",
            "rating_desc": "-rating",
            "rating": "-rating",
            "rating_asc": "rating",
            "attempts_desc": "-num_attempts",
            "attempts": "-num_attempts",
            "attempts_asc": "num_attempts",
            "author_asc": "creator__username",
            "author_desc": "-creator__username",
        }
        order_by = ordering_map.get(ordering_param, "-created_at")
        if isinstance(order_by, str):
            order_by = [order_by]
        if "-created_at" not in order_by:
            order_by.append("-created_at")
        queryset = queryset.order_by(*order_by)

        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.prefetch_related(
                Prefetch(
                    "ratings",
                    queryset=QuestionRating.objects.filter(user=user),
                    to_attr="user_rating_for_requester",
                )
            )
        return queryset.prefetch_related("mcq_detail", "short_detail")


class QuestionDetailView(generics.RetrieveAPIView):
    """Get specific question details"""
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserQuestionsView(generics.ListAPIView):
    """Get all questions created by the current user"""
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Question.objects.filter(creator=self.request.user).order_by('-created_at')
    


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        question_id = self.kwargs.get("question_id") or self.request.query_params.get("question_id")
        if question_id:
            return Comment.objects.filter(
                question_id=question_id,
                parent__isnull=True
            ).select_related("author", "author__profile").prefetch_related(
                "likes",
                "replies__author",
                "replies__author__profile",
                "replies__likes",
            )
        return Comment.objects.filter(parent__isnull=True).select_related(
            "author", "author__profile"
        ).prefetch_related("likes", "replies__author", "replies__author__profile", "replies__likes")

    def perform_create(self, serializer):
        question_id = self.kwargs.get("question_id")
        question = get_object_or_404(Question, pk=question_id)
        serializer.save(author=self.request.user, question=question)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        parent_comment = self.get_object()
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Content is required'}, status=400)

        reply = Comment.objects.create(
            question=parent_comment.question,
            author=request.user,
            parent=parent_comment,
            content=content
        )
        serializer = ReplySerializer(reply, context=self.get_serializer_context())
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        # Get comment/reply directly without queryset filtering
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        user = request.user
        comment.likes.add(user)
        return Response({'like_count': comment.likes.count()})

    @action(detail=True, methods=['post'])
    def unlike(self, request, pk=None):
        # Get comment/reply directly without queryset filtering
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        user = request.user
        comment.likes.remove(user)
        return Response({'like_count': comment.likes.count()})


class QuestionMetadataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Question.objects.all()
        week_values = list(filter(None, queryset.values_list("week", flat=True)))
        topic_values = list(filter(None, queryset.values_list("topic", flat=True)))

        weeks = merge_with_defaults(
            DEFAULT_WEEK_OPTIONS,
            week_values,
            extra_sort_key=week_sort_key,
        )
        topics = merge_with_defaults(
            DEFAULT_TOPIC_OPTIONS,
            topic_values,
            extra_sort_key=lambda value: value.lower(),
        )

        return Response({
            "weeks": weeks,
            "topics": topics,
            "types": [choice[0] for choice in Question.Type.choices],
            "sources": [choice[0] for choice in Question.Source.choices],
            "verifyStatuses": [choice[0] for choice in Question.VerifyStatus.choices],
        })


class QuestionRatingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, question_id):
        question = get_object_or_404(Question, pk=question_id)
        user_rating = question.ratings.filter(user=request.user).first()
        return Response({
            "questionId": str(question.id),
            "average": question.rating,
            "count": question.rating_count,
            "userRating": user_rating.score if user_rating else None,
        })

    def post(self, request, question_id):
        score = request.data.get("score")
        try:
            score = int(score)
        except (TypeError, ValueError):
            return Response({"error": "Score must be an integer between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)

        if score < 1 or score > 5:
            return Response({"error": "Score must be between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)

        question = get_object_or_404(Question, pk=question_id)
        rating, _created = QuestionRating.objects.update_or_create(
            question=question,
            user=request.user,
            defaults={"score": score},
        )
        question.recalculate_rating()
        return Response({
            "questionId": str(question.id),
            "average": question.rating,
            "count": question.rating_count,
            "userRating": rating.score,
        }, status=status.HTTP_200_OK)

    def delete(self, request, question_id):
        question = get_object_or_404(Question, pk=question_id)
        deleted = question.ratings.filter(user=request.user).delete()
        if deleted[0]:
            question.recalculate_rating()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SaveQuestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, question_id):
        user = request.user
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)

        saved, created = SavedQuestion.objects.get_or_create(user=user, question=question)
        if not created:
            saved.delete()
            return Response({"message": "Question unsaved."}, status=status.HTTP_200_OK)

        return Response({"message": "Question saved."}, status=status.HTTP_201_CREATED)


class SavedQuestionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        saved_qs = SavedQuestion.objects.filter(user=request.user).select_related("question").order_by("-saved_at")
        serializer = SavedQuestionSerializer(saved_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuestionVerifyView(APIView):
    """
    Admin-only endpoint to verify (approve/reject) questions.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # Check if user is admin
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"error": "Only administrators can verify questions."},
                status=status.HTTP_403_FORBIDDEN
            )

        question = get_object_or_404(Question, pk=pk)
        
        # Get verification data from request
        approved = request.data.get("approved")
        rejection_reason = request.data.get("rejectionReason", "").strip()

        # Validate input
        if approved is None:
            return Response(
                {"error": "Field 'approved' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # If rejecting, rejection reason is required
        if not approved and not rejection_reason:
            return Response(
                {"error": "Rejection reason is required when rejecting a question."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update question verification status
        if approved:
            question.verify_status = Question.VerifyStatus.APPROVED
            question.admin_feedback = None  # Clear any previous rejection reason
        else:
            question.verify_status = Question.VerifyStatus.REJECTED
            question.admin_feedback = rejection_reason

        question.save()

        # Return updated question data
        serializer = QuestionSerializer(question, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
