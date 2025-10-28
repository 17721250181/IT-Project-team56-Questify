from django.conf import settings
from rest_framework.permissions import BasePermission


def _normalize_admin_emails():
    """Return a lower-cased set of configured admin emails."""
    emails = getattr(settings, "ADMIN_EMAILS", set())
    if isinstance(emails, str):
        emails = {chunk.strip() for chunk in emails.split(",")}
    return {email.strip().lower() for email in emails if email and email.strip()}


class IsAdminEmail(BasePermission):
    """
    Allow access only to authenticated users whose email address appears in
    the configured ADMIN_EMAILS list.
    """

    message = "You do not have permission to access the admin panel."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        email = (request.user.email or "").strip().lower()
        if not email:
            return False

        return email in _normalize_admin_emails()
