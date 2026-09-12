"""Reglas de negocio de finanzas: cálculo de liquidaciones según arancel y cobertura."""

from decimal import ROUND_HALF_UP, Decimal

from django.db.models import Max

from .models import Billing


class BillingValidationError(ValueError):
    pass


def next_billing_code(year: int) -> str:
    last = Billing.objects.filter(code__startswith=f"LIQ-{year}-").aggregate(max_code=Max("code"))["max_code"]
    seq = 1
    if last:
        try:
            seq = int(last.split("-")[-1]) + 1
        except ValueError:
            seq = 1
    return f"LIQ-{year}-{seq:05d}"


def _as_decimal(value) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_amounts(*, fee, coverage_percent: int) -> dict:
    """Dado el arancel y el % de cobertura, calcula monto bruto, monto aseguradora y copago."""
    gross = _as_decimal(fee or 0)
    coverage = Decimal(coverage_percent or 0)
    insurance_amount = (gross * coverage / Decimal(100)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    copay = gross - insurance_amount
    return {
        "gross_amount": gross,
        "insurance_amount": insurance_amount,
        "copay_amount": copay,
    }


def create_billing(*, appointment, payment_method: str = "CASH", status: str = "PENDING") -> Billing:
    if hasattr(appointment, "billing"):
        raise BillingValidationError("La cita ya tiene una liquidación registrada.")

    insurance = appointment.patient.insurance
    coverage = insurance.coverage_percent if insurance and insurance.active else 0
    amounts = calculate_amounts(fee=appointment.specialty.fee, coverage_percent=coverage)

    return Billing.objects.create(
        appointment=appointment,
        insurance=insurance,
        payment_method=payment_method,
        status=status,
        **amounts,
    )


def update_billing(billing, *, payment_method=None, status=None):
    if payment_method:
        billing.payment_method = payment_method
    if status:
        billing.status = status
    billing.save()
    return billing