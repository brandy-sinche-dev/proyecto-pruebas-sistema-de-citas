from rest_framework import mixins, viewsets
from rest_framework.response import Response

from apps.users.permissions import IsAdminRole

from .models import AuditLog
from .serializers import AuditLogSerializer
from .services import filter_by_module


class AuditLogViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Bitácora de auditoría, solo lectura y restringida a admin."""

    queryset = AuditLog.objects.select_related("user").all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminRole]
    pagination_class = None
    http_method_names = ["get", "head", "options"]

    def list(self, request, *args, **kwargs):
        queryset = filter_by_module(self.get_queryset(), request.query_params.get("module"))
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page if page is not None else queryset, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)
