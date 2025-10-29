from django.urls import path
from .views import (
    QuestionCreateView,
    QuestionListView,
    QuestionDetailView,
    UserQuestionsView,
    CommentViewSet,
    QuestionMetadataView,
    QuestionRatingView,
    QuestionVerifyView,
)
urlpatterns = [
    path("create/", QuestionCreateView.as_view(), name="question-create"),
    path("user/", UserQuestionsView.as_view(), name="user-questions"),
    path("metadata/", QuestionMetadataView.as_view(), name="question-metadata"),
    path("", QuestionListView.as_view(), name="question-list"),
    path("<uuid:pk>/", QuestionDetailView.as_view(), name="question-detail"),
    path("<uuid:pk>/verify/", QuestionVerifyView.as_view(), name="question-verify"),
    path("<uuid:question_id>/rating/", QuestionRatingView.as_view(), name="question-rating"),
    path("<uuid:question_id>/comments/", CommentViewSet.as_view({"get": "list", "post": "create"}), name="comment-list"),
    path("comments/<uuid:pk>/reply/", CommentViewSet.as_view({'post': 'reply'}), name="comment-reply"),
    path("comments/<uuid:pk>/like/", CommentViewSet.as_view({'post': 'like'}), name="comment-like"),
    path("comments/<uuid:pk>/unlike/", CommentViewSet.as_view({'post': 'unlike'}), name="comment-unlike"),
]
