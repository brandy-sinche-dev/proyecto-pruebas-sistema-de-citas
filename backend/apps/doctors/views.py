from datetime import date

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.schedules.models import Availability
from apps.users.permissions import IsAdminRole, IsStaffRole

from .models import DoctorProfile
from .serializers import DoctorSerializer, DoctorWriteSerializer


class DoctorViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Médicos. Lectura para staff, escritura restringida a admin."""

    queryset = DoctorProfile.objects.select_related("user", "specialty").prefetch_related("availability").all()
    serializer_class = DoctorSerializer
    pagination_class = None
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminRole()]
        if self.action == "availability":
            return [IsStaffRole()]
        if self.action in ("list", "retrieve"):
            return [IsStaffRole()]
        return []

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return DoctorWriteSerializer
        return DoctorSerializer

    @action(detail=True, methods=["get"])
    def availability(self, request, pk=None):
        doctor = self.get_object()
        slots = Availability.objects.filter(doctor=doctor, date__gte=date.today()).order_by("date", "start_time")
        data = [
            {
                "id": s.id,
                "doctorId": s.doctor_id,
                "date": s.date.isoformat(),
                "startTime": s.start_time.strftime("%H:%M"),
                "endTime": s.end_time.strftime("%H:%M"),
                "status": s.status,
                "box": s.box,
            }
            for s in slots
        ]
        return Response(data)
