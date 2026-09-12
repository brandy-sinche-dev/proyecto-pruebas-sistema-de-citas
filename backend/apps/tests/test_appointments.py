"""Tests de integración del API de citas: permisos por rol, creación y transiciones."""

import datetime

import pytest
from django.utils import timezone

from apps.tests.factories import (
    AdminFactory,
    AppointmentFactory,
    AvailabilityFactory,
    DoctorProfileFactory,
    PatientProfileFactory,
    PatientUserFactory,
)

pytestmark = pytest.mark.django_db


@pytest.fixture
def setup():
    doctor = DoctorProfileFactory()
    patient_profile = PatientProfileFactory()
    admin = AdminFactory()
    return {"doctor": doctor, "patient": patient_profile, "admin": admin}


def future_slot(doctor, days=2, start="09:00"):
    avail = AvailabilityFactory(doctor=doctor, date=timezone.localdate() + datetime.timedelta(days=days))
    return avail


class TestAppointmentPermissions:
    def test_requires_auth(self, api_client, setup):
        response = api_client.get("/api/v1/appointments/")
        assert response.status_code == 401

    def test_patient_sees_only_own(self, auth_client, setup):
        own = AppointmentFactory(patient=setup["patient"], status="CONFIRMED")
        other_patient = PatientProfileFactory()
        other_doctor = DoctorProfileFactory()
        AppointmentFactory(patient=other_patient, doctor=other_doctor, status="PENDING")
        client = auth_client(setup["patient"].user)
        response = client.get("/api/v1/appointments/")
        assert response.status_code == 200
        ids = [item["id"] for item in response.json()]
        assert own.id in ids
        assert len(ids) == 1

    def test_doctor_sees_only_own(self, auth_client, setup):
        other = AppointmentFactory(patient=setup["patient"], status="PENDING")
        own_patient = PatientProfileFactory()
        own = AppointmentFactory(patient=own_patient, doctor=setup["doctor"], status="PENDING")
        client = auth_client(setup["doctor"].user)
        response = client.get("/api/v1/appointments/")
        ids = [item["id"] for item in response.json()]
        assert own.id in ids
        assert other.id not in ids


class TestAppointmentCreate:
    def test_create_success(self, auth_client, setup):
        avail = future_slot(setup["doctor"])
        client = auth_client(setup["admin"])
        response = client.post(
            "/api/v1/appointments/",
            {
                "patientId": setup["patient"].user_id,
                "doctorId": setup["doctor"].user_id,
                "specialtyId": setup["doctor"].specialty_id,
                "date": avail.date.isoformat(),
                "startTime": "09:00",
                "reason": "Consulta de prueba",
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["status"] == "PENDING"
        assert response.data["specialtyName"] == setup["doctor"].specialty.name
        assert response.data["endTime"] == "09:30"

    def test_create_conflict_bad_request(self, auth_client, setup):
        avail = future_slot(setup["doctor"])
        AppointmentFactory(
            doctor=setup["doctor"],
            date=avail.date,
            start_time=datetime.time(9, 0),
            end_time=datetime.time(9, 30),
        )
        client = auth_client(setup["admin"])
        response = client.post(
            "/api/v1/appointments/",
            {
                "patientId": setup["patient"].user_id,
                "doctorId": setup["doctor"].user_id,
                "specialtyId": setup["doctor"].specialty_id,
                "date": avail.date.isoformat(),
                "startTime": "09:00",
            },
            format="json",
        )
        assert response.status_code == 400
        assert "ya tiene una cita" in response.data["detail"]

    def test_specialty_mismatch_rejected(self, auth_client, setup):
        from apps.tests.factories import SpecialtyFactory

        other_specialty = SpecialtyFactory()
        client = auth_client(setup["admin"])
        response = client.post(
            "/api/v1/appointments/",
            {
                "patientId": setup["patient"].user_id,
                "doctorId": setup["doctor"].user_id,
                "specialtyId": other_specialty.id,
                "date": timezone.localdate().isoformat(),
                "startTime": "09:00",
            },
            format="json",
        )
        assert response.status_code == 400

    def test_patient_self_booking_forced(self, auth_client, setup):
        patient_user = PatientUserFactory()
        PatientProfileFactory(user=patient_user)
        avail = future_slot(setup["doctor"])
        client = auth_client(patient_user)
        response = client.post(
            "/api/v1/appointments/",
            {
                "patientId": 99999,
                "doctorId": setup["doctor"].user_id,
                "specialtyId": setup["doctor"].specialty_id,
                "date": avail.date.isoformat(),
                "startTime": "10:00",
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["patientId"] == patient_user.id


class TestAppointmentTransitions:
    @pytest.fixture
    def pending_appointment(self, setup):
        return AppointmentFactory(patient=setup["patient"], doctor=setup["doctor"], status="PENDING")

    def test_confirm_and_complete(self, auth_client, setup, pending_appointment):
        client = auth_client(setup["admin"])
        response = client.post(f"/api/v1/appointments/{pending_appointment.id}/confirm/", format="json")
        assert response.status_code == 200
        assert response.data["status"] == "CONFIRMED"
        response = client.post(f"/api/v1/appointments/{pending_appointment.id}/complete/", format="json")
        assert response.data["status"] == "COMPLETED"

    def test_staff_can_complete(self, auth_client, setup, pending_appointment):
        confirmed = AppointmentFactory(patient=setup["patient"], doctor=setup["doctor"], status="CONFIRMED")
        client = auth_client(setup["doctor"].user)
        response = client.post(f"/api/v1/appointments/{confirmed.id}/complete/", format="json")
        assert response.status_code == 200
        assert response.data["status"] == "COMPLETED"

    def test_cancel_after_window(self, auth_client, setup, pending_appointment):
        future = AppointmentFactory(
            patient=setup["patient"],
            doctor=setup["doctor"],
            status="CONFIRMED",
            date=timezone.localdate() + datetime.timedelta(days=10),
            start_time=datetime.time(10, 0),
            end_time=datetime.time(10, 30),
        )
        client = auth_client(setup["admin"])
        response = client.post(f"/api/v1/appointments/{future.id}/cancel/", format="json")
        assert response.status_code == 200
        assert response.data["status"] == "CANCELLED"

    def test_cancel_within_window_rejected(self, auth_client, setup, pending_appointment):
        today = AppointmentFactory(
            patient=setup["patient"],
            doctor=setup["doctor"],
            status="CONFIRMED",
            date=timezone.localdate(),
            start_time=datetime.time(9, 0),
            end_time=datetime.time(9, 30),
        )
        client = auth_client(setup["admin"])
        response = client.post(f"/api/v1/appointments/{today.id}/cancel/", format="json")
        assert response.status_code == 400

    def test_invalid_transition_rejected(self, auth_client, setup, pending_appointment):
        cancelled = AppointmentFactory(patient=setup["patient"], doctor=setup["doctor"], status="CANCELLED")
        client = auth_client(setup["admin"])
        response = client.post(f"/api/v1/appointments/{cancelled.id}/complete/", format="json")
        assert response.status_code == 400

    def test_patient_cancels_own_appointment(self, auth_client, setup):
        future = AppointmentFactory(
            patient=setup["patient"],
            doctor=setup["doctor"],
            status="CONFIRMED",
            date=timezone.localdate() + datetime.timedelta(days=10),
            start_time=datetime.time(10, 0),
            end_time=datetime.time(10, 30),
        )
        client = auth_client(setup["patient"].user)
        response = client.post(f"/api/v1/appointments/{future.id}/cancel/", format="json")
        assert response.status_code == 200
        assert response.data["status"] == "CANCELLED"

    def test_patient_cannot_transition(self, auth_client, setup, pending_appointment):
        client = auth_client(setup["patient"].user)
        response = client.post(f"/api/v1/appointments/{pending_appointment.id}/confirm/", format="json")
        assert response.status_code == 403
