from django.db import models


class Specialty(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True, default="")
    color = models.CharField(max_length=16, blank=True, default="")
    icon = models.CharField(max_length=64, blank=True, default="")

    class Meta:
        db_table = "specialties_specialty"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
