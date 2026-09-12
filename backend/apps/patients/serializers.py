from rest_framework import serializers

from .models import PatientProfile
from .services import create_patient, email_taken


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
    insuranceId = serializers.IntegerField(source="insurance_id", allow_null=True, read_only=True)
    insuranceName = serializers.CharField(source="insurance.name", read_only=True, default=None)
    policyNumber = serializers.CharField(source="policy_number", allow_blank=True, required=False)

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
            "insuranceId",
            "insuranceName",
            "policyNumber",
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
    insuranceId = serializers.IntegerField(required=False, allow_null=True)
    policyNumber = serializers.CharField(max_length=64, required=False, default="")

    def validate_email(self, value: str) -> str:
        if email_taken(value):
            raise serializers.ValidationError("Ya existe un usuario con este correo.")
        return value.lower()

    def validate_documentNumber(self, value: str) -> str:
        if value and PatientProfile.objects.filter(document_number__iexact=value).exists():
            raise serializers.ValidationError("Ya existe un paciente con este DNI.")
        return value

    def validate_insuranceId(self, value):
        if value is None:
            return value
        from apps.finances.models import Insurance

        if not Insurance.objects.filter(pk=value, active=True).exists():
            raise serializers.ValidationError("No existe una aseguradora activa con ese identificador.")
        return value

    def create(self, validated):
        return create_patient(
            first_name=validated["firstName"],
            last_name=validated["lastName"],
            email=validated["email"],
            phone=validated.get("phone", ""),
            document_number=validated.get("documentNumber", ""),
            birth_date=validated.get("birthDate"),
            gender=validated.get("gender", ""),
            blood_type=validated.get("bloodType", ""),
            insurance_id=validated.get("insuranceId"),
            policy_number=validated.get("policyNumber", ""),
        )
