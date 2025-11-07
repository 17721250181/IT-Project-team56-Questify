"""
Password Reset with Email Verification Code System
Provides secure password reset functionality using time-limited verification codes
"""
import random
import string
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from .models import PasswordResetCode


def generate_verification_code(length=6):
    """
    Generate a random numeric verification code
    
    Args:
        length (int): Length of the verification code (default: 6)
    
    Returns:
        str: Random numeric code
    """
    return ''.join(random.choices(string.digits, k=length))


def send_verification_email(email, code):
    """
    Send verification code email to user
    
    Args:
        email (str): User's email address
        code (str): Verification code to send
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    subject = 'Questify - Password Reset Verification Code'
    message = f"""
Hello,

You have requested to reset your password for Questify.

Your verification code is: {code}

This code will expire in 10 minutes.

If you did not request this password reset, please ignore this email.

Best regards,
The Questify Team
    """.strip()
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        if settings.DEBUG:
            print(f"Failed to send email: {e}")
        return False


def create_reset_code(email):
    """
    Create or update a password reset code for the given email
    
    Args:
        email (str): User's email address
    
    Returns:
        tuple: (PasswordResetCode object or None, error message or None)
    """
    try:
        # Check if user exists
        user = User.objects.get(email=email.lower())
    except User.DoesNotExist:
        # For security, don't reveal if email exists or not
        # Return success but don't actually create code
        return None, None
    
    # Generate new code
    code = generate_verification_code(6)
    expires_at = timezone.now() + timedelta(minutes=10)
    
    # Delete any existing codes for this email
    PasswordResetCode.objects.filter(email=email.lower()).delete()
    
    # Create new code
    reset_code = PasswordResetCode.objects.create(
        email=email.lower(),
        code=code,
        expires_at=expires_at
    )
    
    # Send email
    email_sent = send_verification_email(email, code)
    
    if not email_sent:
        return None, "Failed to send verification email. Please try again."
    
    return reset_code, None


def verify_reset_code(email, code):
    """
    Verify if the provided code is valid for the given email
    
    Args:
        email (str): User's email address
        code (str): Verification code to verify
    
    Returns:
        tuple: (bool is_valid, str error_message or None)
    """
    try:
        reset_code = PasswordResetCode.objects.get(
            email=email.lower(),
            code=code.strip()
        )
    except PasswordResetCode.DoesNotExist:
        return False, "Invalid verification code"
    
    # Check if code has expired
    if reset_code.is_expired():
        reset_code.delete()
        return False, "Verification code has expired"
    
    # Check if code has been used
    if reset_code.is_used:
        return False, "Verification code has already been used"
    
    return True, None


def reset_password_with_code(email, code, new_password):
    """
    Reset user's password using verification code
    
    Args:
        email (str): User's email address
        code (str): Verification code
        new_password (str): New password to set
    
    Returns:
        tuple: (bool success, str error_message or None)
    """
    # Verify the code first
    is_valid, error = verify_reset_code(email, code)
    if not is_valid:
        return False, error
    
    try:
        # Get the user
        user = User.objects.get(email=email.lower())
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        # Mark code as used and delete it
        PasswordResetCode.objects.filter(
            email=email.lower(),
            code=code.strip()
        ).update(is_used=True)
        
        # Clean up: delete the used code
        PasswordResetCode.objects.filter(email=email.lower()).delete()
        
        return True, None
        
    except User.DoesNotExist:
        return False, "User not found"
    except Exception as e:
        if settings.DEBUG:
            print(f"Password reset failed: {e}")
        return False, "Failed to reset password. Please try again."


def cleanup_expired_codes():
    """
    Clean up expired verification codes from database
    Should be run periodically (e.g., via cron job)
    
    Returns:
        int: Number of codes deleted
    """
    expired = PasswordResetCode.objects.filter(expires_at__lt=timezone.now())
    count = expired.count()
    expired.delete()
    return count
