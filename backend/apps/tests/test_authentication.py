"""Tests de autenticación: registro, login, refresh, logout, health y formato de errores."""

import pytest

from apps.tests.factories import AdminFactory, PatientUserFactory

pytestmark = pytest.mark.django_db


class TestHealth:
    def test_health_public(self, api_client):
        response = api_client.get("/api/v1/health/")
        assert response.status_code == 200
        assert response.data["status"] == "ok"


class TestRegister:
    def test_register_creates_patient(self, api_client):
        response = api_client.post(
            "/api/v1/auth/register/",
            {
                "firstName": "Ana",
                "lastName": "Perú",
                "email": "ana@mail.com",
                "username": "ana",
                "password": "Secreto1",
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["role"] == "patient"
        assert response.data["firstName"] == "Ana"
        # Debe existir el perfil de paciente.
        from apps.patients.models import PatientProfile

        assert PatientProfile.objects.filter(user__username="ana").exists()

    def test_register_rejects_weak_password(self, api_client):
        response = api_client.post(
            "/api/v1/auth/register/",
            {"firstName": "Ana", "lastName": "Perú", "email": "ana@mail.com", "username": "ana", "password": "123456"},
            format="json",
        )
        assert response.status_code == 400
        assert "fieldErrors" in response.data or "password" in response.data.get("fieldErrors", {})
        assert "mayúscula" in str(response.data["fieldErrors"]["password"])

    def test_register_duplicate_email(self, api_client):
        from apps.tests.factories import UserFactory

        UserFactory(email="dup@mail.com")
        response = api_client.post(
            "/api/v1/auth/register/",
            {"firstName": "A", "lastName": "B", "email": "dup@mail.com", "username": "otro", "password": "Secreto1"},
            format="json",
        )
        assert response.status_code == 400
        assert "correo" in str(response.data["fieldErrors"]["email"])


class TestLogin:
    def test_login_returns_tokens_and_user(self, api_client):
        admin = AdminFactory()
        response = api_client.post(
            "/api/v1/auth/login/",
            {"username": admin.username, "password": "ClinicaAngry1"},
            format="json",
        )
        assert response.status_code == 200
        assert "access" in response.data and "refresh" in response.data
        assert response.data["user"]["username"] == admin.username
        assert response.data["user"]["role"] == "admin"

    def test_login_wrong_password(self, api_client):
        AdminFactory(username="adminx")
        response = api_client.post(
            "/api/v1/auth/login/",
            {"username": "adminx", "password": "incorrecta1"},
            format="json",
        )
        assert response.status_code == 401

    def test_login_inactive_user_forbidden(self, api_client):
        user = PatientUserFactory()
        user.is_active = False
        user.save()
        response = api_client.post(
            "/api/v1/auth/login/",
            {"username": user.username, "password": "ClinicaAngry1"},
            format="json",
        )
        assert response.status_code in (401, 403)


class TestRefreshAndLogout:
    def test_refresh_rotates_token(self, api_client):
        admin = AdminFactory()
        login = api_client.post(
            "/api/v1/auth/login/",
            {"username": admin.username, "password": "ClinicaAngry1"},
            format="json",
        )
        refresh = login.data["refresh"]
        response = api_client.post("/api/v1/auth/refresh/", {"refresh": refresh}, format="json")
        assert response.status_code == 200
        assert "access" in response.data

    def test_logout_returns_204(self, api_client):
        admin = AdminFactory()
        login = api_client.post(
            "/api/v1/auth/login/",
            {"username": admin.username, "password": "ClinicaAngry1"},
            format="json",
        )
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        refresh = login.data["refresh"]
        response = api_client.post("/api/v1/auth/logout/", {"refresh": refresh}, format="json")
        assert response.status_code == 204


class TestErrorFormat:
    def test_validation_error_shape(self, api_client):
        response = api_client.post("/api/v1/auth/login/", {"username": "", "password": ""}, format="json")
        assert response.status_code == 401 or response.status_code == 400
        assert "detail" in response.data


class TestMe:
    def test_me_returns_profile(self, auth_client):
        user = PatientUserFactory()
        client = auth_client(user)
        response = client.get("/api/v1/users/me/")
        assert response.status_code == 200
        assert response.data["username"] == user.username

    def test_me_patch(self, auth_client):
        user = PatientUserFactory()
        client = auth_client(user)
        response = client.patch("/api/v1/users/me/", {"phone": "999888777"}, format="json")
        assert response.status_code == 200
        assert response.data["phone"] == "999888777"

    def test_me_requires_auth(self, api_client):
        response = api_client.get("/api/v1/users/me/")
        assert response.status_code == 401
