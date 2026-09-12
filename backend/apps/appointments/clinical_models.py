from django.db import models

from apps.users.choices import ExamCategory, ExamStatus


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
            from .services import next_prescription_code

            self.code = next_prescription_code(self)
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


class ClinicalExam(models.Model):
    """Exámenes y estudios: laboratorio clínico, imágenes diagnósticas y otros."""

    appointment = models.ForeignKey("appointments.Appointment", on_delete=models.PROTECT, related_name="exams")
    category = models.CharField(max_length=16, choices=ExamCategory.choices, default=ExamCategory.LABORATORY.value)
    name = models.CharField(max_length=200)
    result = models.TextField(blank=True, default="")
    reference_range = models.CharField(max_length=200, blank=True, default="")
    status = models.CharField(max_length=16, choices=ExamStatus.choices, default=ExamStatus.PENDING.value)
    performed_at = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "appointments_clinicalexam"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} — {self.get_status_display()}"
