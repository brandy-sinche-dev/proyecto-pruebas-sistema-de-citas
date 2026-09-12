"""Reglas de negocio de usuarios: actualización del perfil propio."""

from .models import User

PROFILE_FIELDS = ("first_name", "last_name", "email", "phone")


def update_profile(user: User, validated_data: dict) -> User:
    fields = {source: validated_data[source] for source in PROFILE_FIELDS if source in validated_data}
    for field, value in fields.items():
        setattr(user, field, value)
    if fields:
        user.save(update_fields=list(fields))
    return user
