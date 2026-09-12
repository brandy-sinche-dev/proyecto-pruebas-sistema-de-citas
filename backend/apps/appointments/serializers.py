from rest_framework import serializers

from apps.users.choices import AppointmentStatus

from .models import Appointment
from .services import AppointmentValidationError, SpecialtyMismatchError, create_appointment


class AppointmentSerializer(serializers.ModelSerializer):
    patientId = serializers.IntegerField(source="patient.user_id")
    patientName = serializers.CharField(source="patient.user.full_name", read_only=True)
    doctorId = serializers.IntegerField(source="doctor.user_id")
    doctorName = serializers.CharField(source="doctor.user.full_name", read_only=True)
    specialtyId = serializers.IntegerField(source="specialty_id")
    specialtyName = serializers.CharField(source="specialty.name", read_only=True)
    startTime = serializers.TimeField(source="start_time", format="%H:%M")
    endTime = serializers.TimeField(source="end_time", format="%H:%M")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    reason = serializers.CharField(allow_blank=True, required=False)
    notes = serializers.CharField(allow_blank=True, required=False)
    teleconsult = serializers.BooleanField(required=False)
    teleconsultLink = serializers.CharField(source="teleconsult_link", read_only=True)

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
            "teleconsult",
            "teleconsultLink",
            "createdAt",
        ]


class AppointmentCreateSerializer(serializers.Serializer):
    patientId = serializers.IntegerField()
    doctorId = serializers.IntegerField()
    specialtyId = serializers.IntegerField()
    date = serializers.DateField()
    startTime = serializers.TimeField()
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)
    teleconsult = serializers.BooleanField(required=False, default=False)

    def create(self, validated):
        try:
            return create_appointment(
                patient_id=validated["patientId"],
                doctor_id=validated["doctorId"],
                specialty_id=validated["specialtyId"],
                date_=validated["date"],
                start_time=validated["startTime"],
                reason=validated.get("reason", ""),
                teleconsult=validated.get("teleconsult", False),
            )
        except SpecialtyMismatchError as exc:
            raise serializers.ValidationError({"specialtyId": str(exc)}) from exc
        except AppointmentValidationError as exc:
            raise serializers.ValidationError({"detail": str(exc)}) from exc


class AppointmentStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=AppointmentStatus.choices)
