from django.db import models


class Role(models.TextChoices):
    ADMIN = "admin", "Administración"
    RECEPTIONIST = "receptionist", "Recepción"
    DOCTOR = "doctor", "Médico"
    PATIENT = "patient", "Paciente"


class AppointmentStatus(models.TextChoices):
    PENDING = "PENDING", "Pendiente"
    CONFIRMED = "CONFIRMED", "Confirmada"
    CHECKED_IN = "CHECKED_IN", "Ingresó (check-in)"
    COMPLETED = "COMPLETED", "Atendida"
    CANCELLED = "CANCELLED", "Cancelada"
    NO_SHOW = "NO_SHOW", "No asistió"


class AvailabilityStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Disponible"
    BLOCKED = "BLOCKED", "Bloqueado"
    PAST = "PAST", "Pasado"


class BoxStatus(models.TextChoices):
    FREE = "FREE", "Disponible"
    IN_USE = "IN_USE", "En uso"
    MAINTENANCE = "MAINTENANCE", "Mantenimiento"
    DISINFECTION = "DISINFECTION", "Desinfección"


class ExamCategory(models.TextChoices):
    LABORATORY = "LABORATORY", "Laboratorio clínico"
    IMAGING = "IMAGING", "Imágenes diagnósticas"
    OTHER = "OTHER", "Otro"


class ExamStatus(models.TextChoices):
    PENDING = "PENDING", "Pendiente"
    PROCESSING = "PROCESSING", "En proceso"
    COMPLETED = "COMPLETED", "Completado"


class PaymentMethod(models.TextChoices):
    CASH = "CASH", "Efectivo"
    WEB = "WEB", "Pago web"
    POS = "POS", "Tarjeta POS"


class BillingStatus(models.TextChoices):
    PENDING = "PENDING", "Pendiente"
    PAID = "PAID", "Pagado"
    SETTLED = "SETTLED", "Liquidado"
    GLOSA = "GLOSA", "Con glosa"
