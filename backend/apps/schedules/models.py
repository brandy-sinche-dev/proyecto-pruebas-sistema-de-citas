from django.db import models

from apps.users.choices import AvailabilityStatus


class Availability(models.Model):
    doctor = models.ForeignKey("doctors.DoctorProfile", on_delete=models.CASCADE, related_name="availability")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(
        max_length=16,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.ACTIVE.value,
    )
    box = models.CharField(max_length=16, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "schedules_availability"
        ordering = ["date", "start_time"]
        constraints = [
            models.UniqueConstraint(fields=["doctor", "date"], name="schedules_doctor_date_unique"),
            models.CheckConstraint(
                check=models.Q(start_time__lt=models.F("end_time")),
                name="schedules_time_range_valid",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.doctor.user.full_name} {self.date} {self.start_time}-{self.end_time}"
