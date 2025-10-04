from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.middleware.csrf import get_token
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    CSRFTokenSerializer
)


class GetCSRFTokenView(APIView):
    """Get CSRF token for frontend authentication"""
    permission_classes = [AllowAny]

    # def get(self, request):
    #     serializer = CSRFTokenSerializer(data={'csrfToken': get_token(request)})
    #     serializer.is_valid()
    #     return Response(serializer.data, status=status.HTTP_200_OK)
   
    def get(self, request):
        token = get_token(request)
        return Response({"csrfToken": token}, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class RegisterView(APIView):
    """User registration endpoint"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            login(request, user)

            # Ensure CSRF token is set for subsequent requests
            get_token(request)

            user_serializer = UserSerializer(user)
            return Response({
                "ok": True,
                "message": "Registration successful",
                "user": user_serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            "ok": False,
            "message": "Registration failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            user = authenticate(request, username=email, password=password)

            if user is not None:
                login(request, user)

                # Ensure CSRF token is set for subsequent requests
                get_token(request)

                user_serializer = UserSerializer(user)
                return Response({
                    "ok": True,
                    "message": "Login successful",
                    "user": user_serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "ok": False,
                    "message": "Invalid email or password"
                }, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            "ok": False,
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        logout(request)
        response = Response({"ok": True, "message": "Logout successful"}, status=status.HTTP_200_OK)
        response.delete_cookie("sessionid")  # Remove session cookie
        return response
   
class MeView(APIView):
    """Get current user information"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """Request password reset"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']

            try:
                user = User.objects.get(email=email)

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
            except User.DoesNotExist:
                pass  # Don't reveal if email exists or not

            return Response({
                "ok": True,
                "message": "If the email exists, a password reset link has been sent"
            }, status=status.HTTP_200_OK)

        return Response({
            "ok": False,
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)

        if serializer.is_valid():
            uid = serializer.validated_data['uid']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            try:
                user_id = force_str(urlsafe_base64_decode(uid))
                user = User.objects.get(pk=user_id)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response({
                    "ok": False,
                    "message": "Invalid reset link"
                }, status=status.HTTP_400_BAD_REQUEST)

            if not default_token_generator.check_token(user, token):
                return Response({
                    "ok": False,
                    "message": "Invalid or expired reset link"
                }, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()

            return Response({
                "ok": True,
                "message": "Password has been reset successfully"
            }, status=status.HTTP_200_OK)

        return Response({
            "ok": False,
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)