from django.urls import path
from .views import AttemptCreateView, UserAttemptListView, QuestionAttemptListView

urlpatterns = [
    path("create/", AttemptCreateView.as_view(), name="attempt-create"),
    path("user/", UserAttemptListView.as_view(), name="user-attempts"),
    path("question/<uuid:question_id>/", QuestionAttemptListView.as_view(), name="question-attempts"),
]