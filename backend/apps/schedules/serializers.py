from rest_framework import serializers

from apps.doctors.models import DoctorProfile

from .models import Availability
from .services import AvailabilityValidationError, upsert_availability, validate_availability


class AvailabilitySerializer(serializers.ModelSerializer):
    doctorId = serializers.IntegerField(source="doctor.user_id", read_only=True)
    startTime = serializers.TimeField(source="start_time", format="%H:%M")
    endTime = serializers.TimeField(source="end_time", format="%H:%M")

    class Meta:
        model = Availability
        fields = ["id", "doctorId", "date", "startTime", "endTime", "status", "box"]

    def validate(self, attrs):
        try:
            validate_availability(
                attrs.get("date"),
                attrs.get("start_time"),
                attrs.get("end_time"),
            )
        except AvailabilityValidationError as exc:
            raise serializers.ValidationError({exc.field: exc.message}) from exc
        return attrs


class AvailabilityCreateSerializer(AvailabilitySerializer):
    doctorId = serializers.IntegerField(write_only=True)

    class Meta(AvailabilitySerializer.Meta):
        fields = AvailabilitySerializer.Meta.fields + ["doctorId", "status"]

    def validate_doctorId(self, value: int) -> int:
        if not DoctorProfile.objects.filter(user_id=value).exists():
            raise serializers.ValidationError("No existe un médico con ese identificador.")
        return value

    def create(self, validated_data):
        doctor = DoctorProfile.objects.get(user_id=validated_data.pop("doctorId"))
        return upsert_availability(doctor, validated_data)
