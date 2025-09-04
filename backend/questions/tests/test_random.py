from django.test import TestCase
import pytest

# Create your tests here.
@pytest.mark.django_db
def test_random(client):
    resp = client.get("/questions/hello/")
    assert resp.status_code in (200, 302)