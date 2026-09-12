from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.users.permissions import IsAdminRole, IsStaffRole

from .models import Billing, Insurance
from .serializers import (
    BillingCreateSerializer,
    BillingSerializer,
    BillingUpdateSerializer,
    InsuranceSerializer,
)


class InsuranceViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Aseguradoras/convenios. Lectura para autenticados, escritura para admin."""

    queryset = Insurance.objects.all()
    serializer_class = InsuranceSerializer
    pagination_class = None
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminRole()]
        return [IsAuthenticated()]


class BillingViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Liquidaciones: solo staff (admin, recepción, médico) puede leer y gestionar."""

    queryset = Billing.objects.select_related(
        "appointment__patient__user",
        "appointment__doctor__user",
        "appointment__specialty",
        "insurance",
    ).all()
    pagination_class = None
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    def get_permissions(self):
        return [IsStaffRole()]

    def get_serializer_class(self):
        if self.action == "create":
            return BillingCreateSerializer
        if self.action in ("update", "partial_update"):
            return BillingUpdateSerializer
        return BillingSerializer