from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.conf import settings

class UserSerializer(serializers.ModelSerializer):
    # User serializer which excludes password field for security
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'is_staff', 'date_joined', 'last_login']

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

class UserRegistrationSerializer(serializers.Serializer):
    # Serializer for user registration with secure password handling
    name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate_email(self, value):
        email = value.strip().lower()

        # Check email domain restrictions
        domain = email.split("@")[-1] if "@" in email else ""
        allowed = getattr(settings, "ALLOWED_EMAIL_DOMAINS", set()) or set()
        if allowed and domain not in allowed:
            allowed_domains = ", ".join(settings.ALLOWED_EMAIL_DOMAINS)
            raise serializers.ValidationError(f"Email must be from allowed domains: {allowed_domains}")

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("User with this email already exists")

        return email

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        name = validated_data['name']

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )

        # Set first and last name
        name_parts = name.split(" ", 1)
        user.first_name = name_parts[0]
        if len(name_parts) > 1:
            user.last_name = name_parts[1]
        user.save()

        return user

class UserLoginSerializer(serializers.Serializer):
    # Serializer for user login
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate_email(self, value):
        return value.strip().lower()

class PasswordResetRequestSerializer(serializers.Serializer):
    # Serializer for password reset request
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        return value.strip().lower()

class PasswordResetConfirmSerializer(serializers.Serializer):
    # Serializer for password reset confirmation
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

class CSRFTokenSerializer(serializers.Serializer):
    # Serializer for CSRF token response
    csrfToken = serializers.CharField(read_only=True)