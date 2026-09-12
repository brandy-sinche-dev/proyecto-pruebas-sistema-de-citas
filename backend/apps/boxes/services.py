"""Reglas de negocio de consultorios/boxes clínicos."""

from apps.users.choices import BoxStatus


class BoxValidationError(ValueError):
    pass


def validate_status_change(box, status: str) -> None:
    if status == BoxStatus.IN_USE.value and not box.doctor_id:
        raise BoxValidationError("Un box en uso debe tener un médico asignado.")


def change_status(box, status: str):
    validate_status_change(box, status)
    box.status = status
    box.save(update_fields=["status", "updated_at"])
    return box


def assign_doctor(box, doctor) -> None:
    box.doctor = doctor
    box.save(update_fields=["doctor", "updated_at"])


def sync_box_status(box) -> None:
    """Un box queda 'en uso' cuando su médico tiene citas activas de hoy; si no, 'disponible'."""
    from django.utils import timezone

    from apps.users.choices import AppointmentStatus

    now = timezone.localdate()
    has_active = box.doctor_id is not None and box.doctor.appointments.filter(
        date=now,
        status__in=[
            AppointmentStatus.PENDING.value,
            AppointmentStatus.CONFIRMED.value,
            AppointmentStatus.CHECKED_IN.value,
        ],
    ).exists()
    box.status = BoxStatus.IN_USE.value if has_active else BoxStatus.FREE.value
    box.save(update_fields=["status", "updated_at"])
    return box