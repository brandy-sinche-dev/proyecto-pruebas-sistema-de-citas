from rest_framework import mixins, viewsets

from apps.users.permissions import IsAdminRole, IsStaffRole

from .models import Availability
from .serializers import AvailabilityCreateSerializer, AvailabilitySerializer


class AvailabilityViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Disponibilidad de médicos. Lectura para staff; escritura admin (y doctor sobre sí mismo)."""

    queryset = Availability.objects.select_related("doctor__user", "doctor__specialty").all()
    serializer_class = AvailabilitySerializer
    pagination_class = None
    http_method_names = ["get", "post", "patch", "put", "delete", "head", "options"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminRole()]
        if self.action == "list":
            return [IsStaffRole()]
        return []

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == "doctor":
            return self.queryset.filter(doctor__user=user)
        return self.queryset

    def get_serializer_class(self):
        if self.action == "create":
            return AvailabilityCreateSerializer
        return AvailabilitySerializer
