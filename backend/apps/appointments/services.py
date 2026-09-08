"""Reglas de negocio de citas (skill 01): conflictos, ventana de cancelación y máquina de estados."""

import datetime

from django.conf import settings
from django.utils import timezone

from apps.users.choices import AppointmentStatus

from .models import Appointment

VALID_TRANSITIONS = {
    AppointmentStatus.PENDING.value: {AppointmentStatus.CONFIRMED.value, AppointmentStatus.CANCELLED.value},
    AppointmentStatus.CONFIRMED.value: {
        AppointmentStatus.COMPLETED.value,
        AppointmentStatus.CANCELLED.value,
        AppointmentStatus.NO_SHOW.value,
    },
    AppointmentStatus.COMPLETED.value: set(),
    AppointmentStatus.CANCELLED.value: set(),
    AppointmentStatus.NO_SHOW.value: set(),
}


class AppointmentValidationError(ValueError):
    pass


def validate_schedule(
    date_: datetime.date, start_time: datetime.time, end_time: datetime.time, *, patient, doctor
) -> None:
    now = timezone.localdate()
    if date_ < now:
        raise AppointmentValidationError("No se pueden registrar citas en el pasado.")
    if date_ == now and start_time <= datetime.datetime.now().time():
        raise AppointmentValidationError("La cita debe iniciar en el futuro.")

    availabilities = doctor.availability.filter(status="ACTIVE", date=date_)
    if not availabilities.filter(end_time__gt=start_time, start_time__lte=end_time).exists():
        raise AppointmentValidationError("El médico no tiene disponibilidad para ese horario.")

    doctor_conflict = Appointment.objects.filter(
        doctor=doctor,
        date=date_,
        start_time__lt=end_time,
        end_time__gt=start_time,
    ).exclude(status=AppointmentStatus.CANCELLED.value)
    if doctor_conflict.exists():
        raise AppointmentValidationError("El médico ya tiene una cita en ese horario.")

    patient_conflict = Appointment.objects.filter(
        patient=patient,
        date=date_,
        start_time__lt=end_time,
        end_time__gt=start_time,
    ).exclude(status=AppointmentStatus.CANCELLED.value)
    if patient_conflict.exists():
        raise AppointmentValidationError("El paciente ya tiene una cita a esa hora.")


def can_cancel(appointment: Appointment) -> bool:
    start = datetime.datetime.combine(appointment.date, appointment.start_time)
    start = timezone.make_aware(start)
    hours = getattr(settings, "CANCELLATION_HOURS", 24)
    return timezone.now() <= start - datetime.timedelta(hours=hours)


def assert_transition(appointment: Appointment, target: str) -> None:
    allowed = VALID_TRANSITIONS.get(appointment.status, set())
    if target not in allowed:
        raise AppointmentValidationError(f"No se puede cambiar de {appointment.status} a {target}.")


def transition(appointment: Appointment, target: str) -> Appointment:
    assert_transition(appointment, target)
    if target == AppointmentStatus.CANCELLED.value and not can_cancel(appointment):
        raise AppointmentValidationError("Fuera de la ventana de cancelación.")
    appointment.status = target
    appointment.save(update_fields=["status", "updated_at"])
    return appointment
