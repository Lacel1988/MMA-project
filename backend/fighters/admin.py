from django.contrib import admin
from .models import Division, Fighter


@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ("name", "min_weight", "max_weight")


@admin.register(Fighter)
class FighterAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "division",
        "height_in",
        "reach_in",
        "weight_lbs",
        "wins",
        "losses",
        "draw",
    )

    fields = (
        "name",
        "division",
        "nickname",
        "age",

        # Imperial base values (toggle-friendly)
        "weight_lbs",
        "height_in",
        "reach_in",

        "upload_image",

        "wins",
        "losses",
        "draw",

        "description",
        "bio_long",
    )

    def save_model(self, request, obj, form, change):
        # Kényszerítjük a model clean() futását admin mentés előtt is
        obj.full_clean()
        super().save_model(request, obj, form, change)