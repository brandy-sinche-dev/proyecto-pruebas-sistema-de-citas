from django.conf import settings
from django.db import models

GENDERS = [("M", "Masculino"), ("F", "Femenino")]


class PatientProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="patient_profile")
    document_number = models.CharField(max_length=32, blank=True, default="")
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDERS, blank=True, default="")
    blood_type = models.CharField(max_length=8, blank=True, default="")
    medical_history = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = "patients_patientprofile"
        constraints = [
            models.CheckConstraint(check=models.Q(gender__in=["M", "F", ""]), name="patients_gender_valid"),
        ]

    def __str__(self) -> str:
        return f"Paciente {self.user.full_name}"
