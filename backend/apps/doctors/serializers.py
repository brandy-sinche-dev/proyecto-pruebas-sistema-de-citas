from rest_framework import serializers

from .models import DoctorProfile
from .services import create_doctor, email_taken, upcoming_slots, update_doctor


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
        return upcoming_slots(obj)


class DoctorWriteSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source="user.first_name", max_length=150)
    lastName = serializers.CharField(source="user.last_name", max_length=150)
    email = serializers.EmailField(source="user.email")
    licenseNumber = serializers.CharField(source="license_number", max_length=64)

    class Meta:
        model = DoctorProfile
        fields = ["firstName", "lastName", "email", "licenseNumber", "specialty", "box", "available"]

    def validate_email(self, value: str) -> str:
        value = value.lower()
        instance = getattr(self, "instance", None)
        if email_taken(value) and (instance is None or instance.user.email.lower() != value):
            raise serializers.ValidationError("Ya existe un usuario con este correo.")
        return value

    def create(self, validated_data):
        return create_doctor(
            first_name=validated_data["user"]["first_name"],
            last_name=validated_data["user"]["last_name"],
            email=validated_data["user"]["email"],
            license_number=validated_data["license_number"],
            specialty=validated_data["specialty"],
            box=validated_data.get("box", ""),
            available=validated_data.get("available", True),
        )

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        return update_doctor(
            instance,
            first_name=user_data.get("first_name", instance.user.first_name),
            last_name=user_data.get("last_name", instance.user.last_name),
            email=user_data.get("email", instance.user.email),
            license_number=validated_data.get("license_number", instance.license_number),
            specialty=validated_data.get("specialty", instance.specialty),
            box=validated_data.get("box", instance.box),
            available=validated_data.get("available", instance.available),
        )
