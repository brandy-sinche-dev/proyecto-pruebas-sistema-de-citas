from rest_framework import serializers

from .clinical_models import ClinicalExam, ConsultationNote, Medication, Prescription
from .services import create_prescription


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ["id", "name", "dosage", "frequency", "duration"]


class ConsultationNoteSerializer(serializers.ModelSerializer):
    appointmentId = serializers.IntegerField(source="appointment_id")
    patientId = serializers.IntegerField(source="appointment.patient.user_id", read_only=True)
    doctorId = serializers.IntegerField(source="appointment.doctor.user_id", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = ConsultationNote
        fields = [
            "id",
            "appointmentId",
            "patientId",
            "doctorId",
            "diagnosis",
            "treatment",
            "notes",
            "createdAt",
        ]


class PrescriptionSerializer(serializers.ModelSerializer):
    appointmentId = serializers.IntegerField(source="appointment_id")
    patientId = serializers.IntegerField(source="appointment.patient.user_id", read_only=True)
    doctorId = serializers.IntegerField(source="appointment.doctor.user_id", read_only=True)
    date = serializers.DateField(source="appointment.date", read_only=True)
    medications = MedicationSerializer(many=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Prescription
        fields = [
            "id",
            "code",
            "appointmentId",
            "patientId",
            "doctorId",
            "date",
            "medications",
            "instructions",
            "notes",
            "createdAt",
        ]

    def create(self, validated):
        return create_prescription(
            appointment_id=validated.pop("appointment_id"),
            instructions=validated.get("instructions", ""),
            notes=validated.get("notes", ""),
            medications=validated.get("medications", []),
        )


class ClinicalExamSerializer(serializers.ModelSerializer):
    appointmentId = serializers.IntegerField(source="appointment_id")
    patientId = serializers.IntegerField(source="appointment.patient.user_id", read_only=True)
    doctorId = serializers.IntegerField(source="appointment.doctor.user_id", read_only=True)
    performedAt = serializers.DateField(source="performed_at", allow_null=True, required=False)
    referenceRange = serializers.CharField(source="reference_range", allow_blank=True, required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = ClinicalExam
        fields = [
            "id",
            "appointmentId",
            "patientId",
            "doctorId",
            "category",
            "name",
            "result",
            "referenceRange",
            "status",
            "performedAt",
            "notes",
            "createdAt",
        ]
