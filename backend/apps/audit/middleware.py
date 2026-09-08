"""Middleware de auditoría: registra peticiones de escritura al API de /api/v1/."""

AUDIT_SKIP_PATHS = ("/schema/", "/docs/", "/health/", "/auth/")


class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        self._log(request, response)
        return response

    def _log(self, request, response) -> None:
        from django.conf import settings

        if not getattr(settings, "AUDIT_ENABLED", True):
            return
        path = request.path
        if not path.startswith("/api/v1/") or any(skip in path for skip in AUDIT_SKIP_PATHS):
            return
        if request.method == "GET":
            return  # solo acciones de escritura

        user = getattr(request, "user", None)
        if user is None or (hasattr(user, "is_anonymous") and user.is_anonymous):
            return

        from .models import AuditLog

        try:
            user_id = user.id
        except AttributeError:
            user_id = None

        module = path.split("/api/v1/", 1)[-1].split("/", 1)[0] or "root"
        role = getattr(user, "role", None)
        AuditLog.objects.create(
            user_id=user_id,
            action=f"{request.method}",
            module=module,
            method=request.method,
            path=path,
            status_code=response.status_code,
            metadata={"role": role} if role else {},
        )
