from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.conf import settings
from attempts.models import Attempt
from .models import UserProfile


class UserUpdateSerializer(serializers.Serializer):
    display_name = serializers.CharField(required=False, allow_blank=False, max_length=150)

    def validate_display_name(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Display name cannot be empty.")
        return cleaned

    def update(self, instance, validated_data):
        display_name = validated_data.get("display_name")
        if display_name is not None:
            display_name = display_name.strip()
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            profile.display_name = display_name
            profile.save(update_fields=["display_name"])
            instance.first_name = display_name
            instance.last_name = ""
            instance.save(update_fields=["first_name", "last_name"])
        return instance

class UserSerializer(serializers.ModelSerializer):
    """
    User serializer with profile information.
    
    Fields:
    - display_name: User's preferred display name (from profile.display_name)
    - name: Alias for display_name
    - username: Login username (returns email)
    - email: User's email address (also used as login username)
    """
    display_name = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()
    attempted_questions = serializers.SerializerMethodField()
    posted_questions = serializers.SerializerMethodField()
    points = serializers.SerializerMethodField()
    ranking = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'display_name',
            'name',
            'student_id',
            'profile_picture_url',
            'attempted_questions',
            'posted_questions',
            'points',
            'ranking',
            'is_staff',
            'is_admin',
            'date_joined',
            'last_login',
        ]

    def get_display_name(self, obj):
        """Get user's display name from profile, fallback to email"""
        profile = getattr(obj, "profile", None)
        if profile and profile.display_name:
            return profile.display_name
        # Fallback to email (which is the login username)
        return obj.email or obj.username or "User"

    def get_name(self, obj):
        """Alias for display_name for backward compatibility"""
        return self.get_display_name(obj)

    def get_username(self, obj):
        """Get username (returns email as that's the login username)"""
        return obj.email or obj.username or "User"

    def get_student_id(self, obj):
        profile = getattr(obj, "profile", None)
        return getattr(profile, "student_id", None)

    def get_profile_picture_url(self, obj):
        profile = getattr(obj, "profile", None)
        if not profile or not profile.profile_picture:
            return None
        request = self.context.get("request")
        url = profile.profile_picture.url
        if getattr(profile, "updated_at", None):
            version = int(profile.updated_at.timestamp())
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}v={version}"
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_attempted_questions(self, obj):
        return Attempt.objects.filter(attempter=obj).count()

    def get_posted_questions(self, obj):
        return obj.questions.count()

    def get_points(self, obj):
        # Placeholder until a scoring system is implemented
        return 0

    def get_ranking(self, obj):
        # Placeholder ranking logic
        return None

    def get_is_admin(self, obj):
        admin_emails = getattr(settings, "ADMIN_EMAILS", set()) or set()
        email = (obj.email or "").strip().lower()
        return email in admin_emails

class UserRegistrationSerializer(serializers.Serializer):
    # Serializer for user registration with secure password handling
    display_name = serializers.CharField(max_length=150, required=True)
    student_id = serializers.CharField(max_length=20, required=True)
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

    def validate_student_id(self, value):
        student_id = value.strip()

        # Check if student ID already exists
        if UserProfile.objects.filter(student_id=student_id).exists():
            raise serializers.ValidationError("Student ID already exists")

        return student_id

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        display_name = validated_data['display_name']
        student_id = validated_data['student_id']

        # Create user with first_name set to prevent signal from using email
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=display_name,  # Set this immediately
            last_name=""
        )

        # Update or create user profile with student_id and display_name
        # Signal handler may have already created profile, so update it
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={"student_id": student_id, "display_name": display_name}
        )

        if not created:
            # Profile was created by signal, update it with correct values
            profile.student_id = student_id
            profile.display_name = display_name
            profile.save(update_fields=["student_id", "display_name"])

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


class ProfilePictureSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserProfile
        fields = ["user", "student_id", "profile_picture", "profile_picture_url", "updated_at"]
        extra_kwargs = {"profile_picture": {"write_only": True, "required": True}}

    def validate_profile_picture(self, file):
        allowed = {"image/jpeg", "image/png", "image/webp"}
        if getattr(file, "content_type", None) not in allowed:
            raise serializers.ValidationError("Unsupported image type")
        max_mb = getattr(settings, "PROFILE_PIC_MAX_MB", 5)
        if file.size > max_mb * 1024 * 1024:
            raise serializers.ValidationError("File too large")
        return file

    def get_profile_picture_url(self, obj):
        request = self.context.get("request")
        if not obj.profile_picture:
            return None
        url = obj.profile_picture.url
        if getattr(obj, "updated_at", None):
            version = int(obj.updated_at.timestamp())
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}v={version}"
        if request:
            return request.build_absolute_uri(url)
        return url

    def update(self, instance, validated_data):
        # Handle old profile picture deletion
        new_picture = validated_data.get("profile_picture", None)
        if new_picture and instance.profile_picture and instance.profile_picture.name:
            try:
                instance.profile_picture.delete(save=False)
            except Exception:
                pass
        return super().update(instance, validated_data)
