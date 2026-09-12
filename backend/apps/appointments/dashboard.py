from rest_framework import views
from rest_framework.response import Response

from apps.users.permissions import IsStaffRole

from .serializers import AppointmentSerializer
from .services import dashboard_stats


class DashboardView(views.APIView):
    permission_classes = [IsStaffRole]

    def get(self, request, **kwargs):
        def _ser(items):
            return AppointmentSerializer(items, many=True, context={"request": request}).data

        return Response(dashboard_stats(_ser))
