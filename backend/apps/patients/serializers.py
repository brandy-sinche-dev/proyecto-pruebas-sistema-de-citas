from rest_framework import serializers

from apps.users.choices import Role

from .models import PatientProfile


class PatientSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user_id", read_only=True)
    firstName = serializers.CharField(source="user.first_name")
    lastName = serializers.CharField(source="user.last_name")
    email = serializers.EmailField(source="user.email")
    phone = serializers.CharField(source="user.phone", allow_blank=True, default="")
    documentNumber = serializers.CharField(source="document_number", allow_blank=True)
    birthDate = serializers.DateField(source="birth_date", allow_null=True, required=False)
    gender = serializers.CharField(max_length=1, allow_blank=True)
    bloodType = serializers.CharField(source="blood_type", allow_blank=True)

    class Meta:
        model = PatientProfile
        fields = [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "documentNumber",
            "birthDate",
            "gender",
            "bloodType",
        ]


class PatientCreateSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=150)
    lastName = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=32, required=False, default="")
    documentNumber = serializers.CharField(max_length=32, required=False, default="")
    birthDate = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=["M", "F"], required=False)
    bloodType = serializers.CharField(max_length=8, required=False, default="")

    def validate_email(self, value: str) -> str:
        from apps.users.models import User

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este correo.")
        return value.lower()

    def create(self, validated):
        from apps.users.models import User

        user = User(
            username=validated.pop("documentNumber") or validated["email"].split("@")[0],
            email=validated["email"],
            first_name=validated["firstName"],
            last_name=validated["lastName"],
            phone=validated.get("phone", ""),
            role=Role.PATIENT.value,
            is_active=True,
        )
        user.set_password("ClinicaAngry1")  # contraseña inicial documentada en el seed
        user.save()
        profile = PatientProfile.objects.create(
            user=user,
            document_number=validated.get("documentNumber", ""),
            birth_date=validated.get("birthDate"),
            gender=validated.get("gender", ""),
            blood_type=validated.get("bloodType", ""),
        )
        return profile
