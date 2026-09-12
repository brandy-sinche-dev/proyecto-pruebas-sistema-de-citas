from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.users.permissions import IsDoctorRole

from .clinical_models import ClinicalExam, ConsultationNote, Prescription
from .clinical_serializers import ClinicalExamSerializer, ConsultationNoteSerializer, PrescriptionSerializer


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
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return self.queryset.none()
        if user.role == "doctor":
            return self.queryset.filter(appointment__doctor__user=user)
        if user.role == "patient":
            return self.queryset.filter(appointment__patient__user=user)
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
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return self.queryset.none()
        if user.role == "doctor":
            return self.queryset.filter(appointment__doctor__user=user)
        if user.role == "patient":
            return self.queryset.filter(appointment__patient__user=user)
        return self.queryset


class ClinicalExamViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ClinicalExam.objects.select_related(
        "appointment__patient__user", "appointment__doctor"
    ).all()
    http_method_names = ["get", "post", "head", "options"]
    serializer_class = ClinicalExamSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action == "create":
            return [IsDoctorRole()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return self.queryset.none()
        if user.role == "doctor":
            return self.queryset.filter(appointment__doctor__user=user)
        if user.role == "patient":
            return self.queryset.filter(appointment__patient__user=user)
        return self.queryset