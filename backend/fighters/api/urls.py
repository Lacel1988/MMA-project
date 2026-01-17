from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .figther_admin_views import admin_update_fighter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView



from .views import FighterViewSet, DivisionViewSet, RegisterView, MeView

router = DefaultRouter()
router.register(r"fighters", FighterViewSet, basename="fighters")
router.register(r"divisions", DivisionViewSet, basename="divisions")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/register/", RegisterView.as_view(), name="auth_register"),
    path("auth/me/", MeView.as_view(), name="auth_me"),
    path("fighters/<int:fighter_id>/admin/", admin_update_fighter, name="admin_update_fighter"),
]
