from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source="user_id", read_only=True)
    userName = serializers.CharField(source="user_name", read_only=True)
    timestamp = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "userId",
            "userName",
            "action",
            "module",
            "method",
            "path",
            "status_code",
            "metadata",
            "timestamp",
        ]
