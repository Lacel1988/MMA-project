from django.contrib import admin
from .models import Division, Fighter

@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ("name", "min_weight", "max_weight")


@admin.register(Fighter)
class FighterAdmin(admin.ModelAdmin):
    list_display = ("name", "division", "reach", "wins", "losses", "draw")

    fields = (
        "name",
        "division",
        "nickname",

        "age",
        "weight",
        "height",
        "reach",

        "upload_image",
        "details_cover",

        "wins",
        "losses",
        "draw",

        "description",
        "bio_long",
    )
