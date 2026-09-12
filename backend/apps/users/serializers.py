from rest_framework import serializers

from .models import User
from .services import update_profile


class UserSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source="full_name", read_only=True)
    isActive = serializers.BooleanField(source="is_active", read_only=True)
    firstName = serializers.CharField(source="first_name")
    lastName = serializers.CharField(source="last_name")

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "firstName",
            "lastName",
            "fullName",
            "role",
            "phone",
            "isActive",
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source="first_name", required=False)
    lastName = serializers.CharField(source="last_name", required=False)

    class Meta:
        model = User
        fields = ["firstName", "lastName", "email", "phone"]
        extra_kwargs = {"email": {"required": False}}

    def update(self, instance, validated_data):
        return update_profile(instance, validated_data)
