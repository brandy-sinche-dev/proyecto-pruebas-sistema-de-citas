from rest_framework.routers import DefaultRouter

from .views import BillingViewSet, InsuranceViewSet

router = DefaultRouter()
router.register("insurance", InsuranceViewSet, basename="insurance")
router.register("billing", BillingViewSet, basename="billing")

urlpatterns = router.urls