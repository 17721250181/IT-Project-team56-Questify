from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import Question, ShortAnswerQuestion, MCQQuestion
from .serializers import QuestionCreateSerializer
import openai
import os
import requests
from openai import OpenAI
from django.conf import settings



class QuestionCreateView(generics.CreateAPIView):
    serializer_class = QuestionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        q_type = request.data.get("type")

        # create question objects
        question = Question.objects.create(
            question=request.data["question"],
            source="STUDENT",
        )

        if q_type == "SHORT":
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
                "answer": answer,
                "ai_answer": ai_answer
            }, status=status.HTTP_201_CREATED)

        elif q_type == "MCQ":
            option_a = request.data.get("option_a")
            option_b = request.data.get("option_b")
            option_c = request.data.get("option_c")
            option_d = request.data.get("option_d")
            option_e = request.data.get("option_e")
            correct_option = request.data.get("correct_option")

            # assume must have 5 options
            if not all([option_a, option_b, option_c, option_d, option_e, correct_option]):
                return Response({"error": "MCQ must include 5 options and a correct_option"},
                                status=status.HTTP_400_BAD_REQUEST)

            mcq_q = MCQQuestion.objects.create(
                question=question,
                option_a=option_a,
                option_b=option_b,
                option_c=option_c,
                option_d=option_d,
                option_e=option_e,
                correct_option=correct_option,
            )

            return Response({
                "id": question.id,
                "type": "MCQ",
                "question": question.question,
                "options": {
                    "A": mcq_q.option_a,
                    "B": mcq_q.option_b,
                    "C": mcq_q.option_c,
                    "D": mcq_q.option_d,
                    "E": mcq_q.option_e,
                },
                "correct_option": mcq_q.correct_option,
                "explanation": mcq_q.explanation,
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