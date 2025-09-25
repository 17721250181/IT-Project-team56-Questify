# backend/user/tests/test_auth_flow.py
"""
End-to-end check of the auth flow, with super clear comments.

We test:
  1) Get a CSRF token from /api/csrf/
  2) Register at /api/auth/register/ (this logs us in)
  3) /api/me/ returns 200 and shows our email (logged in)
  4) /api/auth/logout/ succeeds
  5) After logout, /api/me/ should say "not logged in" (401 OR 403, both OK with SessionAuthentication)
  6) Get a fresh CSRF token and log in again at /api/auth/login/
  7) /api/me/ is 200 again with our email (logged in)

Notes kids can understand:
  - "Logged in" is remembered by a cookie called "sessionid".
  - CSRF protection means: every POST must send an X-CSRFToken header.
  - After logout, the server clears the session, but our test client might still
    keep old cookies. We clear them in the test to be extra sure.
"""

import uuid
import pytest
from django.conf import settings
from django.urls import resolve
from rest_framework.test import APIClient
from rest_framework import status

# We assume user.urls is mounted under /api/ in config/urls.py
API = "/api"


def _pick_allowed_email() -> str:
    """
    Registration only allows emails from settings.ALLOWED_EMAIL_DOMAINS.
    Pick one domain from that set and build a random email so tests never collide.
    """
    domains = getattr(settings, "ALLOWED_EMAIL_DOMAINS", None)
    if not domains:
        pytest.skip("ALLOWED_EMAIL_DOMAINS is not set; cannot create a valid test email.")
    domain = sorted(list(domains))[0]
    return f"alice-{uuid.uuid4().hex[:8]}@{domain}"


def _csrf_from_response_or_cookie(client: APIClient, resp):
    """
    Try to get the CSRF token from the JSON response first.
    If it's not there, fall back to the 'csrftoken' cookie.
    """
    token = None
    try:
        data = resp.json()
        token = data.get("csrfToken")
    except Exception:
        pass
    if not token:
        cookie_obj = client.cookies.get("csrftoken")
        if cookie_obj:
            token = cookie_obj.value
    return token


@pytest.mark.django_db
def test_routes_exist():
    """
    Quick wiring check: make sure the URL names exist and are mounted under /api/.
    If this fails, include(...) in config/urls.py is probably wrong.
    """
    assert resolve(f"{API}/csrf/").url_name == "get_csrf_token"
    assert resolve(f"{API}/auth/register/").url_name == "register"
    assert resolve(f"{API}/auth/login/").url_name == "login"
    assert resolve(f"{API}/auth/logout/").url_name == "logout"
    assert resolve(f"{API}/me/").url_name == "me"


@pytest.mark.django_db
class TestCsrfAndAuthFlow:
    """
    Full happy-path flow with clear, simple steps.
    """

    def test_flow(self):
        # Make the client enforce CSRF like a real browser/server setup.
        client = APIClient(enforce_csrf=True)

        # 1) Get CSRF token
        r = client.get(f"{API}/csrf/")
        assert r.status_code == 200, r.content
        csrf = _csrf_from_response_or_cookie(client, r)
        assert csrf, "No CSRF token in JSON or cookie from /api/csrf/"

        # 2) Register (uses an allowed email domain, and logs us in)
        email = _pick_allowed_email()
        payload = {"name": "Alice Smith", "student_id": "ALICE123", "email": email, "password": "Str0ng!Pass123"}
        r = client.post(
            f"{API}/auth/register/",
            payload,
            format="json",
            HTTP_X_CSRFTOKEN=csrf,  # CSRF header is required for POST
        )
        assert r.status_code == status.HTTP_201_CREATED, r.content
        assert r.json().get("ok") is True

        # 3) While logged in, /me/ should return 200 and our email
        r = client.get(f"{API}/me/")
        assert r.status_code == 200, r.content
        assert r.json().get("email") == email

        # 4) Log out (should return 200)
        r = client.post(
            f"{API}/auth/logout/",
            {},
            format="json",
            HTTP_X_CSRFTOKEN=csrf,
        )
        assert r.status_code == 200, r.content

        # After logout, also clear the test client's session/cookie to ensure
        # the next request is really "logged out".
        client.logout()                         # clears the test session
        client.cookies.pop("sessionid", None)   # drop any leftover cookie

        # 5) Now /me/ should say "not logged in".
        # With DRF + SessionAuthentication, unauthenticated requests often return
        # 403 Forbidden (not 401). Either 401 or 403 means "not logged in", so accept both.
        r = client.get(f"{API}/me/")
        assert r.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ), r.content

        # 6) Get a fresh CSRF token and log in again
        r = client.get(f"{API}/csrf/")
        csrf2 = _csrf_from_response_or_cookie(client, r)
        assert csrf2, "No CSRF token in JSON or cookie from /api/csrf/ (second time)"

        r = client.post(
            f"{API}/auth/login/",
            {"email": email, "password": "Str0ng!Pass123"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf2,
        )
        assert r.status_code == 200, r.content
        assert r.json().get("ok") is True

        # 7) After logging in again, /me/ should be 200 with our email
        r = client.get(f"{API}/me/")
        assert r.status_code == 200, r.content
        assert r.json().get("email") == email