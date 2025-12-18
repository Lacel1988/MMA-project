from django.urls import path
from .ufc_radar import ufc_radar

urlpatterns = [
    path("ufc/radar/", ufc_radar),
]
