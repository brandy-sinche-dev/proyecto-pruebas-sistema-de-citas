from django.db import models

from apps.users.choices import BillingStatus, PaymentMethod


class Insurance(models.Model):
    """Aseguradora / convenio con el que se financia parte de la consulta."""

    code = models.CharField(max_length=16, unique=True)
    name = models.CharField(max_length=120)
    coverage_percent = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "finances_insurance"
        ordering = ["name"]
        constraints = [
            models.CheckConstraint(check=models.Q(coverage_percent__lte=100), name="finances_insurance_coverage_max"),
        ]

    def __str__(self) -> str:
        return self.name


class Billing(models.Model):
    """Liquidación de una cita: monto bruto, cobertura aseguradora y copago."""

    code = models.CharField(max_length=32, unique=True, editable=False)
    appointment = models.OneToOneField(
        "appointments.Appointment", on_delete=models.PROTECT, related_name="billing"
    )
    insurance = models.ForeignKey(
        Insurance, on_delete=models.SET_NULL, null=True, blank=True, related_name="billings"
    )
    gross_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    insurance_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    copay_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(
        max_length=16, choices=PaymentMethod.choices, default=PaymentMethod.CASH.value
    )
    status = models.CharField(max_length=16, choices=BillingStatus.choices, default=BillingStatus.PENDING.value)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "finances_billing"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.code} — {self.appointment.code}"

    def save(self, *args, **kwargs):
        if not self.code:
            from .services import next_billing_code

            self.code = next_billing_code(self.appointment.date.year)
        super().save(*args, **kwargs)