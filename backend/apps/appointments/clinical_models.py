from django.db import models


class Medication(models.Model):
    name = models.CharField(max_length=120)
    dosage = models.CharField(max_length=64, blank=True, default="")
    frequency = models.CharField(max_length=64, blank=True, default="")
    duration = models.CharField(max_length=64, blank=True, default="")

    class Meta:
        db_table = "appointments_medication"

    def __str__(self) -> str:
        return self.name


class Prescription(models.Model):
    code = models.CharField(max_length=32, unique=True, editable=False, blank=True)
    appointment = models.ForeignKey("appointments.Appointment", on_delete=models.PROTECT, related_name="prescriptions")
    medications = models.ManyToManyField(Medication, related_name="prescriptions", blank=True)
    instructions = models.TextField(blank=True, default="")
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "appointments_prescription"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.code

    def save(self, *args, **kwargs):
        if not self.code:
            year = self.appointment.date.year
            self.code = f"RX-{year}-{Prescription.objects.filter(appointment__date__year=year).count() + 1:04d}"
        super().save(*args, **kwargs)


class ConsultationNote(models.Model):
    appointment = models.ForeignKey(
        "appointments.Appointment", on_delete=models.PROTECT, related_name="consultation_notes"
    )
    diagnosis = models.TextField(blank=True, default="")
    treatment = models.TextField(blank=True, default="")
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "appointments_consultationnote"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Nota #{self.pk} — cita {self.appointment.code}"
