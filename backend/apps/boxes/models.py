from django.db import models

from apps.users.choices import BoxStatus


class Box(models.Model):
    code = models.CharField(max_length=16, unique=True)
    name = models.CharField(max_length=120)
    area = models.CharField(max_length=120, blank=True, default="")
    floor = models.CharField(max_length=64, blank=True, default="")
    status = models.CharField(max_length=16, choices=BoxStatus.choices, default=BoxStatus.FREE.value)
    doctor = models.ForeignKey(
        "doctors.DoctorProfile", on_delete=models.SET_NULL, null=True, blank=True, related_name="boxes"
    )
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "boxes_box"
        ordering = ["code"]

    def __str__(self) -> str:
        return self.name