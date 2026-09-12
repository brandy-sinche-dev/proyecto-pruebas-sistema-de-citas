from django.contrib import admin

from .models import Box


@admin.register(Box)
class BoxAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "area", "floor", "status", "doctor", "active")
    list_filter = ("status", "active", "floor")