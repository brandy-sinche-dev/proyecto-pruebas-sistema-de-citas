from django.contrib import admin

from .models import PatientProfile


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "document_number", "gender", "blood_type")
    search_fields = ("user__username", "user__first_name", "user__last_name", "document_number")
