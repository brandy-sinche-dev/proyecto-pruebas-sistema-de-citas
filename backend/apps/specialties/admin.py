from django.contrib import admin

from .models import Specialty


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ("name", "color", "icon")
    search_fields = ("name",)
