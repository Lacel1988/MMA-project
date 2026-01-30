from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError


class Division(models.Model):
    name = models.CharField(max_length=100)
    min_weight = models.DecimalField(max_digits=5, decimal_places=2)
    max_weight = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return self.name


class Fighter(models.Model):
    division = models.ForeignKey(
        Division,
        on_delete=models.CASCADE,
        related_name="fighters",
    )

    name = models.CharField(max_length=100)

    age = models.PositiveIntegerField(
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ]
    )

    weight = models.DecimalField(max_digits=5, decimal_places=2)
    height = models.DecimalField(max_digits=5, decimal_places=2)
    reach = models.PositiveSmallIntegerField(null=True, blank=True)

    wins = models.PositiveIntegerField(default=0)
    losses = models.PositiveIntegerField(default=0)
    draw = models.PositiveIntegerField(default=0)

    nickname = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    upload_image = models.ImageField(
        upload_to="fighters/images/",
        null=True,
        blank=True,
    )
    details_cover = models.ImageField(
        upload_to="fighters/details/",
        null=True,
        blank=True,
    )

    bio_long = models.TextField(
        null=True,
        blank=True,
    )

    def clean(self):
        super().clean()

        
        name = (self.name or "").strip()
        if not name:
            raise ValidationError({"name": "Name cannot be empty."})

    
        try:
            from fighters.services.ufcstats_registry import is_known_fighter
        except Exception:
        
            raise ValidationError({"name": "Name validation service is unavailable."})

        if not is_known_fighter(name):
            raise ValidationError({"name": "Fighter name is not present in UFCStats CSV reference."})


        self.name = name

    def __str__(self):
        return self.name
