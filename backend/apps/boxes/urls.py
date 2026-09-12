from rest_framework.routers import DefaultRouter

from .views import BoxViewSet

router = DefaultRouter()
router.register("boxes", BoxViewSet, basename="boxes")

urlpatterns = router.urls