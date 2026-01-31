from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    TopicViewSet,
    PostViewSet,
    ReplyViewSet,
    PostLikeViewSet,
)

router = DefaultRouter()

# REST CRUD végpontok:
# GET    /resource/        → lista
# POST   /resource/        → létrehozás
# GET    /resource/{id}/   → részletek
# PUT    /resource/{id}/   → teljes módosítás
# PATCH  /resource/{id}/   → részleges módosítás
# DELETE /resource/{id}/   → törlés

router.register(r"categories", CategoryViewSet)
router.register(r"topics", TopicViewSet)
router.register(r"posts", PostViewSet)
router.register(r"replies", ReplyViewSet)
router.register(r"likes", PostLikeViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
