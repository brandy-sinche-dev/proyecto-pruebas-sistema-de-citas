from rest_framework import serializers

from .models import Notification
from .services import mark_read


class NotificationSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source="user_id", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "userId", "message", "read", "createdAt"]

    def update(self, instance, validated_data):
        return mark_read(instance, validated_data.get("read", instance.read))


class NotificationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["read"]
