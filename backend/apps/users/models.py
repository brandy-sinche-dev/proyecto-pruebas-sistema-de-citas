"""Modelo de usuario con roles por dominio."""

from django.contrib.auth.models import AbstractUser
from django.db import models

from .choices import Role


class User(AbstractUser):
    ROLES = [(role.value, role.label) for role in Role]

    role = models.CharField(max_length=32, choices=ROLES, default=Role.PATIENT)
    phone = models.CharField(max_length=32, blank=True, default="")

    class Meta:
        db_table = "users_user"
        constraints = [
            models.CheckConstraint(
                check=models.Q(role__in=[role.value for role in Role]),
                name="users_user_role_valid",
            )
        ]

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip() or self.username

    def __str__(self) -> str:
        return self.username
