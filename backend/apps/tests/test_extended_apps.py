"""Tests de integración de los módulos nuevos: boxes, check-in, teleconsulta, exámenes, aseguradoras y finanzas."""

import datetime

import pytest
from django.utils import timezone

from apps.appointments.models import Appointment, ClinicalExam
from apps.boxes.models import Box
from apps.finances.models import Billing, Insurance
from apps.notifications.models import Notification
from apps.patients.models import PatientProfile
from apps.tests.factories import (
    AdminFactory,
    AppointmentFactory,
    AvailabilityFactory,
    BoxFactory,
    ClinicalExamFactory,
    DoctorProfileFactory,
    InsuranceFactory,
    PatientProfileFactory,
    PatientUserFactory,
    ReceptionistFactory,
)

pytestmark = pytest.mark.django_db


@pytest.fixture
def setup():
    doctor = DoctorProfileFactory()
    patient = PatientProfileFactory()
    admin = AdminFactory()
    receptionist = ReceptionistFactory()
    return {
        "doctor": doctor,
        "patient": patient,
        "admin": admin,
        "receptionist": receptionist,
    }


class TestBoxes:
    def test_list_requires_auth(self, api_client):
        response = api_client.get("/api/v1/boxes/")
        assert response.status_code == 401

    def test_patient_can_read_but_not_write(self, auth_client, setup):
        BoxFactory()
        client = auth_client(setup["patient"].user)
        response = client.get("/api/v1/boxes/")
        assert response.status_code == 200
        assert len(response.json()) == 1
        response = client.post(
            "/api/v1/boxes/",
            {"code": "B999", "name": "Box 999", "status": "FREE"},
            format="json",
        )
        assert response.status_code == 403

    def test_admin_can_create_with_doctor(self, auth_client, setup):
        client = auth_client(setup["admin"])
        response = client.post(
            "/api/v1/boxes/",
            {
                "code": "B201",
                "name": "Box 201",
                "area": "Cardiología",
                "floor": "Piso 2",
                "status": "IN_USE",
                "doctorId": setup["doctor"].user_id,
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["doctorId"] == setup["doctor"].user_id
        assert response.data["doctorName"] == setup["doctor"].user.full_name

    def test_in_use_requires_doctor(self, auth_client, setup):
        client = auth_client(setup["admin"])
        response = client.post(
            "/api/v1/boxes/",
            {"code": "B202", "name": "Box 202", "status": "IN_USE"},
            format="json",
        )
        assert response.status_code == 400

    def test_admin_can_update_box(self, auth_client, setup):
        box = BoxFactory()
        client = auth_client(setup["admin"])
        response = client.patch(
            f"/api/v1/boxes/{box.id}/",
            {"status": "IN_USE", "doctorId": setup["doctor"].user_id},
            format="json",
        )
        assert response.status_code == 200
        box.refresh_from_db()
        assert box.doctor_id == setup["doctor"].user_id


class TestCheckIn:
    def test_receptionist_check_in_confirmed(self, auth_client, setup):
        appointment = AppointmentFactory(
            patient=setup["patient"], doctor=setup["doctor"], status="CONFIRMED"
        )
        client = auth_client(setup["receptionist"])
        response = client.post(f"/api/v1/appointments/{appointment.id}/check_in/", format="json")
        assert response.status_code == 200
        assert response.data["status"] == "CHECKED_IN"

    def test_patient_cannot_check_in(self, auth_client, setup):
        appointment = AppointmentFactory(
            patient=setup["patient"], doctor=setup["doctor"], status="CONFIRMED"
        )
        client = auth_client(setup["patient"].user)
        response = client.post(f"/api/v1/appointments/{appointment.id}/check_in/", format="json")
        assert response.status_code == 403

    def test_check_in_from_pending_rejected(self, auth_client, setup):
        appointment = AppointmentFactory(
            patient=setup["patient"], doctor=setup["doctor"], status="PENDING"
        )
        client = auth_client(setup["receptionist"])
        response = client.post(f"/api/v1/appointments/{appointment.id}/check_in/", format="json")
        assert response.status_code == 400

    def test_checked_in_counts_as_in_consultation(self, auth_client, setup):
        AppointmentFactory(
            patient=setup["patient"],
            doctor=setup["doctor"],
            status="CHECKED_IN",
            date=timezone.localdate(),
        )
        client = auth_client(setup["admin"])
        response = client.get("/api/v1/dashboard/summary/")
        assert response.status_code == 200
        assert response.data["checkedInCount"] == 1
        assert response.data["inConsultationCount"] == 1

    def test_notifications_on_check_in(self, auth_client, setup):
        appointment = AppointmentFactory(
            patient=setup["patient"], doctor=setup["doctor"], status="CONFIRMED"
        )
        client = auth_client(setup["receptionist"])
        client.post(f"/api/v1/appointments/{appointment.id}/check_in/", format="json")
        messages = set(Notification.objects.filter(read=False).values_list("message", flat=True))
        assert f"Check-in registrado para tu cita {appointment.code}." in messages
        assert f"El paciente llegó para la cita {appointment.code}." in messages


class TestTeleconsult:
    def test_create_teleconsult_generates_link(self, auth_client, setup):
        avail = AvailabilityFactory(
            doctor=setup["doctor"], date=timezone.localdate() + datetime.timedelta(days=2)
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
                "reason": "Teleconsulta de control",
                "teleconsult": True,
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["teleconsult"] is True
        assert response.data["teleconsultLink"].startswith("TEL-")

    def test_create_appointment_notifies_doctor(self, auth_client, setup):
        avail = AvailabilityFactory(
            doctor=setup["doctor"], date=timezone.localdate() + datetime.timedelta(days=2)
        )
        client = auth_client(setup["admin"])
        client.post(
            "/api/v1/appointments/",
            {
                "patientId": setup["patient"].user_id,
                "doctorId": setup["doctor"].user_id,
                "specialtyId": setup["doctor"].specialty_id,
                "date": avail.date.isoformat(),
                "startTime": "10:00",
            },
            format="json",
        )
        assert Notification.objects.filter(user=setup["doctor"].user).count() > 0


class TestClinicalExams:
    def test_list_requires_auth(self, api_client):
        response = api_client.get("/api/v1/exams/")
        assert response.status_code == 401

    def test_doctor_creates_exam(self, auth_client, setup):
        appointment = AppointmentFactory(patient=setup["patient"], doctor=setup["doctor"])
        client = auth_client(setup["doctor"].user)
        response = client.post(
            "/api/v1/exams/",
            {
                "appointmentId": appointment.id,
                "category": "LABORATORY",
                "name": "Hemograma",
                "result": "Normal",
                "status": "PENDING",
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["patientId"] == setup["patient"].user.id

    def test_patient_cannot_create_exam(self, auth_client, setup):
        appointment = AppointmentFactory(patient=setup["patient"], doctor=setup["doctor"])
        client = auth_client(setup["patient"].user)
        response = client.post(
            "/api/v1/exams/",
            {"appointmentId": appointment.id, "category": "IMAGING", "name": "Rayos X", "status": "PENDING"},
            format="json",
        )
        assert response.status_code == 403

    def test_roles_see_only_own_exams(self, auth_client, setup):
        own = ClinicalExamFactory(
            appointment=AppointmentFactory(patient=setup["patient"], doctor=setup["doctor"])
        )
        other_patient = PatientProfileFactory()
        other_doctor = DoctorProfileFactory()
        foreign = ClinicalExamFactory(
            appointment=AppointmentFactory(patient=other_patient, doctor=other_doctor)
        )

        client = auth_client(setup["patient"].user)
        response = client.get("/api/v1/exams/")
        ids = [item["id"] for item in response.json()]
        assert own.id in ids
        assert foreign.id not in ids

        client = auth_client(setup["doctor"].user)
        response = client.get("/api/v1/exams/")
        ids = [item["id"] for item in response.json()]
        assert own.id in ids
        assert foreign.id not in ids


class TestInsurance:
    def test_patient_cannot_create_insurance(self, auth_client, setup):
        client = auth_client(setup["patient"].user)
        response = client.post(
            "/api/v1/insurance/",
            {"code": "NUE", "name": "Nueva EPS", "coveragePercent": 70},
            format="json",
        )
        assert response.status_code == 403

    def test_admin_creates_insurance(self, auth_client, setup):
        client = auth_client(setup["admin"])
        response = client.post(
            "/api/v1/insurance/",
            {"code": "EPS", "name": "EPS Integra", "coveragePercent": 75},
            format="json",
        )
        assert response.status_code == 201
        assert response.data["coveragePercent"] == 75

    def test_invalid_coverage_rejected(self, auth_client, setup):
        client = auth_client(setup["admin"])
        response = client.post(
            "/api/v1/insurance/",
            {"code": "BAD", "name": "Cobertura inválida", "coveragePercent": 120},
            format="json",
        )
        assert response.status_code == 400

    def test_authenticated_can_list(self, auth_client, setup):
        InsuranceFactory()
        client = auth_client(setup["patient"].user)
        response = client.get("/api/v1/insurance/")
        assert response.status_code == 200


class TestBilling:
    def test_patient_cannot_access_billing(self, auth_client, setup):
        client = auth_client(setup["patient"].user)
        response = client.get("/api/v1/billing/")
        assert response.status_code == 403

    def test_create_billing_with_insurance(self, auth_client, setup):
        setup["doctor"].specialty.fee = 150.00
        setup["doctor"].specialty.save()
        instance = InsuranceFactory(coverage_percent=80)
        setup["patient"].insurance = instance
        setup["patient"].save()
        appointment = AppointmentFactory(patient=setup["patient"], doctor=setup["doctor"])
        client = auth_client(setup["receptionist"])
        response = client.post(
            "/api/v1/billing/",
            {"appointmentId": appointment.id},
            format="json",
        )
        assert response.status_code == 201
        assert response.data["insuranceId"] == instance.id
        assert str(response.data["grossAmount"]) == "150.00"
        assert str(response.data["insuranceAmount"]) == "120.00"
        assert str(response.data["copayAmount"]) == "30.00"
        assert response.data["code"].startswith("LIQ-")

    def test_duplicate_billing_rejected(self, auth_client, setup):
        appointment = AppointmentFactory(patient=setup["patient"], doctor=setup["doctor"])
        client = auth_client(setup["receptionist"])
        client.post("/api/v1/billing/", {"appointmentId": appointment.id}, format="json")
        response = client.post("/api/v1/billing/", {"appointmentId": appointment.id}, format="json")
        assert response.status_code == 400

    def test_staff_can_update_status(self, auth_client, setup):
        appointment = AppointmentFactory(patient=setup["patient"], doctor=setup["doctor"])
        client = auth_client(setup["receptionist"])
        created = client.post("/api/v1/billing/", {"appointmentId": appointment.id}, format="json")
        billing_id = created.data["id"]
        response = client.patch(
            f"/api/v1/billing/{billing_id}/",
            {"status": "PAID", "paymentMethod": "POS"},
            format="json",
        )
        assert response.status_code == 200
        billing = Billing.objects.get(pk=billing_id)
        assert billing.status == "PAID"
        assert billing.payment_method == "POS"

    def test_billing_without_insurance(self, auth_client, setup):
        setup["doctor"].specialty.fee = 100.00
        setup["doctor"].specialty.save()
        setup["patient"].insurance = None
        setup["patient"].save()
        appointment = AppointmentFactory(patient=setup["patient"], doctor=setup["doctor"])
        client = auth_client(setup["receptionist"])
        response = client.post("/api/v1/billing/", {"appointmentId": appointment.id}, format="json")
        assert response.status_code == 201
        assert response.data["insuranceId"] is None
        assert str(response.data["insuranceAmount"]) == "0.00"
        assert str(response.data["copayAmount"]) == "100.00"


class TestPatientProfileInsurance:
    def test_create_patient_with_insurance(self, auth_client, setup):
        insurance = InsuranceFactory()
        patient_user = PatientUserFactory()
        client = auth_client(setup["receptionist"])
        response = client.post(
            "/api/v1/patients/",
            {
                "firstName": "Nuevo",
                "lastName": "Paciente",
                "email": "nuevo@clinica.com",
                "phone": "+51 999 999 999",
                "documentNumber": "70555555",
                "birthDate": "1990-01-01",
                "gender": "M",
                "bloodType": "O+",
                "username": patient_user.username,
                "password": "ClinicaAngry1",
                "insuranceId": insurance.id,
                "policyNumber": "POL-NUEVO-0001",
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["insuranceId"] == insurance.id
        profile = PatientProfile.objects.get(user_id=response.data["id"])
        assert profile.policy_number == "POL-NUEVO-0001"