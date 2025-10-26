import pytest
import uuid
from django.urls import reverse
from django.contrib.auth.models import User
from django.conf import settings
from rest_framework.test import APIClient
from rest_framework import status


def _pick_allowed_email() -> str:
    """Create a test email from allowed domains"""
    domains = getattr(settings, "ALLOWED_EMAIL_DOMAINS", {"example.com"})
    domain = list(domains)[0] if domains else "example.com"
    return f"test-{uuid.uuid4().hex[:8]}@{domain}"


@pytest.mark.django_db
def test_get_csrf_token_success():
    """Test successful CSRF token retrieval"""
    client = APIClient()
    url = reverse("user:get_csrf_token")
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert "csrfToken" in data
    assert data["csrfToken"] is not None


@pytest.mark.django_db
def test_get_csrf_token_multiple_calls():
    """Test multiple CSRF token requests"""
    client = APIClient()
    url = reverse("user:get_csrf_token")

    response1 = client.get(url)
    response2 = client.get(url)

    assert response1.status_code == 200
    assert response2.status_code == 200

    token1 = response1.json()["csrfToken"]
    token2 = response2.json()["csrfToken"]
    assert token1 is not None
    assert token2 is not None


@pytest.mark.django_db
def test_register_success():
    """Test successful user registration"""
    client = APIClient()
    email = _pick_allowed_email()

    payload = {
        "name": "Test User",
        "student_id": "TEST123456",
        "email": email,
        "password": "StrongPass123!"
    }

    url = reverse("user:register")
    response = client.post(url, payload, format="json")

    assert response.status_code == 201
    data = response.json()
    assert data["ok"] is True
    assert data["message"] == "Registration successful"
    assert data["user"]["email"] == email
    assert data["user"]["student_id"] == "TEST123456"

    assert User.objects.filter(email=email).exists()


@pytest.mark.django_db
def test_register_invalid_email():
    client = APIClient()

    payload = {
        "name": "Test User",
        "student_id": "INVALID123",
        "email": "test@invalid-domain.com",
        "password": "StrongPass123!"
    }

    url = reverse("user:register")
    response = client.post(url, payload, format="json")

    assert response.status_code == 400
    data = response.json()
    assert data["ok"] is False
    assert "errors" in data


@pytest.mark.django_db
def test_login_success():
    """Test successful user login"""
    client = APIClient()
    email = _pick_allowed_email()
    password = "TestPass123!"

    # Create user
    User.objects.create_user(username=email, email=email, password=password)

    payload = {
        "email": email,
        "password": password
    }

    url = reverse("user:login")
    response = client.post(url, payload, format="json")

    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["message"] == "Login successful"
    assert data["user"]["email"] == email


@pytest.mark.django_db
def test_login_invalid_credentials():
    """Test login with invalid credentials"""
    client = APIClient()
    email = _pick_allowed_email()

    # Create user with different password
    User.objects.create_user(username=email, email=email, password="RealPass123!")

    payload = {
        "email": email,
        "password": "WrongPass123!"
    }

    url = reverse("user:login")
    response = client.post(url, payload, format="json")

    assert response.status_code == 401
    data = response.json()
    assert data["ok"] is False
    assert data["message"] == "Invalid email or password"


@pytest.mark.django_db
def test_logout_success():
    """Test successful user logout"""
    client = APIClient()
    email = _pick_allowed_email()
    user = User.objects.create_user(username=email, email=email, password="TestPass123!")

    # Login user first
    client.force_authenticate(user=user)

    url = reverse("user:logout")
    response = client.post(url, {}, format="json")

    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["message"] == "Logout successful"


@pytest.mark.django_db
def test_logout_without_login():
    """Test logout when not logged in"""
    client = APIClient()

    url = reverse("user:logout")
    response = client.post(url, {}, format="json")

    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["message"] == "Logout successful"


@pytest.mark.django_db
def test_me_authenticated():
    """Test /me/ endpoint with authenticated user"""
    client = APIClient()
    email = _pick_allowed_email()
    user = User.objects.create_user(
        username=email,
        email=email,
        first_name="Test",
        last_name="User",
        password="TestPass123!"
    )

    client.force_authenticate(user=user)

    url = reverse("user:me")
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert data["name"] == "Test"


@pytest.mark.django_db
def test_me_unauthenticated():
    """Test /me/ endpoint without authentication"""
    client = APIClient()

    url = reverse("user:me")
    response = client.get(url)

    assert response.status_code in [401, 403]  # Both are acceptable for unauthenticated


@pytest.mark.django_db
def test_password_reset_request_existing_user():
    """Test password reset request for existing user"""
    client = APIClient()
    email = _pick_allowed_email()
    User.objects.create_user(username=email, email=email, password="OldPass123!")

    payload = {"email": email}

    url = reverse("user:password_reset_request")
    response = client.post(url, payload, format="json")

    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "reset link has been sent" in data["message"]


@pytest.mark.django_db
def test_password_reset_request_nonexistent_user():
    """Test password reset request for non-existent user"""
    client = APIClient()

    payload = {"email": "nonexistent@example.com"}

    url = reverse("user:password_reset_request")
    response = client.post(url, payload, format="json")

    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "reset link has been sent" in data["message"]
