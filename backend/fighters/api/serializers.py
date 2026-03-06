from rest_framework import serializers
from ..models import Division, Fighter


class DivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = ["id", "name", "min_weight", "max_weight"]


class FighterSerializer(serializers.ModelSerializer):
    division = DivisionSerializer(read_only=True)

    upload_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Fighter
        fields = [
            "id",
            "name",
            "division",
            "nickname",
            "age",

            "wins",
            "losses",
            "draw",

            # ha nálad már ezek az új mezők vannak
            "height_in",
            "weight_lbs",
            "reach_in",

            "description",
            "bio_long",
            "ufcstats_url",

            # eredeti image field (path)
            "upload_image",

            # uj fix URL mezok
            "upload_image_url",
        ]

    def _abs(self, request, rel_url: str):
        if not rel_url:
            return None
        if request is None:
            return rel_url
        return request.build_absolute_uri(rel_url)

    def get_upload_image_url(self, obj: Fighter):
        request = self.context.get("request")
        if obj.upload_image and hasattr(obj.upload_image, "url"):
            return self._abs(request, obj.upload_image.url)
        return None
