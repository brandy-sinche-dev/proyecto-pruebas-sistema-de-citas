from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "module", "action", "user", "status_code", "path")
    list_filter = ("module", "action", "method", "status_code")
    search_fields = ("path", "action")
