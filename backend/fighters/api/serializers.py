from rest_framework import serializers
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
        write_only=True
    )

    class Meta:
        model = Fighter
        fields = "__all__"

    def validate_name(self, value: str) -> str:
        if not is_known_fighter(value):
            raise serializers.ValidationError("Unknown fighter name (not found in UFCStats reference list).")
        return value
