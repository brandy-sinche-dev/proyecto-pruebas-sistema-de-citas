from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.permissions import IsStaffRole

from .models import Appointment
from .serializers import AppointmentCreateSerializer, AppointmentSerializer
from .services import AppointmentValidationError, transition


class AppointmentViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    """Citas. Cada rol ve su ámbito; las transiciones pasan por la máquina de estados."""

    queryset = Appointment.objects.select_related("patient__user", "doctor__user", "specialty").all()
    serializer_class = AppointmentSerializer
    pagination_class = None
    http_method_names = ["get", "post", "head", "options"]

    def get_permissions(self):
        if self.action in ("confirm", "cancel", "complete", "no_show"):
            return [IsStaffRole()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == "patient":
                return self.queryset.filter(patient__user=user)
            if user.role == "doctor":
                return self.queryset.filter(doctor__user=user)
        return self.queryset

    def get_serializer_class(self):
        if self.action == "create":
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def perform_create(self, serializer):
        serializer.save()

    def create(self, request, *args, **kwargs):
        from apps.patients.models import PatientProfile

        payload = dict(request.data)
        if request.user.role == "patient":
            profile = PatientProfile.objects.filter(user=request.user).first()
            if profile is None:
                return Response({"detail": "Perfil de paciente no encontrado."}, status=400)
            payload["patientId"] = profile.id
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()
        return Response(AppointmentSerializer(appointment).data, status=201)

    def _perform_transition(self, request, pk, target):
        appointment = self.get_object()
        try:
            transition(appointment, target)
        except AppointmentValidationError as exc:
            return Response({"detail": str(exc)}, status=400)
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        return self._perform_transition(request, pk, "CONFIRMED")

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        return self._perform_transition(request, pk, "CANCELLED")

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        return self._perform_transition(request, pk, "COMPLETED")

    @action(detail=True, methods=["post"])
    def no_show(self, request, pk=None):
        return self._perform_transition(request, pk, "NO_SHOW")
