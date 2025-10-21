from django.urls import path
from .views import AttemptCreateView, UserAttemptListView, QuestionAttemptListView, user_activity_heatmap

urlpatterns = [
    path("create/", AttemptCreateView.as_view(), name="attempt-create"),
    path("user/", UserAttemptListView.as_view(), name="user-attempts"),
    path("user/activity/", user_activity_heatmap, name="user-activity-heatmap"),
    path("question/<uuid:question_id>/", QuestionAttemptListView.as_view(), name="question-attempts"),
]