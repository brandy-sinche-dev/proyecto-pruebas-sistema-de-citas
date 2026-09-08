from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("apps.authentication.urls")),
    path("api/v1/", include("apps.users.urls")),
    path("api/v1/", include("apps.patients.urls")),
    path("api/v1/", include("apps.doctors.urls")),
    path("api/v1/", include("apps.specialties.urls")),
    path("api/v1/", include("apps.schedules.urls")),
    path("api/v1/", include("apps.appointments.urls")),
    path("api/v1/", include("apps.notifications.urls")),
    path("api/v1/", include("apps.audit.urls")),
    path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/v1/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
