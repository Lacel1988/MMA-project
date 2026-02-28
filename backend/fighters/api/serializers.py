from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError

from ..models import Fighter, Division
from ..services.ufcstats_registry import is_known_fighter


class DivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = "__all__"


class FighterSerializer(serializers.ModelSerializer):
    division = DivisionSerializer(read_only=True)

    division_id = serializers.PrimaryKeyRelatedField(
        queryset=Division.objects.all(),
        source="division",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Fighter
        fields = "__all__"

    def validate(self, attrs):
        name = " ".join((attrs.get("name") or "").strip().split())
        url = attrs.get("ufcstats_url") or None

        if not name:
            raise serializers.ValidationError({"name": "Name cannot be empty."})

        # URL-val együtt validálunk, ha van
        if not is_known_fighter(name, url):
            raise serializers.ValidationError({"name": "Fighter name is not present in UFCStats CSV reference."})

        attrs["name"] = name
        return attrs

    def create(self, validated_data):
        obj = Fighter(**validated_data)
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