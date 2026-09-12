"""Serializers de autenticación: registro, login con tokens + usuario y refresh."""

from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.users.serializers import UserSerializer

from .services import (
    PasswordValidationError,
    create_patient_user,
    email_taken,
    username_taken,
    validate_password_strength,
)

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=150)
    lastName = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value: str) -> str:
        if email_taken(value):
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return value.lower()

    def validate_username(self, value: str) -> str:
        if username_taken(value):
            raise serializers.ValidationError("Este usuario ya está registrado.")
        return value

    def validate_password(self, value: str) -> str:
        try:
            validate_password_strength(value)
        except PasswordValidationError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        return value

    def create(self, validated):
        password = validated.pop("password")
        return create_patient_user(
            username=validated["username"],
            email=validated["email"],
            first_name=validated["firstName"],
            last_name=validated["lastName"],
            password=password,
        )


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.full_name
        return token


class LoginResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()
