from datetime import datetime, timedelta

from django.conf import settings
from django.db import models

from apps.users.choices import AppointmentStatus


class Appointment(models.Model):
    code = models.CharField(max_length=32, unique=True, editable=False)
    patient = models.ForeignKey("patients.PatientProfile", on_delete=models.PROTECT, related_name="appointments")
    doctor = models.ForeignKey("doctors.DoctorProfile", on_delete=models.PROTECT, related_name="appointments")
    specialty = models.ForeignKey("specialties.Specialty", on_delete=models.PROTECT, related_name="appointments")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(
        max_length=16,
        choices=AppointmentStatus.choices,
        default=AppointmentStatus.PENDING.value,
    )
    box = models.CharField(max_length=16, blank=True, default="")
    reason = models.CharField(max_length=500, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "appointments_appointment"
        ordering = ["date", "start_time"]
        indexes = [
            models.Index(fields=["doctor", "date"]),
            models.Index(fields=["patient", "date"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self) -> str:
        return f"{self.code} {self.patient.user.full_name} @ {self.doctor.user.full_name}"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self._next_code()
        if not self.end_time:
            duration = timedelta(minutes=getattr(settings, "CONSULTATION_DURATION_MINUTES", 30))
            self.end_time = (datetime.combine(self.date, self.start_time) + duration).time()
        super().save(*args, **kwargs)

    def _next_code(self) -> str:
        from django.db.models import Max

        last = Appointment.objects.aggregate(max_code=Max("code"))["max_code"]
        seq = 1
        if last and last.startswith("CIT-"):
            try:
                seq = int(last.split("-")[-1]) + 1
            except ValueError:
                seq = 1
        return f"CIT-{self.date.year}-{seq:04d}"


# Registrar modelos clínicos vinculados a Appointment en el registry de Django.
from .clinical_models import (  # noqa: E402, F401
    ConsultationNote,
    Medication,
    Prescription,
)
