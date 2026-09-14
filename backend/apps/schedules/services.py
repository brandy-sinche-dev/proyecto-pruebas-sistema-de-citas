"""Reglas de negocio de disponibilidad: validación de fechas/horarios, upsert por turno y cancelación de citas afectadas."""

from datetime import date as date_cls

from apps.appointments.models import Appointment
from apps.users.choices import AppointmentStatus, AvailabilityStatus

from .models import Availability


def appointments_in_slot(availability: Availability):
    """Citas programadas (pendientes o confirmadas) de un doctor que caen dentro de la franja de disponibilidad."""
    from apps.appointments.models import Appointment

    return Appointment.objects.filter(
        doctor_id=availability.doctor_id,
        date=availability.date,
        start_time__lt=availability.end_time,
        end_time__gt=availability.start_time,
        status__in=[
            AppointmentStatus.PENDING.value,
            AppointmentStatus.CONFIRMED.value,
        ],
    )


def cancel_appointments_in_slot(availability: Availability) -> int:
    """Cancela las citas programadas de una franja de disponibilidad y devuelve cuántas fueron afectadas."""
    affected = appointments_in_slot(availability)
    count = affected.count()
    affected.update(status=AppointmentStatus.CANCELLED.value)
    return count


class AvailabilityValidationError(ValueError):
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(message)


def validate_date_not_past(slot_date) -> None:
    if slot_date is not None and slot_date < date_cls.today():
        raise AvailabilityValidationError("date", "No se puede registrar disponibilidad en el pasado.")


def validate_time_range(start_time, end_time) -> None:
    if start_time and end_time and start_time >= end_time:
        raise AvailabilityValidationError("startTime", "La hora de inicio debe ser anterior a la de fin.")


def validate_availability(date_, start_time, end_time) -> None:
    validate_date_not_past(date_)
    validate_time_range(start_time, end_time)


def upsert_availability(doctor, data: dict) -> Availability:
    defaults = {**data, "status": AvailabilityStatus.ACTIVE.value}
    return Availability.objects.update_or_create(doctor=doctor, date=data["date"], defaults=defaults)[0]
