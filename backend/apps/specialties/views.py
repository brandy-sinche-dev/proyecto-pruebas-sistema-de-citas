from rest_framework import mixins, viewsets

from apps.users.permissions import IsAdminRole

from .models import Specialty
from .serializers import SpecialtySerializer


class SpecialtyViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Especialidades: lectura para cualquier usuario autenticado, escritura para admin."""

    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    pagination_class = None
    http_method_names = ["get", "post", "head", "options"]

    def get_permissions(self):
        if self.action == "create":
            return [IsAdminRole()]
        return []
