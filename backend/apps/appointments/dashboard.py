from django.utils import timezone
from rest_framework import views
from rest_framework.response import Response

from apps.users.choices import AppointmentStatus
from apps.users.permissions import IsStaffRole

from .models import Appointment
from .serializers import AppointmentSerializer

PRICE_PER_APPOINTMENT = 80


class DashboardView(views.APIView):
    permission_classes = [IsStaffRole]

    def get(self, request, **kwargs):
        today = timezone.localdate()
        qs = Appointment.objects.select_related("patient__user", "doctor__user", "specialty")
        total = qs.count()
        finished = qs.filter(status=AppointmentStatus.COMPLETED.value)
        cancelled = qs.filter(status=AppointmentStatus.CANCELLED.value)
        no_show = qs.filter(status=AppointmentStatus.NO_SHOW.value).count()
        attended = finished.count()

        def _ser(items):
            return AppointmentSerializer(items, many=True, context={"request": request}).data

        next_appointments = qs.filter(
            status__in=[AppointmentStatus.CONFIRMED.value, AppointmentStatus.PENDING.value], date__gte=today
        ).order_by("date", "start_time")[:5]
        today_appointments = qs.filter(date=today).order_by("start_time")

        return Response(
            {
                "totalAppointments": total,
                "attendanceRate": round(attended / total * 100, 1) if total else 0.0,
                "occupancyRate": round((total - cancelled.count()) / total * 100, 1) if total else 0.0,
                "noShowRate": round(no_show / total * 100, 1) if total else 0.0,
                "pendingCount": today_appointments.filter(status=AppointmentStatus.PENDING.value).count(),
                "confirmedCount": today_appointments.filter(status=AppointmentStatus.CONFIRMED.value).count(),
                "inConsultationCount": today_appointments.filter(status=AppointmentStatus.CONFIRMED.value).count(),
                "revenue": attended * PRICE_PER_APPOINTMENT,
                "nextAppointments": _ser(next_appointments),
                "recentAppointments": _ser(qs.order_by("-created_at")[:5]),
                "appointmentsToday": _ser(today_appointments),
            }
        )
