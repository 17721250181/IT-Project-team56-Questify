from django.urls import path
from .views import AttemptCreateView

urlpatterns = [
    path("create/", AttemptCreateView.as_view(), name="attempt-create"),
]