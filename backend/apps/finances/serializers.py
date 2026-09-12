from rest_framework import serializers

from apps.users.choices import BillingStatus, PaymentMethod

from .models import Billing, Insurance
from .services import BillingValidationError, create_billing


class InsuranceSerializer(serializers.ModelSerializer):
    coveragePercent = serializers.IntegerField(source="coverage_percent")

    class Meta:
        model = Insurance
        fields = ["id", "code", "name", "coveragePercent", "active"]

    def validate_coveragePercent(self, value: int) -> int:
        if not 0 <= value <= 100:
            raise serializers.ValidationError("El porcentaje de cobertura debe estar entre 0 y 100.")
        return value


class BillingSerializer(serializers.ModelSerializer):
    appointmentId = serializers.IntegerField(source="appointment_id", read_only=True)
    patientId = serializers.IntegerField(source="appointment.patient.user_id", read_only=True)
    patientName = serializers.CharField(source="appointment.patient.user.full_name", read_only=True)
    doctorId = serializers.IntegerField(source="appointment.doctor.user_id", read_only=True)
    doctorName = serializers.CharField(source="appointment.doctor.user.full_name", read_only=True)
    specialtyId = serializers.IntegerField(source="appointment.specialty_id", read_only=True)
    specialtyName = serializers.CharField(source="appointment.specialty.name", read_only=True)
    insuranceId = serializers.IntegerField(source="insurance_id", read_only=True, allow_null=True)
    insuranceName = serializers.CharField(source="insurance.name", read_only=True, default=None)
    grossAmount = serializers.DecimalField(source="gross_amount", max_digits=12, decimal_places=2, read_only=True)
    insuranceAmount = serializers.DecimalField(
        source="insurance_amount", max_digits=12, decimal_places=2, read_only=True
    )
    copayAmount = serializers.DecimalField(source="copay_amount", max_digits=12, decimal_places=2, read_only=True)
    paymentMethod = serializers.CharField(source="payment_method", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Billing
        fields = [
            "id",
            "code",
            "appointmentId",
            "patientId",
            "patientName",
            "doctorId",
            "doctorName",
            "specialtyId",
            "specialtyName",
            "insuranceId",
            "insuranceName",
            "grossAmount",
            "insuranceAmount",
            "copayAmount",
            "paymentMethod",
            "status",
            "createdAt",
        ]


class BillingCreateSerializer(serializers.Serializer):
    appointmentId = serializers.IntegerField()
    paymentMethod = serializers.ChoiceField(choices=PaymentMethod.choices, default=PaymentMethod.CASH.value)
    status = serializers.ChoiceField(choices=BillingStatus.choices, default=BillingStatus.PENDING.value)

    def validate_appointmentId(self, value: int) -> int:
        from apps.appointments.models import Appointment

        if not Appointment.objects.filter(pk=value).exists():
            raise serializers.ValidationError("No existe una cita con ese identificador.")
        return value

    def create(self, validated):
        from apps.appointments.models import Appointment

        appointment = Appointment.objects.get(pk=validated["appointmentId"])
        try:
            return create_billing(
                appointment=appointment,
                payment_method=validated.get("paymentMethod", "CASH"),
                status=validated.get("status", "PENDING"),
            )
        except BillingValidationError as exc:
            raise serializers.ValidationError({"detail": str(exc)}) from exc

    def to_representation(self, instance):
        return BillingSerializer(instance).data


class BillingUpdateSerializer(serializers.ModelSerializer):
    paymentMethod = serializers.ChoiceField(source="payment_method", choices=PaymentMethod.choices, required=False)
    status = serializers.ChoiceField(choices=BillingStatus.choices, required=False)

    class Meta:
        model = Billing
        fields = ["paymentMethod", "status"]