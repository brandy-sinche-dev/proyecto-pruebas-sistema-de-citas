"""Tests de integración de catálogos y módulos auxiliares del API."""

import datetime

import pytest
from django.utils import timezone

from apps.tests.factories import (
    AdminFactory,
    AppointmentFactory,
    AvailabilityFactory,
    ConsultationNoteFactory,
    DoctorProfileFactory,
    NotificationFactory,
    PatientProfileFactory,
    PrescriptionFactory,
    SpecialtyFactory,
    UserFactory,
)

pytestmark = pytest.mark.django_db

MEDICATIONS = [{"name": "Ibuprofeno", "dosage": "400mg", "frequency": "Cada 8h", "duration": "5 dias"}]


class TestDoctors:
    def test_list_resource_shape(self, auth_client):
        doctor = DoctorProfileFactory()
        client = auth_client(doctor.user)
        response = client.get("/api/v1/doctors/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        item = next(d for d in data if d["id"] == doctor.user_id)
        assert item["firstName"] == doctor.user.first_name
        assert "specialtyName" in item
        assert "licenseNumber" in item

    def test_patient_can_list_doctors(self, api_client):
        user = PatientProfileFactory().user
        client = _login(api_client, user)
        response = client.get("/api/v1/doctors/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_admin_creates_doctor(self, auth_client):
        specialty = SpecialtyFactory()
        client = auth_client(AdminFactory())
        response = client.post(
            "/api/v1/doctors/",
            {
                "firstName": "Nuevo",
                "lastName": "Doctor",
                "email": "nuevo.doctor@mail.com",
                "licenseNumber": "CMP-TEST-777",
                "specialty": specialty.id,
                "box": "Box 777",
                "available": True,
            },
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert data["firstName"] == "Nuevo"
        assert data["specialtyName"] == specialty.name

    def test_doctor_creation_requires_admin(self, auth_client):
        specialty = SpecialtyFactory()
        doctor = DoctorProfileFactory()
        client = auth_client(doctor.user)
        response = client.post(
            "/api/v1/doctors/",
            {
                "firstName": "X",
                "lastName": "Y",
                "email": "x.y@mail.com",
                "licenseNumber": "CMP-TEST-778",
                "specialty": specialty.id,
            },
            format="json",
        )
        assert response.status_code == 403

    def test_admin_can_list(self, auth_client):
        doctor = DoctorProfileFactory()
        client = auth_client(AdminFactory())
        assert client.get("/api/v1/doctors/").status_code == 200
        assert client.get(f"/api/v1/doctors/{doctor.user_id}/").status_code == 200


def _login(api_client, user):
    login = api_client.post(
        "/api/v1/auth/login/",
        {"username": user.username, "password": "ClinicaAngry1"},
        format="json",
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    return api_client


class TestPatients:
    def test_patient_me_returns_own_profile(self, auth_client):
        profile = PatientProfileFactory()
        client = auth_client(profile.user)
        response = client.get("/api/v1/patients/me/")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == profile.user_id
        assert data["email"] == profile.user.email

    def test_patient_me_requires_patient_profile(self, auth_client):
        client = auth_client(AdminFactory())
        assert client.get("/api/v1/patients/me/").status_code == 404

    def test_patient_sees_only_self(self, auth_client):
        profile = PatientProfileFactory()
        other = PatientProfileFactory()
        client = auth_client(profile.user)
        response = client.get("/api/v1/patients/")
        assert response.status_code == 403  # el paciente no ve el directorio
        response = client.get(f"/api/v1/patients/{profile.user_id}/")
        assert response.status_code == 200
        assert response.json()["email"] == profile.user.email
        response = client.get(f"/api/v1/patients/{other.user_id}/")
        assert response.status_code == 404

    def test_staff_can_create_patient(self, auth_client):
        client = auth_client(AdminFactory())
        response = client.post(
            "/api/v1/patients/",
            {
                "firstName": "Nuevo",
                "lastName": "Paciente",
                "email": "nuevo@mail.com",
                "documentNumber": "71234567",
                "gender": "M",
                "birthDate": "1990-01-01",
                "bloodType": "A+",
            },
            format="json",
        )
        assert response.status_code == 201

    def test_duplicate_document_number_rejected(self, auth_client):
        existing = PatientProfileFactory(document_number="71234567")
        client = auth_client(AdminFactory())
        response = client.post(
            "/api/v1/patients/",
            {
                "firstName": "Otro",
                "lastName": "Paciente",
                "email": "otro@mail.com",
                "documentNumber": existing.document_number,
            },
            format="json",
        )
        assert response.status_code == 400

    def test_patient_without_document_gets_unique_username(self, auth_client):
        client = auth_client(AdminFactory())
        first = client.post(
            "/api/v1/patients/",
            {"firstName": "A", "lastName": "Uno", "email": "same@mail.com"},
            format="json",
        )
        second = client.post(
            "/api/v1/patients/",
            {"firstName": "B", "lastName": "Dos", "email": "same@otro.com"},
            format="json",
        )
        assert first.status_code == 201
        assert second.status_code == 201  # no colisión de username → 500
        assert first.json()["id"] != second.json()["id"]

    def test_patient_cannot_delete_patients(self, auth_client):
        profile = PatientProfileFactory()
        client = auth_client(profile.user)
        response = client.delete(f"/api/v1/patients/{profile.user_id}/")
        assert response.status_code in (403, 405)


class TestSpecialties:
    def test_any_authenticated_lists(self, auth_client):
        SpecialtyFactory()
        client = auth_client(UserFactory())
        response = client.get("/api/v1/specialties/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_only_admin_creates(self, auth_client):
        user = PatientProfileFactory().user
        client = auth_client(user)
        response = client.post("/api/v1/specialties/", {"name": "Nutrición"}, format="json")
        assert response.status_code == 403
        client = auth_client(AdminFactory())
        response = client.post("/api/v1/specialties/", {"name": "Nutrición"}, format="json")
        assert response.status_code in (201, 400)  # 400 si ya existe por unicidad


class TestAvailability:
    def test_patient_lists_availability(self, auth_client):
        AvailabilityFactory()
        patient = PatientProfileFactory().user
        client = auth_client(patient)
        response = client.get("/api/v1/availability/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_doctor_sees_own_availability_only(self, auth_client):
        doctor = DoctorProfileFactory()
        DoctorProfileFactory()
        client = auth_client(doctor.user)
        response = client.get("/api/v1/availability/")
        assert response.status_code == 200
        data = response.json()
        assert all(item["doctorId"] == doctor.user_id for item in data)

    def test_admin_creates_availability(self, auth_client):
        doctor = DoctorProfileFactory()
        client = auth_client(AdminFactory())
        response = client.post(
            "/api/v1/availability/",
            {
                "doctorId": doctor.user_id,
                "date": (timezone.localdate() + datetime.timedelta(days=3)).isoformat(),
                "startTime": "09:00",
                "endTime": "12:00",
                "box": "Box 200",
            },
            format="json",
        )
        assert response.status_code in (201, 200)

    def test_doctor_creates_own_availability(self, auth_client):
        doctor = DoctorProfileFactory()
        client = auth_client(doctor.user)
        response = client.post(
            "/api/v1/availability/",
            {
                "date": (timezone.localdate() + datetime.timedelta(days=2)).isoformat(),
                "startTime": "08:00",
                "endTime": "13:00",
                "box": "Box 104",
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.json()["doctorId"] == doctor.user_id

    def test_doctor_cannot_touch_other_doctor_availability(self, auth_client):
        doctor = DoctorProfileFactory()
        other = AvailabilityFactory(doctor=DoctorProfileFactory())
        client = auth_client(doctor.user)
        response = client.patch(
            f"/api/v1/availability/{other.id}/",
            {"startTime": "10:00"},
            format="json",
        )
        assert response.status_code in (403, 404)


class TestClinical:
    def test_doctor_lists_notes(self, auth_client):
        appointment = AppointmentFactory()
        ConsultationNoteFactory(appointment=appointment)
        client = auth_client(appointment.doctor.user)
        response = client.get("/api/v1/consultation-notes/")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["diagnosis"] == "Diagnóstico de prueba"

    def test_patient_sees_only_own_notes_and_rx(self, auth_client):
        own = AppointmentFactory()
        other = AppointmentFactory()
        ConsultationNoteFactory(appointment=own)
        ConsultationNoteFactory(appointment=other)
        PrescriptionFactory(appointment=own)
        PrescriptionFactory(appointment=other)
        client = auth_client(own.patient.user)
        notes = client.get("/api/v1/consultation-notes/")
        assert notes.status_code == 200
        assert all(n["patientId"] == own.patient.user_id for n in notes.json())
        rx = client.get("/api/v1/prescriptions/")
        assert rx.status_code == 200
        assert all(p["patientId"] == own.patient.user_id for p in rx.json())

    def test_only_doctor_creates_prescription(self, auth_client):
        appointment = AppointmentFactory()
        admin = AdminFactory()
        client = auth_client(admin)
        response = client.post(
            "/api/v1/prescriptions/",
            {
                "appointmentId": appointment.id,
                "instructions": "Instrucciones",
                "medications": MEDICATIONS,
            },
            format="json",
        )
        assert response.status_code == 403
        client = auth_client(appointment.doctor.user)
        response = client.post(
            "/api/v1/prescriptions/",
            {
                "appointmentId": appointment.id,
                "instructions": "Instrucciones",
                "medications": MEDICATIONS,
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["code"].startswith("RX-")


class TestNotifications:
    def test_user_sees_only_own(self, auth_client):
        user = UserFactory()
        NotificationFactory(user=user)
        client = auth_client(user)
        response = client.get("/api/v1/notifications/")
        assert response.status_code == 200
        assert len(response.json()) == 1
        response = client.patch(f"/api/v1/notifications/{response.json()[0]['id']}/", {"read": True}, format="json")
        assert response.status_code == 200
        assert response.data["read"] is True
        assert NotificationFactory(user=UserFactory()).id


class TestAudit:
    def test_only_admin_reads_audit(self, auth_client):
        doctor = DoctorProfileFactory()
        client = auth_client(doctor.user)
        assert client.get("/api/v1/audit/").status_code == 403
        client = auth_client(AdminFactory())
        response = client.get("/api/v1/audit/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        response = client.get("/api/v1/audit/?module=doctors")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert all(item["module"] == "doctors" for item in data)


class TestDashboard:
    def test_dashboard_summary(self, auth_client):
        appointment = AppointmentFactory(status="CONFIRMED")
        client = auth_client(AdminFactory())
        response = client.get("/api/v1/dashboard/summary/")
        assert response.status_code == 200
        data = response.json()
        assert "totalAppointments" in data
        assert "attendanceRate" in data
        assert isinstance(data["nextAppointments"], list)
        appointment.refresh_from_db()


def test_user_factory_password_usable():
    user = UserFactory()
    assert user.check_password("ClinicaAngry1")
