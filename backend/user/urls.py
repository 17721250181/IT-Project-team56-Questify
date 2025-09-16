from django.urls import path
from . import views

app_name = 'user'

urlpatterns = [
    path("auth/register/", views.register, name="register"),
    path("auth/login/", views.login_view, name="login"),
    path("auth/logout/", views.logout_view, name="logout"),
    path("auth/password-reset/", views.password_reset_request, name="password_reset_request"),
    path("auth/password-reset-confirm/", views.password_reset_confirm, name="password_reset_confirm"),
    path("me/", views.me, name="me"),
    path("csrf/", views.get_csrf_token, name="get_csrf_token"),
]