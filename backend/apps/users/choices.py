from django.db import models


class Role(models.TextChoices):
    ADMIN = "admin", "Administración"
    RECEPTIONIST = "receptionist", "Recepción"
    DOCTOR = "doctor", "Médico"
    PATIENT = "patient", "Paciente"


class AppointmentStatus(models.TextChoices):
    PENDING = "PENDING", "Pendiente"
    CONFIRMED = "CONFIRMED", "Confirmada"
    COMPLETED = "COMPLETED", "Atendida"
    CANCELLED = "CANCELLED", "Cancelada"
    NO_SHOW = "NO_SHOW", "No asistió"


class AvailabilityStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Disponible"
    BLOCKED = "BLOCKED", "Bloqueado"
    PAST = "PAST", "Pasado"
