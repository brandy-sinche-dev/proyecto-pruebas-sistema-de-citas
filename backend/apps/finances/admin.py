from django.contrib import admin

from .models import Billing, Insurance


@admin.register(Insurance)
class InsuranceAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "coverage_percent", "active")
    list_filter = ("active",)


@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "appointment",
        "insurance",
        "gross_amount",
        "insurance_amount",
        "copay_amount",
        "payment_method",
        "status",
    )
    list_filter = ("status", "payment_method")