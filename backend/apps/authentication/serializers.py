"""Serializers de autenticación: registro, login con tokens + usuario y refresh."""

import re

from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.users.choices import Role
from apps.users.serializers import UserSerializer

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=150)
    lastName = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return value.lower()

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Este usuario ya está registrado.")
        return value

    def validate_password(self, value: str) -> str:
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Debe incluir una letra mayúscula.")
        if not re.search(r"[0-9]", value):
            raise serializers.ValidationError("Debe incluir un número.")
        return value

    def create(self, validated):
        password = validated.pop("password")
        user = User(
            username=validated["username"],
            email=validated["email"],
            first_name=validated["firstName"],
            last_name=validated["lastName"],
            role=Role.PATIENT.value,
            is_active=True,
        )
        user.set_password(password)
        user.save()
        return user


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
