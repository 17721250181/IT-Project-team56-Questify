from django.urls import path
from .views import QuestionCreateView, QuestionListView, QuestionDetailView

urlpatterns = [
    path("create/", QuestionCreateView.as_view(), name="question-create"),
    path("", QuestionListView.as_view(), name="question-list"),
    path("<uuid:pk>/", QuestionDetailView.as_view(), name="question-detail"),
]