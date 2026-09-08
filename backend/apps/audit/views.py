from rest_framework import mixins, viewsets
from rest_framework.response import Response

from apps.users.permissions import IsAdminRole

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Bitácora de auditoría, solo lectura y restringida a admin."""

    queryset = AuditLog.objects.select_related("user").all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminRole]
    http_method_names = ["get", "head", "options"]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        module = request.query_params.get("module")
        if module:
            queryset = queryset.filter(module=module)
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page if page is not None else queryset, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)
