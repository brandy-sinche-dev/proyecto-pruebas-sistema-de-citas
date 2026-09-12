from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.users.permissions import IsAdminRole

from .models import Box
from .serializers import BoxSerializer


class BoxViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Consultorios/boxes clínicos. Lectura para cualquier usuario autenticado, escritura para admin."""

    queryset = Box.objects.select_related("doctor__user").all()
    serializer_class = BoxSerializer
    pagination_class = None
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminRole()]
        return [IsAuthenticated()]