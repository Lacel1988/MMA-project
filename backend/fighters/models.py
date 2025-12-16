from django.db import models

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
        related_name="fighters"
    )

    name = models.CharField(max_length=100)
    age = models.IntegerField()
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    height = models.DecimalField(max_digits=5, decimal_places=2)
    reach = models.PositiveSmallIntegerField(null=True, blank=True)

    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    draw = models.IntegerField(default=0)

    nickname = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    upload_image = models.ImageField(
        upload_to="fighters/images/",
        null=True,
        blank=True
    )
    details_cover = models.ImageField(
        upload_to="fighters/details/",
        null=True,
        blank=True
    )

    bio_long = models.TextField(
        null=True,
        blank=True
    )

    def __str__(self):
        return self.name
