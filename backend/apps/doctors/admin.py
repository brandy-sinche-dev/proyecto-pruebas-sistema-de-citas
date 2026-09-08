from django.contrib import admin

from .models import DoctorProfile


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "specialty", "license_number", "box", "available")
    list_filter = ("available", "specialty")
    search_fields = ("user__first_name", "user__last_name", "license_number")
