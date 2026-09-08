import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client():
    """Cliente autenticado como el usuario dado vía JWT."""

    def _factory(user):
        client = APIClient()
        response = client.post(
            "/api/v1/auth/login/",
            {"username": user.username, "password": "ClinicaAngry1"},
            format="json",
        )
        assert response.status_code == 200, response.data
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        return client

    return _factory
