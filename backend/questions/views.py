from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Question, ShortAnswerQuestion, MCQQuestion, Comment
from .serializers import QuestionCreateSerializer, QuestionSerializer, CommentSerializer, ReplySerializer
import os
import requests
from django.conf import settings
from django.shortcuts import get_object_or_404


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
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]


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
            ).prefetch_related('replies__author', 'replies__likes', 'likes')
        return Comment.objects.filter(parent__isnull=True).prefetch_related('replies__author', 'replies__likes', 'likes')

    def perform_create(self, serializer):
        question_id = self.kwargs.get("question_id")
        question = get_object_or_404(Question, pk=question_id)
        serializer.save(author=self.request.user, question=question)

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
        comment = self.get_object()
        user = request.user
        comment.likes.add(user)
        return Response({'like_count': comment.likes.count()})

    @action(detail=True, methods=['post'])
    def unlike(self, request, pk=None):
        comment = self.get_object()
        user = request.user
        comment.likes.remove(user)
        return Response({'like_count': comment.likes.count()})
