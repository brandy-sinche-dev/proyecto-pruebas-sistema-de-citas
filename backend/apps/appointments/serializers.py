import datetime as dt
from datetime import timedelta

from django.conf import settings
from rest_framework import serializers

from apps.users.choices import AppointmentStatus

from .models import Appointment
from .services import AppointmentValidationError, validate_schedule


class AppointmentSerializer(serializers.ModelSerializer):
    patientId = serializers.IntegerField(source="patient_id")
    patientName = serializers.CharField(source="patient.user.full_name", read_only=True)
    doctorId = serializers.IntegerField(source="doctor_id")
    doctorName = serializers.CharField(source="doctor.user.full_name", read_only=True)
    specialtyId = serializers.IntegerField(source="specialty_id")
    specialtyName = serializers.CharField(source="specialty.name", read_only=True)
    startTime = serializers.TimeField(source="start_time", format="%H:%M")
    endTime = serializers.TimeField(source="end_time", format="%H:%M")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    reason = serializers.CharField(allow_blank=True, required=False)
    notes = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "code",
            "patientId",
            "patientName",
            "doctorId",
            "doctorName",
            "specialtyId",
            "specialtyName",
            "date",
            "startTime",
            "endTime",
            "status",
            "box",
            "reason",
            "notes",
            "createdAt",
        ]


class AppointmentCreateSerializer(serializers.Serializer):
    patientId = serializers.IntegerField()
    doctorId = serializers.IntegerField()
    specialtyId = serializers.IntegerField()
    date = serializers.DateField()
    startTime = serializers.TimeField()
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def create(self, validated):
        from apps.doctors.models import DoctorProfile
        from apps.patients.models import PatientProfile
        from apps.specialties.models import Specialty

        patient = PatientProfile.objects.select_related("user").get(pk=validated["patientId"])
        doctor = DoctorProfile.objects.select_related("user", "specialty").get(pk=validated["doctorId"])
        specialty = Specialty.objects.get(pk=validated["specialtyId"])
        if doctor.specialty_id != specialty.id:
            raise serializers.ValidationError({"specialtyId": "La especialidad no corresponde al médico."})

        duration = timedelta(minutes=getattr(settings, "CONSULTATION_DURATION_MINUTES", 30))
        start = validated["startTime"]
        end = (dt.datetime.combine(validated["date"], start) + duration).time()

        try:
            validate_schedule(validated["date"], start, end, patient=patient, doctor=doctor)
        except AppointmentValidationError as exc:
            raise serializers.ValidationError({"detail": str(exc)}) from exc

        return Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            specialty=specialty,
            date=validated["date"],
            start_time=start,
            end_time=end,
            reason=validated.get("reason", ""),
            box=doctor.box,
        )


class AppointmentStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=AppointmentStatus.choices)
