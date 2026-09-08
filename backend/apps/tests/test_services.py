"""Tests de reglas de negocio de citas (reserva, cancelación y máquina de estados)."""

import datetime

import pytest
from django.utils import timezone

from apps.appointments.services import (
    AppointmentValidationError,
    assert_transition,
    can_cancel,
    transition,
    validate_schedule,
)
from apps.tests.factories import (
    AppointmentFactory,
    AvailabilityFactory,
    DoctorProfileFactory,
    PatientProfileFactory,
)

pytestmark = pytest.mark.django_db


def make_doctor_with_availability():
    doctor = DoctorProfileFactory()
    availability = AvailabilityFactory(doctor=doctor, date=timezone.localdate() + datetime.timedelta(days=2))
    return doctor, availability


class TestValidateSchedule:
    def test_rejects_past_date(self):
        doctor, _ = make_doctor_with_availability()
        patient = PatientProfileFactory()
        with pytest.raises(AppointmentValidationError, match="pasado"):
            validate_schedule(
                timezone.localdate() - datetime.timedelta(days=1),
                datetime.time(9, 0),
                datetime.time(9, 30),
                patient=patient,
                doctor=doctor,
            )

    def test_rejects_when_no_availability(self):
        doctor, _ = make_doctor_with_availability()
        patient = PatientProfileFactory()
        with pytest.raises(AppointmentValidationError, match="disponibilidad"):
            validate_schedule(
                timezone.localdate() + datetime.timedelta(days=10),
                datetime.time(9, 0),
                datetime.time(9, 30),
                patient=patient,
                doctor=doctor,
            )

    def test_rejects_doctor_conflict(self):
        doctor, availability = make_doctor_with_availability()
        patient = PatientProfileFactory()
        AppointmentFactory(
            doctor=doctor,
            date=availability.date,
            start_time=datetime.time(9, 0),
            end_time=datetime.time(9, 30),
        )
        with pytest.raises(AppointmentValidationError, match="médico ya tiene una cita"):
            validate_schedule(
                availability.date,
                datetime.time(9, 15),
                datetime.time(9, 45),
                patient=patient,
                doctor=doctor,
            )

    def test_rejects_patient_conflict(self):
        doctor, availability = make_doctor_with_availability()
        patient = PatientProfileFactory()
        other_doctor, _ = make_doctor_with_availability()
        AppointmentFactory(
            patient=patient,
            doctor=other_doctor,
            date=availability.date,
            start_time=datetime.time(9, 0),
            end_time=datetime.time(9, 30),
        )
        with pytest.raises(AppointmentValidationError, match="paciente ya tiene una cita"):
            validate_schedule(
                availability.date,
                datetime.time(9, 0),
                datetime.time(9, 30),
                patient=patient,
                doctor=doctor,
            )

    def test_passes_for_valid_slot(self):
        doctor, availability = make_doctor_with_availability()
        patient = PatientProfileFactory()
        validate_schedule(
            availability.date,
            datetime.time(9, 0),
            datetime.time(9, 30),
            patient=patient,
            doctor=doctor,
        )

    def test_ignores_cancelled_appointments_for_conflict(self):
        doctor, availability = make_doctor_with_availability()
        patient = PatientProfileFactory()
        AppointmentFactory(
            doctor=doctor,
            date=availability.date,
            start_time=datetime.time(9, 0),
            end_time=datetime.time(9, 30),
            status="CANCELLED",
        )
        validate_schedule(
            availability.date,
            datetime.time(9, 0),
            datetime.time(9, 30),
            patient=patient,
            doctor=doctor,
        )


class TestTransition:
    def test_valid_transitions_run(self):
        appointment = AppointmentFactory(status="PENDING")
        transition(appointment, "CONFIRMED")
        assert appointment.status == "CONFIRMED"
        transition(appointment, "COMPLETED")
        assert appointment.status == "COMPLETED"

    def test_invalid_transition_raises(self):
        appointment = AppointmentFactory(status="CANCELLED")
        with pytest.raises(AppointmentValidationError):
            transition(appointment, "CONFIRMED")

    def test_no_show_from_confirmed(self):
        appointment = AppointmentFactory(status="CONFIRMED")
        transition(appointment, "NO_SHOW")
        assert appointment.status == "NO_SHOW"

    def test_cannot_cancel_within_window(self):
        appointment = AppointmentFactory(
            status="CONFIRMED",
            date=timezone.localdate(),
            start_time=datetime.time(9, 0),
        )
        assert not can_cancel(appointment)
        with pytest.raises(AppointmentValidationError, match="ventana"):
            transition(appointment, "CANCELLED")

    def test_can_cancel_far_in_future(self):
        appointment = AppointmentFactory(
            status="CONFIRMED",
            date=timezone.localdate() + datetime.timedelta(days=10),
            start_time=datetime.time(9, 0),
        )
        assert can_cancel(appointment)

    def test_assert_transition_ok(self):
        appointment = AppointmentFactory(status="PENDING")
        assert_transition(appointment, "CANCELLED")
