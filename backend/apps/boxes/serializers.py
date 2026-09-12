from rest_framework import serializers

from apps.doctors.models import DoctorProfile
from apps.users.choices import BoxStatus

from .models import Box
from .services import BoxValidationError


class BoxSerializer(serializers.ModelSerializer):
    doctorId = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    doctorName = serializers.CharField(source="doctor.user.full_name", read_only=True, default=None)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Box
        fields = [
            "id",
            "code",
            "name",
            "area",
            "floor",
            "status",
            "doctorId",
            "doctorName",
            "active",
            "createdAt",
        ]

    def validate(self, attrs):
        doctor_id = attrs.get("doctorId", getattr(self.instance, "doctor_id", None))
        status = attrs.get("status", getattr(self.instance, "status", None))
        if status == BoxStatus.IN_USE.value and doctor_id is None:
            raise serializers.ValidationError({"status": "Un box en uso debe tener un médico asignado."})
        return attrs

    def _doctor_or_none(self, doctor_id):
        if doctor_id is None:
            return None
        return DoctorProfile.objects.filter(user_id=doctor_id).first()

    def create(self, validated):
        doctor = self._doctor_or_none(validated.pop("doctorId", None))
        return Box.objects.create(**validated, doctor=doctor)

    def update(self, instance, validated):
        doctor = self._doctor_or_none(validated.pop("doctorId", None))
        for attr, value in validated.items():
            setattr(instance, attr, value)
        instance.doctor = doctor
        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["doctorId"] = instance.doctor.user_id if instance.doctor_id else None
        return data