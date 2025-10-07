from django.urls import path
from .views import QuestionCreateView, QuestionListView, QuestionDetailView, UserQuestionsView

urlpatterns = [
    path("create/", QuestionCreateView.as_view(), name="question-create"),
    path("user/", UserQuestionsView.as_view(), name="user-questions"),
    path("", QuestionListView.as_view(), name="question-list"),
    path("<uuid:pk>/", QuestionDetailView.as_view(), name="question-detail"),
]