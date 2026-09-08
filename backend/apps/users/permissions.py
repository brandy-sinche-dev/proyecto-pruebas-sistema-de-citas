"""Permisos por rol basados en el modelo de ususario."""

from rest_framework.permissions import BasePermission

from apps.users.choices import Role


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.ADMIN.value)


class IsReceptionist(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.RECEPTIONIST.value)


class IsDoctorRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.DOCTOR.value)


class IsDoctorOrReceptionist(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (Role.DOCTOR.value, Role.RECEPTIONIST.value)
        )


class IsStaffRole(BasePermission):
    """Admin, recepción o médico."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (Role.ADMIN.value, Role.RECEPTIONIST.value, Role.DOCTOR.value)
        )


class IsOwnObject(BasePermission):
    """El usuario solo puede operar sobre recursos que le pertenecen."""

    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id
