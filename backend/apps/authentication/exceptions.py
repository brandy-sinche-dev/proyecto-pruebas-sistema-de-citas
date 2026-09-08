"""Manejo uniforme de errores HTTP."""

from rest_framework.views import exception_handler as drf_exception_handler


def api_exception_handler(exc, context):
    """Devuelve errores JSON consistentes: {"detail": ..., "fieldErrors": {...}}."""
    response = drf_exception_handler(exc, context)
    if response is None:
        return response

    data = response.data
    if isinstance(data, dict) and "detail" not in data and "fieldErrors" not in data:
        field_errors = {}
        for field, errors in data.items():
            field_errors[field] = [str(e) for e in errors] if isinstance(errors, (list, tuple)) else [str(errors)]
        response.data = {"detail": "Datos inválidos", "fieldErrors": field_errors}
    return response
