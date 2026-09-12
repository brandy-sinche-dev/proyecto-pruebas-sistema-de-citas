"""Reglas de negocio de especialidades: creación."""

from .models import Specialty


def create_specialty(
    *, name: str, description: str = "", color: str = "", icon: str = "", fee=0
) -> Specialty:
    return Specialty.objects.create(name=name, description=description, color=color, icon=icon, fee=fee)
