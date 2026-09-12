from rest_framework import serializers

from .models import Specialty
from .services import create_specialty


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ["id", "name", "description", "color", "icon", "fee"]

    def create(self, validated):
        return create_specialty(**validated)
