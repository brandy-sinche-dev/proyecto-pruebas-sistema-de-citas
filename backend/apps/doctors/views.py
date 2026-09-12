from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.permissions import IsAdminRole, IsStaffRole

from .models import DoctorProfile
from .serializers import DoctorSerializer, DoctorWriteSerializer
from .services import full_availability


class DoctorViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Médicos. Lectura para cualquier usuario autenticado, escritura restringida a admin."""

    queryset = DoctorProfile.objects.select_related("user", "specialty").prefetch_related("availability").all()
    serializer_class = DoctorSerializer
    pagination_class = None
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminRole()]
        if self.action == "availability":
            return [IsStaffRole()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return DoctorWriteSerializer
        return DoctorSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return Response(DoctorSerializer(profile).data, status=201)

    @action(detail=True, methods=["get"])
    def availability(self, request, pk=None):
        doctor = self.get_object()
        return Response(full_availability(doctor))
