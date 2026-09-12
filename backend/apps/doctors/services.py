"""Reglas de negocio de médicos: disponibilidad próxima y payload de slots."""

from datetime import date

from apps.schedules.models import Availability
from apps.users.choices import Role
from apps.users.models import User


def slot_payload(slot) -> dict:
    return {
        "id": slot.id,
        "doctorId": slot.doctor_id,
        "date": slot.date.isoformat(),
        "startTime": slot.start_time.strftime("%H:%M"),
        "endTime": slot.end_time.strftime("%H:%M"),
        "status": slot.status,
        "box": slot.box,
    }


def upcoming_slots(doctor, *, limit: int | None = 20) -> list[dict]:
    slots = doctor.availability.filter(status="ACTIVE", date__gte=date.today()).order_by("date", "start_time")
    if limit:
        slots = slots[:limit]
    return [slot_payload(s) for s in slots]


def full_availability(doctor) -> list[dict]:
    slots = (
        Availability.objects.filter(doctor=doctor, date__gte=date.today()).order_by("date", "start_time")
    )
    return [slot_payload(s) for s in slots]


def email_taken(email: str) -> bool:
    return User.objects.filter(email__iexact=email).exists()


def _unique_username(email: str) -> str:
    import re

    base = re.sub(r"[^a-zA-Z0-9_.-]", "", email.split("@")[0]) or "doctor"
    username, index = base, 1
    while User.objects.filter(username__iexact=username).exists():
        index += 1
        username = f"{base}{index}"
    return username


def create_doctor(
    *,
    first_name: str,
    last_name: str,
    email: str,
    license_number: str,
    specialty,
    box: str = "",
    available: bool = True,
    password: str = "ClinicaAngry1",
):
    from .models import DoctorProfile

    user = User(
        username=_unique_username(email),
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=Role.DOCTOR.value,
        is_active=True,
    )
    user.set_password(password)
    user.save()

    return DoctorProfile.objects.create(
        user=user,
        specialty=specialty,
        license_number=license_number,
        box=box,
        available=available,
    )


def update_doctor(profile, *, first_name, last_name, email, license_number, specialty, box, available):
    user = profile.user
    user.first_name = first_name
    user.last_name = last_name
    user.email = email
    user.save(update_fields=["first_name", "last_name", "email", "updated_at"])

    profile.specialty = specialty
    profile.license_number = license_number
    profile.box = box
    profile.available = available
    profile.save()
    return profile
