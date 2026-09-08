from django.contrib import admin

from .models import Availability


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ("doctor", "date", "start_time", "end_time", "status", "box")
    list_filter = ("status", "date")
    search_fields = ("doctor__user__first_name", "doctor__user__last_name")
