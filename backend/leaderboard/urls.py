from django.urls import path
from .views import LeaderboardView, MyLeaderboardView

urlpatterns = [
    path("",    LeaderboardView.as_view(), name="leaderboard-list"),
    path("me/", MyLeaderboardView.as_view(), name="leaderboard-me"),
]
