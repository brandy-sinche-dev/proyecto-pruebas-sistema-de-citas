"""Reglas de negocio de citas (skill 01): conflictos, ventana de cancelación y máquina de estados."""

import datetime

from django.conf import settings
from django.utils import timezone

from apps.users.choices import AppointmentStatus

from .models import Appointment

VALID_TRANSITIONS = {
    AppointmentStatus.PENDING.value: {AppointmentStatus.CONFIRMED.value, AppointmentStatus.CANCELLED.value},
    AppointmentStatus.CONFIRMED.value: {
        AppointmentStatus.CHECKED_IN.value,
        AppointmentStatus.COMPLETED.value,
        AppointmentStatus.CANCELLED.value,
        AppointmentStatus.NO_SHOW.value,
    },
    AppointmentStatus.CHECKED_IN.value: {
        AppointmentStatus.COMPLETED.value,
        AppointmentStatus.NO_SHOW.value,
    },
    AppointmentStatus.COMPLETED.value: set(),
    AppointmentStatus.CANCELLED.value: set(),
    AppointmentStatus.NO_SHOW.value: set(),
}


class AppointmentValidationError(ValueError):
    pass


class SpecialtyMismatchError(AppointmentValidationError):
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


def transition(appointment: Appointment, target: str, actor=None) -> Appointment:
    assert_transition(appointment, target)
    if target == AppointmentStatus.CANCELLED.value and not can_cancel(appointment):
        raise AppointmentValidationError("Fuera de la ventana de cancelación.")
    appointment.status = target
    appointment.save(update_fields=["status", "updated_at"])
    _notify_transition(appointment, target, actor)
    return appointment


def _notify_transition(appointment: Appointment, target: str, actor=None) -> None:
    from apps.notifications.services import notify_user

    patient = appointment.patient.user
    doctor = appointment.doctor.user
    code = appointment.code

    if target == AppointmentStatus.CONFIRMED.value:
        notify_user(patient, f"Tu cita {code} fue confirmada.")
    elif target == AppointmentStatus.CHECKED_IN.value:
        notify_user(patient, f"Check-in registrado para tu cita {code}.")
        notify_user(doctor, f"El paciente llegó para la cita {code}.")
    elif target == AppointmentStatus.COMPLETED.value:
        notify_user(patient, f"Tu cita {code} fue atendida.")
    elif target == AppointmentStatus.NO_SHOW.value:
        notify_user(patient, f"Tu cita {code} fue registrada como no asistida.")
    elif target == AppointmentStatus.CANCELLED.value:
        actor_id = getattr(actor, "id", None)
        if actor_id is not None and actor_id == patient.id:
            notify_user(doctor, f"El paciente canceló la cita {code}.")
        else:
            notify_user(patient, f"Tu cita {code} fue cancelada.")


def next_appointment_code(date_: datetime.date) -> str:
    from django.db.models import Max

    last = Appointment.objects.aggregate(max_code=Max("code"))["max_code"]
    seq = 1
    if last and last.startswith("CIT-"):
        try:
            seq = int(last.split("-")[-1]) + 1
        except ValueError:
            seq = 1
    return f"CIT-{date_.year}-{seq:04d}"


def next_teleconsult_code(date_: datetime.date) -> str:
    from django.db.models import Max

    last = Appointment.objects.filter(teleconsult_link__startswith="TEL-").aggregate(
        max_code=Max("teleconsult_link")
    )["max_code"]
    seq = 1
    if last:
        try:
            seq = int(last.split("-")[-1]) + 1
        except ValueError:
            seq = 1
    return f"TEL-{date_.year}-{seq:04d}"


def create_appointment(
    *,
    patient_id: int,
    doctor_id: int,
    specialty_id: int,
    date_: datetime.date,
    start_time: datetime.time,
    reason: str = "",
    teleconsult: bool = False,
) -> Appointment:
    from apps.doctors.models import DoctorProfile
    from apps.patients.models import PatientProfile
    from apps.specialties.models import Specialty
    from apps.users.choices import AppointmentStatus

    patient = PatientProfile.objects.select_related("user").get(user_id=patient_id)
    doctor = DoctorProfile.objects.select_related("user", "specialty").get(user_id=doctor_id)
    specialty = Specialty.objects.get(pk=specialty_id)
    if doctor.specialty_id != specialty.id:
        raise SpecialtyMismatchError("La especialidad no corresponde al médico.")

    duration = datetime.timedelta(minutes=getattr(settings, "CONSULTATION_DURATION_MINUTES", 30))
    end_time = (datetime.datetime.combine(date_, start_time) + duration).time()
    validate_schedule(date_, start_time, end_time, patient=patient, doctor=doctor)

    appointment = Appointment.objects.create(
        patient=patient,
        doctor=doctor,
        specialty=specialty,
        date=date_,
        start_time=start_time,
        end_time=end_time,
        reason=reason,
        box=doctor.box,
        status=AppointmentStatus.PENDING.value,
        teleconsult=teleconsult,
        teleconsult_link=next_teleconsult_code(date_) if teleconsult else "",
    )

    from apps.notifications.services import notify_user

    notify_user(
        doctor.user,
        f"Nueva cita {appointment.code} agendada por {patient.user.full_name} el {date_} a las {start_time.strftime('%H:%M')}.",
    )
    return appointment


def next_prescription_code(prescription) -> str:
    from .clinical_models import Prescription

    year = prescription.appointment.date.year
    return f"RX-{year}-{Prescription.objects.filter(appointment__date__year=year).count() + 1:04d}"


PRICE_PER_APPOINTMENT = 80


def dashboard_stats(serialize) -> dict:
    from django.utils import timezone

    today = timezone.localdate()
    qs = Appointment.objects.select_related("patient__user", "doctor__user", "specialty")
    total = qs.count()
    attended = qs.filter(status=AppointmentStatus.COMPLETED.value).count()
    cancelled = qs.filter(status=AppointmentStatus.CANCELLED.value).count()
    no_show = qs.filter(status=AppointmentStatus.NO_SHOW.value).count()
    today_appointments = qs.filter(date=today)

    next_appointments = qs.filter(
        status__in=[AppointmentStatus.CONFIRMED.value, AppointmentStatus.PENDING.value],
        date__gte=today,
    ).order_by("date", "start_time")[:5]

    return {
        "totalAppointments": total,
        "attendanceRate": round(attended / total * 100, 1) if total else 0.0,
        "occupancyRate": round((total - cancelled) / total * 100, 1) if total else 0.0,
        "noShowRate": round(no_show / total * 100, 1) if total else 0.0,
        "pendingCount": today_appointments.filter(status=AppointmentStatus.PENDING.value).count(),
        "confirmedCount": today_appointments.filter(status=AppointmentStatus.CONFIRMED.value).count(),
        "checkedInCount": today_appointments.filter(status=AppointmentStatus.CHECKED_IN.value).count(),
        "inConsultationCount": today_appointments.filter(status=AppointmentStatus.CHECKED_IN.value).count(),
        "revenue": attended * PRICE_PER_APPOINTMENT,
        "nextAppointments": serialize(next_appointments),
        "recentAppointments": serialize(qs.order_by("-created_at")[:5]),
        "appointmentsToday": serialize(today_appointments.order_by("start_time")),
    }


def create_prescription(*, appointment_id, instructions: str = "", notes: str = "", medications=None):
    from .clinical_models import Medication, Prescription

    prescription = Prescription.objects.create(
        appointment_id=appointment_id,
        instructions=instructions or "",
        notes=notes or "",
    )
    for item in medications or []:
        medication, _ = Medication.objects.get_or_create(
            name=item["name"],
            defaults={
                "dosage": item.get("dosage", ""),
                "frequency": item.get("frequency", ""),
                "duration": item.get("duration", ""),
            },
        )
        prescription.medications.add(medication)
    return prescription
