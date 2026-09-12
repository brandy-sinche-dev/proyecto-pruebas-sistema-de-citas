"""Reglas de negocio de notificaciones: creación automática y marcado como leídas."""

from .models import Notification


def notify_user(user, message: str) -> Notification:
    """Crea una notificación para un usuario (no autenticado o nulo se ignora)."""
    if user is None or getattr(user, "is_anonymous", False):
        return None
    return Notification.objects.create(user=user, message=message)


def mark_read(notification: Notification, read: bool = True) -> Notification:
    notification.read = bool(read)
    notification.save(update_fields=["read"])
    return notification