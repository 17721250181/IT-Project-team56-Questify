import json
import secrets
from django.shortcuts import render
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.http import JsonResponse, HttpResponseBadRequest
from django.middleware.csrf import get_token
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST
from rest_framework.decorators import api_view
from rest_framework.response import Response


def _email_domain_ok(email):
    domain = email.split("@")[-1] if "@" in email else ""
    allowed = getattr(settings, "ALLOWED_EMAIL_DOMAINS", set()) or set()
    return not allowed or domain in allowed


@ensure_csrf_cookie
@require_GET
def get_csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_POST
def register(request):
    try:
        data = json.loads(request.body)
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not name or not email or not password:
            return HttpResponseBadRequest("Name, email, and password are required")

        if not _email_domain_ok(email):
            allowed_domains = ", ".join(settings.ALLOWED_EMAIL_DOMAINS)
            return HttpResponseBadRequest(f"Email must be from allowed domains: {allowed_domains}")

        if User.objects.filter(email=email).exists():
            return HttpResponseBadRequest("User with this email already exists")

        if User.objects.filter(username=email).exists():
            return HttpResponseBadRequest("User with this email already exists")

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )

        name_parts = name.split(" ", 1)
        user.first_name = name_parts[0]
        if len(name_parts) > 1:
            user.last_name = name_parts[1]
        user.save()

        login(request, user)

        return JsonResponse({
            "ok": True,
            "message": "Registration successful",
            "user": {
                "email": user.email,
                "name": user.get_full_name() or user.username,
                "is_staff": user.is_staff
            }
        })

    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")
    except Exception as e:
        return HttpResponseBadRequest(f"Registration failed: {str(e)}")


@require_POST
def login_view(request):
    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return HttpResponseBadRequest("Email and password are required")

        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({
                "ok": True,
                "message": "Login successful",
                "user": {
                    "email": user.email,
                    "name": user.get_full_name() or user.username,
                    "is_staff": user.is_staff
                }
            })
        else:
            return JsonResponse({"ok": False, "message": "Invalid email or password"}, status=401)

    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")
    except Exception as e:
        return HttpResponseBadRequest(f"Login failed: {str(e)}")


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({"ok": True, "message": "Logout successful"})


@login_required
@require_GET
def me(request):
    user = request.user
    return JsonResponse({
        "email": user.email,
        "name": user.get_full_name() or user.username,
        "is_staff": user.is_staff,
        "date_joined": user.date_joined.isoformat(),
        "last_login": user.last_login.isoformat() if user.last_login else None
    })


@require_POST
def password_reset_request(request):
    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip().lower()

        if not email:
            return HttpResponseBadRequest("Email is required")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({
                "ok": True,
                "message": "If the email exists, a password reset link has been sent"
            })

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        reset_url = f"http://localhost:5173/password-reset-confirm?uid={uid}&token={token}"

        send_mail(
            subject="Password Reset - Questify",
            message=f"Click the following link to reset your password: {reset_url}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return JsonResponse({
            "ok": True,
            "message": "If the email exists, a password reset link has been sent"
        })

    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")
    except Exception as e:
        return HttpResponseBadRequest(f"Password reset request failed: {str(e)}")


@require_POST
def password_reset_confirm(request):
    try:
        data = json.loads(request.body)
        uid = data.get("uid", "")
        token = data.get("token", "")
        new_password = data.get("new_password", "")

        if not uid or not token or not new_password:
            return HttpResponseBadRequest("UID, token, and new password are required")

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return JsonResponse({"ok": False, "message": "Invalid reset link"}, status=400)

        if not default_token_generator.check_token(user, token):
            return JsonResponse({"ok": False, "message": "Invalid or expired reset link"}, status=400)

        user.set_password(new_password)
        user.save()

        return JsonResponse({
            "ok": True,
            "message": "Password has been reset successfully"
        })

    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")
    except Exception as e:
        return HttpResponseBadRequest(f"Password reset failed: {str(e)}")
