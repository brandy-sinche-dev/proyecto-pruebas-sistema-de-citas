from django.shortcuts import get_object_or_404
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.permissions import IsAdminRole, IsStaffRole

from .models import PatientProfile
from .serializers import PatientCreateSerializer, PatientSerializer


class PatientViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """CRUD de pacientes. El rol paciente solo accede a su propio perfil."""

    queryset = PatientProfile.objects.select_related("user").all()
    serializer_class = PatientSerializer
    pagination_class = None
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.action == "me":
            return [IsAuthenticated()]
        if self.action in ("list", "create", "update", "partial_update"):
            return [IsStaffRole()]
        if self.action == "destroy":
            return [IsAdminRole()]
        return []

    @action(detail=False, methods=["get"])
    def me(self, request, *args, **kwargs):
        """Perfil del paciente autenticado."""
        profile = get_object_or_404(self.queryset, user=request.user)
        return Response(PatientSerializer(profile).data)

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == "patient":
            return self.queryset.filter(user=user)
        return self.queryset

    def get_serializer_class(self):
        if self.action == "create":
            return PatientCreateSerializer
        return PatientSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return Response(PatientSerializer(profile).data, status=201)
