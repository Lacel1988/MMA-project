from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError

from ..models import Fighter, Division
from ..services.ufcstats_registry import is_known_fighter


class DivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = "__all__"


class FighterSerializer(serializers.ModelSerializer):
    # Kimenethez: részletes division objektum
    division = DivisionSerializer(read_only=True)

    # Bemenethez: division id, hogy lehessen POST-olni
    division_id = serializers.PrimaryKeyRelatedField(
        queryset=Division.objects.all(),
        source="division",
        write_only=True,
        required=True,
    )

    class Meta:
        model = Fighter
        fields = "__all__"

    def validate_name(self, value: str) -> str:
        name = " ".join((value or "").strip().split())
        if not name:
            raise serializers.ValidationError("Name cannot be empty.")

        if not is_known_fighter(name):
            raise serializers.ValidationError("Fighter name is not present in UFCStats CSV reference.")

        return name

    def create(self, validated_data):
        obj = Fighter(**validated_data)
        # Model validatorok + clean() is lefut, ha te raktál bele
        try:
            obj.full_clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        obj.save()
        return obj

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        try:
            instance.full_clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)

        instance.save()
        return instance
