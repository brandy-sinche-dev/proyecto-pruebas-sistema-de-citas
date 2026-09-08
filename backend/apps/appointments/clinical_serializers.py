from rest_framework import serializers

from .clinical_models import ConsultationNote, Medication, Prescription


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ["id", "name", "dosage", "frequency", "duration"]


class ConsultationNoteSerializer(serializers.ModelSerializer):
    appointmentId = serializers.IntegerField(source="appointment_id")
    patientId = serializers.IntegerField(source="appointment.patient_id", read_only=True)
    doctorId = serializers.IntegerField(source="appointment.doctor_id", read_only=True)
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
    patientId = serializers.IntegerField(source="appointment.patient_id", read_only=True)
    doctorId = serializers.IntegerField(source="appointment.doctor_id", read_only=True)
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
        medications = validated.pop("medications", [])
        prescription = Prescription.objects.create(**validated)
        for item in medications:
            medication, _ = Medication.objects.get_or_create(
                name=item["name"],
                defaults={
                    "dosage": item.get("dosage", ""),
                    "frequency": item.get("frequency", ""),
                    "duration": item.get("duration", ""),
                },
            )
            prescription.medications.add(medication)
        return prescription
