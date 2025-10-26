from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.middleware.csrf import get_token, rotate_token
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .serializers import ProfilePictureSerializer, UserUpdateSerializer
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    CSRFTokenSerializer
)


def csrf_response(request, payload=None, status_code=status.HTTP_200_OK):
    """
    Helper to issue a Response that always includes a fresh CSRF token payload
    and guarantees the CSRF cookie is refreshed by the middleware.
    """
    data = {"csrfToken": get_token(request)}
    if payload:
        data.update(payload)
    return Response(data, status=status_code)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFTokenView(APIView):
    """Get CSRF token for frontend authentication"""
    permission_classes = [AllowAny]

    def get(self, request):
        return csrf_response(request, status_code=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class RegisterView(APIView):
    """User registration endpoint"""
    permission_classes = [AllowAny]

    def post(self, request):
        incoming_data = request.data.copy()
        if "display_name" not in incoming_data and incoming_data.get("name"):
            incoming_data["display_name"] = incoming_data.get("name")
        serializer = UserRegistrationSerializer(data=incoming_data)

        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            rotate_token(request)

            # Refresh user from database with related profile
            user = User.objects.select_related('profile').get(pk=user.pk)
            user_serializer = UserSerializer(user, context={"request": request})
            return csrf_response(
                request,
                {
                    "ok": True,
                    "message": "Registration successful",
                    "user": user_serializer.data
                },
                status.HTTP_201_CREATED
            )

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
                rotate_token(request)

                # Refresh user from database with related profile
                user = User.objects.select_related('profile').get(pk=user.pk)
                user_serializer = UserSerializer(user, context={"request": request})
                return csrf_response(
                    request,
                    {
                        "ok": True,
                        "message": "Login successful",
                        "user": user_serializer.data
                    },
                    status.HTTP_200_OK
                )
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
        rotate_token(request)
        response = csrf_response(
            request,
            {"ok": True, "message": "Logout successful"},
            status.HTTP_200_OK
        )
        response.delete_cookie(
            settings.SESSION_COOKIE_NAME,
            path=getattr(settings, "SESSION_COOKIE_PATH", "/"),
            domain=getattr(settings, "SESSION_COOKIE_DOMAIN", None),
            samesite=getattr(settings, "SESSION_COOKIE_SAMESITE", "Lax"),
        )
        return response
   
class MeView(APIView):
    """Get current user information"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch user with related profile to avoid N+1 queries
        user = User.objects.select_related('profile').get(pk=request.user.pk)
        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserUpdateSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            serializer.update(request.user, serializer.validated_data)
            # Refresh user from database with related profile
            user = User.objects.select_related('profile').get(pk=request.user.pk)
            refreshed = UserSerializer(user, context={"request": request})
            return Response(refreshed.data, status=status.HTTP_200_OK)
        return Response(
            {
                "ok": False,
                "message": "Invalid data",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


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

                frontend_origin = getattr(settings, "FRONTEND_ORIGIN", None) or "http://localhost:5173"
                reset_url = f"{frontend_origin.rstrip('/')}/password-reset-confirm?uid={uid}&token={token}"

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


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # Fetch user with related profile to avoid N+1 queries
        user = get_object_or_404(User.objects.select_related('profile'), pk=user_id)
        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class MeProfilePictureView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = ProfilePictureSerializer

    def get_object(self):
        return self.request.user.profile
