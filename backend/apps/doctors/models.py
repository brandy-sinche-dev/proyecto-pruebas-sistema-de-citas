from django.conf import settings
from django.db import models

from apps.specialties.models import Specialty


class DoctorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="doctor_profile")
    specialty = models.ForeignKey(Specialty, on_delete=models.PROTECT, related_name="doctors")
    license_number = models.CharField(max_length=64, unique=True)
    box = models.CharField(max_length=16, blank=True, default="")
    available = models.BooleanField(default=True)

    class Meta:
        db_table = "doctors_doctorprofile"
        ordering = ["user__first_name", "user__last_name"]

    def __str__(self) -> str:
        return f"Dr(a). {self.user.full_name} — {self.specialty.name}"
