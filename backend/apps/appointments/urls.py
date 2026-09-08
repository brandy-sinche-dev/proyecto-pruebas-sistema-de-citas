from django.urls import path
from rest_framework.routers import DefaultRouter

from .clinical_views import ConsultationNoteViewSet, PrescriptionViewSet
from .dashboard import DashboardView
from .views import AppointmentViewSet

router = DefaultRouter()
router.register("appointments", AppointmentViewSet, basename="appointments")
router.register("consultation-notes", ConsultationNoteViewSet, basename="consultationnotes")
router.register("prescriptions", PrescriptionViewSet, basename="prescriptions")

urlpatterns = [
    path("dashboard/summary/", DashboardView.as_view(), name="dashboard-summary"),
    *router.urls,
]
