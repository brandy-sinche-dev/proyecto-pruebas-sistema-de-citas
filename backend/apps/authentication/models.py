from django.db import models


class BlacklistedToken(models.Model):
    token = models.CharField(max_length=512, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "authentication_blacklistedtoken"
