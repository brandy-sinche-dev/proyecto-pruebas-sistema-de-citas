"""Reglas de negocio de disponibilidad: validación de fechas/horarios y upsert por turno."""

from datetime import date as date_cls

from apps.users.choices import AvailabilityStatus

from .models import Availability


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
