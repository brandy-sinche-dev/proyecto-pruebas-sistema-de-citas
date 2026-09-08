"""Factories (factory_boy) para los tests del backend."""

import datetime

import factory
from django.contrib.auth import get_user_model

from apps.appointments.models import Appointment, ConsultationNote, Medication, Prescription
from apps.doctors.models import DoctorProfile
from apps.notifications.models import Notification
from apps.patients.models import PatientProfile
from apps.schedules.models import Availability
from apps.specialties.models import Specialty
from apps.users.choices import Role

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("username",)

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.Sequence(lambda n: f"user{n}@clinicangry.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    role = Role.PATIENT.value
    is_active = True

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        if not create:
            return
        self.set_password(extracted or "ClinicaAngry1")
        self.save()


class AdminFactory(UserFactory):
    username = factory.Sequence(lambda n: f"admin{n}")
    role = Role.ADMIN.value
    is_staff = True
    is_superuser = True


class ReceptionistFactory(UserFactory):
    username = factory.Sequence(lambda n: f"recepcion{n}")
    role = Role.RECEPTIONIST.value


class DoctorUserFactory(UserFactory):
    username = factory.Sequence(lambda n: f"doctor{n}")
    role = Role.DOCTOR.value


class PatientUserFactory(UserFactory):
    username = factory.Sequence(lambda n: f"paciente{n}")
    role = Role.PATIENT.value


class SpecialtyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Specialty
        django_get_or_create = ("name",)

    name = factory.Sequence(lambda n: f"Especialidad {n}")
    color = "#0D9488"
    icon = "medical_services"


class DoctorProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DoctorProfile

    user = factory.SubFactory(DoctorUserFactory)
    specialty = factory.SubFactory(SpecialtyFactory)
    license_number = factory.Sequence(lambda n: f"CMP-{1000 + n}")
    box = "Box 101"
    available = True


class PatientProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PatientProfile

    user = factory.SubFactory(PatientUserFactory)
    document_number = factory.Sequence(lambda n: f"70{n:06d}")
    birth_date = factory.Faker("date_of_birth", minimum_age=18, maximum_age=80)
    gender = "F"
    blood_type = "O+"
    medical_history = []


class AvailabilityFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Availability

    doctor = factory.SubFactory(DoctorProfileFactory)
    date = factory.Faker("future_date", end_date="+30d")
    start_time = factory.LazyFunction(lambda: datetime.time(8, 0))
    end_time = factory.LazyFunction(lambda: datetime.time(14, 0))
    status = "ACTIVE"
    box = "Box 101"


class AppointmentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Appointment

    patient = factory.SubFactory(PatientProfileFactory)
    doctor = factory.SubFactory(DoctorProfileFactory)
    specialty = factory.LazyAttribute(lambda obj: obj.doctor.specialty)
    date = factory.Faker("future_date", end_date="+30d")
    start_time = factory.LazyFunction(lambda: datetime.time(9, 0))
    end_time = factory.LazyFunction(lambda: datetime.time(9, 30))
    status = "PENDING"
    box = factory.LazyAttribute(lambda obj: obj.doctor.box)


class ConsultationNoteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ConsultationNote

    appointment = factory.SubFactory(AppointmentFactory)
    diagnosis = "Diagnóstico de prueba"
    treatment = "Tratamiento de prueba"
    notes = "Notas de prueba"


class PrescriptionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Prescription

    appointment = factory.SubFactory(AppointmentFactory)
    instructions = "Tomar según lo indicado."
    notes = ""


class MedicationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Medication

    name = factory.Faker("word")
    dosage = "10mg"
    frequency = "Cada 24h"
    duration = "10 días"


class NotificationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Notification

    user = factory.SubFactory(UserFactory)
    message = factory.Faker("sentence")
    read = False
