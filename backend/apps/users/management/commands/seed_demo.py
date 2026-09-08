"""Seed de datos de demostración replicando frontend/src/services/mock/mockApi.ts."""

import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.appointments.models import Appointment, ConsultationNote, Medication, Prescription
from apps.doctors.models import DoctorProfile
from apps.patients.models import PatientProfile
from apps.schedules.models import Availability
from apps.specialties.models import Specialty
from apps.users.choices import Role
from apps.users.models import User

PASSWORD = "ClinicaAngry1"

SPECIALTIES = [
    ("Cardiología", "#0D9488", "monitor_heart"),
    ("Pediatría", "#0284C7", "child_care"),
    ("Dermatología", "#7C3AED", "skin"),
    ("Ginecología", "#DB2777", "pregnant_woman"),
    ("Traumatología", "#EA580C", "orthopedics"),
    ("Medicina General", "#64748B", "medical_services"),
]

# id_mock, nombre, especialidad, email, telefono, licencia, box, disponible, username
DOCTORS = [
    (
        1,
        "Elena",
        "Ramos",
        "Cardiología",
        "elena.ramos@clinicangry.com",
        "+51 987 654 321",
        "CMP-1001",
        "Box 104",
        True,
        "dra.ramos",
    ),
    (
        2,
        "Jorge",
        "Mendoza",
        "Traumatología",
        "jorge.mendoza@clinicangry.com",
        "+51 987 654 322",
        "CMP-1002",
        "Box 208",
        True,
        "dr.mendoza",
    ),
    (
        3,
        "Lucía",
        "Fernández",
        "Pediatría",
        "lucia.fernandez@clinicangry.com",
        "+51 987 654 323",
        "CMP-1003",
        "Box 305",
        True,
        "dra.fernandez",
    ),
    (
        4,
        "Carlos",
        "Rivas",
        "Dermatología",
        "carlos.rivas@clinicangry.com",
        "+51 987 654 324",
        "CMP-1004",
        "Box 401",
        False,
        "dr.rivas",
    ),
    (
        5,
        "Ana",
        "Torres",
        "Medicina General",
        "ana.torres@clinicangry.com",
        "+51 987 654 325",
        "CMP-1005",
        "Box 107",
        True,
        "dra.torres",
    ),
]

PATIENTS = [
    ("María", "Gómez", "maria.gomez@mail.com", "+51 911 111 111", "70234561", "1990-05-12", "F", "O+", "paciente"),
    ("Pedro", "López", "pedro.lopez@mail.com", "+51 922 222 222", "71345672", "1985-08-23", "M", "A+", "pedro"),
    ("Rosa", "Quispe", "rosa.quispe@mail.com", "+51 933 333 333", "72456783", "1998-02-01", "F", "B+", "rosa"),
    ("Juan", "Sánchez", "juan.sanchez@mail.com", "+51 944 444 444", "73567894", "1978-11-17", "M", "O−", "juan"),
]

# disponibilidad: id_mock_doctor, dias_offset, inicio, fin, status, box
AVAILABILITY = [
    (1, 0, "08:00", "14:00", "ACTIVE"),
    (2, 0, "09:00", "13:00", "ACTIVE"),
    (3, 0, "08:00", "12:00", "ACTIVE"),
    (5, 0, "08:00", "15:00", "ACTIVE"),
    (4, 0, "10:00", "14:00", "BLOCKED"),
    (1, 1, "08:00", "14:00", "ACTIVE"),
    (5, 1, "08:00", "14:00", "ACTIVE"),
]

# citas: id_mock, paciente(username), doctor_id_mock, especialidad, dias_offset, hora, status, motivo
APPOINTMENTS = [
    (1, "paciente", 1, "Cardiología", 0, "09:00", "CONFIRMED", "Control cardiológico"),
    (2, "pedro", 1, "Cardiología", 0, "09:30", "CONFIRMED", "Dolor torácico"),
    (3, "rosa", 1, "Cardiología", 0, "10:00", "PENDING", "Chequeo general"),
    (4, "juan", 2, "Traumatología", 0, "11:00", "PENDING", "Esguince de tobillo"),
    (5, "paciente", 5, "Medicina General", 1, "08:30", "CONFIRMED", "Consulta general"),
    (6, "pedro", 5, "Medicina General", 1, "09:00", "PENDING", "Vacunación influenza"),
    (7, "rosa", 3, "Pediatría", 6, "10:00", "PENDING", "Control de niño sano"),
]


class Command(BaseCommand):
    help = "Carga datos de demostración (misma información que el mock del frontend)."

    def handle(self, *args, **options):
        if User.objects.exists():
            self.stdout.write(self.style.WARNING("Ya existen usuarios; el seed no se vuelve a ejecutar."))
            return

        specialties = {
            name: Specialty.objects.create(name=name, color=color, icon=icon) for name, color, icon in SPECIALTIES
        }

        User.objects.create_superuser(
            username="admin",
            email="admin@clinicangry.com",
            password=PASSWORD,
            first_name="Claudia",
            last_name="Director",
            role=Role.ADMIN.value,
        )
        User.objects.create_user(
            username="recepcion",
            email="recepcion@clinicangry.com",
            password=PASSWORD,
            first_name="Sandra",
            last_name="Paredes",
            role=Role.RECEPTIONIST.value,
        )

        doctors = {}
        for mock_id, first, last, spec_name, email, phone, license, box, available, username in DOCTORS:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=PASSWORD,
                first_name=first,
                last_name=last,
                phone=phone,
                role=Role.DOCTOR.value,
            )
            doctors[mock_id] = DoctorProfile.objects.create(
                user=user,
                specialty=specialties[spec_name],
                license_number=license,
                box=box,
                available=available,
            )

        patients = {}
        for first, last, email, phone, doc_num, birth, gender, blood, username in PATIENTS:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=PASSWORD,
                first_name=first,
                last_name=last,
                phone=phone,
                role=Role.PATIENT.value,
            )
            patients[username] = PatientProfile.objects.create(
                user=user,
                document_number=doc_num,
                birth_date=datetime.date.fromisoformat(birth),
                gender=gender,
                blood_type=blood,
            )

        today = timezone.localdate()
        for mock_id, offset, start, end, status in AVAILABILITY:
            Availability.objects.create(
                doctor=doctors[mock_id],
                date=today + datetime.timedelta(days=offset),
                start_time=datetime.time.fromisoformat(start),
                end_time=datetime.time.fromisoformat(end),
                status=status,
                box=doctors[mock_id].box,
            )

        appointments = []
        for _, patient_key, doctor_id, spec_name, offset, start, status, reason in APPOINTMENTS:
            doctor = doctors[doctor_id]
            appointment = Appointment.objects.create(
                patient=patients[patient_key],
                doctor=doctor,
                specialty=specialties[spec_name],
                date=today + datetime.timedelta(days=offset),
                start_time=datetime.time.fromisoformat(start),
                status=status,
                reason=reason,
                box=doctor.box,
            )
            appointments.append(appointment)

        current = next(a for a in appointments if a.patient.user.username == "paciente")
        ConsultationNote.objects.create(
            appointment=current,
            diagnosis="Hipertensión arterial controlada",
            treatment="Continuar enalapril 10mg, dieta hiposódica",
            notes="Paciente refiere buen cumplimiento de tratamiento.",
        )
        rx = Prescription.objects.create(
            appointment=current,
            instructions="No suspender sin indicación médica.",
            notes="Control en 30 días.",
        )
        rx.medications.add(
            Medication.objects.create(name="Enalapril", dosage="10mg", frequency="Cada 24h", duration="30 días")
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed listo: {User.objects.count()} usuarios, {Specialty.objects.count()} especialidades, "
                f"{DoctorProfile.objects.count()} médicos, {PatientProfile.objects.count()} pacientes, "
                f"{Appointment.objects.count()} citas"
            )
        )
