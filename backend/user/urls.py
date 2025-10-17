from django.urls import path
from . import views
from django.urls import path
from .views import MeProfilePictureView

app_name = 'user'

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("auth/password-reset/", views.PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("auth/password-reset-confirm/", views.PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("me/", views.MeView.as_view(), name="me"),
    path("csrf/", views.GetCSRFTokenView.as_view(), name="get_csrf_token"),
    path("me/profile-picture/", MeProfilePictureView.as_view(), name="me-profile-picture"),
]