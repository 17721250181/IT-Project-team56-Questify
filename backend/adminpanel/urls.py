from django.urls import path

from .views import AdminAIUsageView, AdminOverviewView, AdminUserActivityView, AdminVerifyQuestionView

urlpatterns = [
    path("overview/", AdminOverviewView.as_view(), name="admin-overview"),
    path("user-activity/", AdminUserActivityView.as_view(), name="admin-user-activity"),
    path("ai-usage/", AdminAIUsageView.as_view(), name="admin-ai-usage"),
    path("verify/<uuid:question_id>/", AdminVerifyQuestionView.as_view(), name="admin-verify-question"),
]
