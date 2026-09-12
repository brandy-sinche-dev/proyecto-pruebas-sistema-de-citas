"""Endpoints de autenticación, healthcheck y registro."""

from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from apps.patients.services import create_patient_profile
from apps.users.serializers import UserSerializer

from .serializers import LoginResponseSerializer, LoginSerializer, RegisterSerializer
from .services import blacklist_refresh_token, database_is_healthy


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        create_patient_profile(user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=LoginSerializer, responses={200: LoginResponseSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user
        if not user.is_active:
            return Response({"detail": "Cuenta desactivada"}, status=status.HTTP_403_FORBIDDEN)
        return Response(
            {
                "access": serializer.validated_data["access"],
                "refresh": serializer.validated_data["refresh"],
                "user": UserSerializer(user).data,
            }
        )


class LogoutView(APIView):
    """Invalida un refresh token del lado del cliente (lista negra simple en BD)."""

    def post(self, request):
        blacklist_refresh_token(request.data.get("refresh"))
        return Response(status=status.HTTP_204_NO_CONTENT)


class RefreshView(TokenRefreshView):
    """POST /auth/refresh/ con `{refresh}` — implementado por SimpleJWT."""


class HealthView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses={200: dict})
    def get(self, request):
        db_ok = database_is_healthy()
        return Response(
            {
                "status": "ok" if db_ok else "degraded",
                "database": "ok" if db_ok else "error",
                "time": timezone.now().isoformat(),
            },
            status=status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE,
        )
