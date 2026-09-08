from rest_framework import mixins, viewsets

from apps.users.permissions import IsDoctorRole, IsStaffRole

from .clinical_models import ConsultationNote, Prescription
from .clinical_serializers import ConsultationNoteSerializer, PrescriptionSerializer


class ConsultationNoteViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ConsultationNote.objects.select_related("appointment__patient__user", "appointment__doctor").all()
    http_method_names = ["get", "post", "head", "options"]
    serializer_class = ConsultationNoteSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action == "create":
            return [IsDoctorRole()]
        return [IsStaffRole()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == "doctor":
            return self.queryset.filter(appointment__doctor__user=user)
        return self.queryset


class PrescriptionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Prescription.objects.select_related(
        "appointment__patient__user", "appointment__doctor"
    ).prefetch_related("medications")
    http_method_names = ["get", "post", "head", "options"]
    serializer_class = PrescriptionSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action == "create":
            return [IsDoctorRole()]
        return [IsStaffRole()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == "doctor":
            return self.queryset.filter(appointment__doctor__user=user)
        return self.queryset
