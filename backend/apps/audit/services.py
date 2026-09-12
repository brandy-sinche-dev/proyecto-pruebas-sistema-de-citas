"""Reglas de negocio de auditoría: filtrado de la bitácora."""

from django.db.models import QuerySet


def filter_by_module(queryset: QuerySet, module: str | None) -> QuerySet:
    if module:
        return queryset.filter(module=module)
    return queryset
