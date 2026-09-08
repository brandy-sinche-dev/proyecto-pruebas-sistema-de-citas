from datetime import date

from rest_framework import serializers

from .models import DoctorProfile


class DoctorSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user_id", read_only=True)
    firstName = serializers.CharField(source="user.first_name")
    lastName = serializers.CharField(source="user.last_name")
    email = serializers.EmailField(source="user.email")
    phone = serializers.CharField(source="user.phone", allow_blank=True, default="")
    licenseNumber = serializers.CharField(source="license_number")
    specialtyId = serializers.IntegerField(source="specialty_id")
    specialtyName = serializers.CharField(source="specialty.name", read_only=True)
    availabilitySlots = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "licenseNumber",
            "specialtyId",
            "specialtyName",
            "box",
            "available",
            "availabilitySlots",
        ]

    def get_availabilitySlots(self, obj) -> list:
        slots = obj.availability.filter(status="ACTIVE", date__gte=date.today()).order_by("date", "start_time")[:20]
        return [
            {
                "id": s.id,
                "doctorId": s.doctor_id,
                "date": s.date.isoformat(),
                "startTime": s.start_time.strftime("%H:%M"),
                "endTime": s.end_time.strftime("%H:%M"),
                "status": s.status,
                "box": s.box,
            }
            for s in slots
        ]


class DoctorWriteSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source="user.first_name")
    lastName = serializers.CharField(source="user.last_name")
    email = serializers.EmailField(source="user.email")
    licenseNumber = serializers.CharField(source="license_number")

    class Meta:
        model = DoctorProfile
        fields = ["firstName", "lastName", "email", "licenseNumber", "specialty", "box", "available"]
