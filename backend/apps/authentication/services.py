"""Reglas de negocio de autenticación: registro, contraseña, bloqueo de tokens y healthcheck."""

import re

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

from apps.patients.models import PatientProfile
from apps.users.choices import Role

from .models import BlacklistedToken

User = get_user_model()


class PasswordValidationError(ValueError):
    pass


def email_taken(email: str) -> bool:
    return User.objects.filter(email__iexact=email).exists()


def username_taken(username: str) -> bool:
    return User.objects.filter(username__iexact=username).exists()


def validate_password_strength(password: str) -> None:
    if not re.search(r"[A-Z]", password):
        raise PasswordValidationError("Debe incluir una letra mayúscula.")
    if not re.search(r"[0-9]", password):
        raise PasswordValidationError("Debe incluir un número.")


def create_patient_user(
    *,
    username: str,
    email: str,
    first_name: str,
    last_name: str,
    password: str,
) -> AbstractUser:
    user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=Role.PATIENT.value,
        is_active=True,
    )
    user.set_password(password)
    user.save()
    return user


def create_patient_account(data: dict) -> AbstractUser:
    user = create_patient_user(**data)
    PatientProfile.objects.create(user=user)
    return user


def blacklist_refresh_token(refresh_token: str) -> None:
    if not refresh_token:
        return
    from rest_framework_simplejwt.tokens import RefreshToken

    try:
        token = RefreshToken(refresh_token)
        BlacklistedToken.objects.create(
            token=str(token),
            expires_at=timezone.now() + timezone.timedelta(days=7),
        )
    except Exception:
        pass


def database_is_healthy() -> bool:
    from django.db import connection

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return True
    except Exception:
        return False
