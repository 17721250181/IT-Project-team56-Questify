"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from questions import views
from questions.views import hello

urlpatterns = [
    path("admin/", admin.site.urls),
    path("questions/hello/", hello),
    
    # Authentication endpoints
    path("api/auth/register/", views.register, name="register"),
    path("api/auth/login/", views.login_view, name="login"),
    path("api/auth/logout/", views.logout_view, name="logout"),
    path("api/auth/password-reset/", views.password_reset_request, name="password_reset_request"),
    path("api/auth/password-reset-confirm/", views.password_reset_confirm, name="password_reset_confirm"),
    path("api/me/", views.me, name="me"),
    path("api/csrf/", views.get_csrf_token, name="get_csrf_token"),
]