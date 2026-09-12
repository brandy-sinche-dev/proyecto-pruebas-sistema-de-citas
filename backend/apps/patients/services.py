"""Reglas de negocio de pacientes: registro y creación de perfiles."""

from apps.users.choices import Role
from apps.users.models import User

from .models import PatientProfile


def email_taken(email: str) -> bool:
    return User.objects.filter(email__iexact=email).exists()


def create_patient_profile(user: User) -> PatientProfile:
    return PatientProfile.objects.create(user=user)


def create_patient(
    *,
    first_name: str,
    last_name: str,
    email: str,
    phone: str = "",
    document_number: str = "",
    birth_date=None,
    gender: str = "",
    blood_type: str = "",
    insurance_id=None,
    policy_number: str = "",
    password: str = "ClinicaAngry1",
) -> PatientProfile:
    username = document_number or email.split("@")[0]
    base_username = username
    suffix = 2
    while User.objects.filter(username__iexact=username).exists():
        username = f"{base_username}{suffix}"
        suffix += 1
    user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        role=Role.PATIENT.value,
        is_active=True,
    )
    user.set_password(password)
    user.save()
    insurance = None
    if insurance_id:
        from apps.finances.models import Insurance

        insurance = Insurance.objects.filter(pk=insurance_id, active=True).first()
    return PatientProfile.objects.create(
        user=user,
        document_number=document_number,
        birth_date=birth_date,
        gender=gender,
        blood_type=blood_type,
        insurance=insurance,
        policy_number=policy_number,
    )
