from datetime import date as date_cls

from rest_framework import serializers

from apps.doctors.models import DoctorProfile
from apps.users.choices import AvailabilityStatus

from .models import Availability


class AvailabilitySerializer(serializers.ModelSerializer):
    doctorId = serializers.IntegerField(source="doctor_id", read_only=True)
    startTime = serializers.TimeField(source="start_time", format="%H:%M")
    endTime = serializers.TimeField(source="end_time", format="%H:%M")

    class Meta:
        model = Availability
        fields = ["id", "doctorId", "date", "startTime", "endTime", "status", "box"]

    def validate(self, attrs):
        start = attrs.get("start_time")
        end = attrs.get("end_time")
        slot_date = attrs.get("date")
        if slot_date is not None and slot_date < date_cls.today():
            raise serializers.ValidationError({"date": "No se puede registrar disponibilidad en el pasado."})
        if start and end and start >= end:
            raise serializers.ValidationError({"startTime": "La hora de inicio debe ser anterior a la de fin."})
        return attrs


class AvailabilityCreateSerializer(AvailabilitySerializer):
    doctor = serializers.PrimaryKeyRelatedField(queryset=DoctorProfile.objects.all())

    class Meta(AvailabilitySerializer.Meta):
        fields = AvailabilitySerializer.Meta.fields + ["doctor", "status"]

    def create(self, validated_data):
        doctor = validated_data.pop("doctor")
        return Availability.objects.update_or_create(
            doctor=doctor,
            date=validated_data["date"],
            defaults={**validated_data, "status": AvailabilityStatus.ACTIVE.value},
        )[0]
