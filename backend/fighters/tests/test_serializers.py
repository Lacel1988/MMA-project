from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.test import TestCase
from fighters.models import Division
from fighters.services.ufcstats_registry import known_fighter_names
from fighters.api.serializers import FighterSerializer


class FighterSerializerTests(TestCase):
    def setUp(self):
        known_fighter_names.cache_clear()
        self.division = Division.objects.create(name="Lightweight", min_weight="66.00", max_weight="70.00")

    def test_rejects_unknown_name(self):
        with TemporaryDirectory() as td:
            td = Path(td)
            csv_path = td / "ufc_fighter_details.csv"
            csv_path.write_text(
                "FIRST,LAST,NICKNAME,URL\n"
                "Jon,Jones,,http://ufcstats.com/fighter-details/x\n",
                encoding="utf-8",
            )

            with patch("fighters.services.ufcstats_registry.UFC_FIGHTER_DETAILS_CSV", csv_path):
                known_fighter_names.cache_clear()

                data = {
                    "name": "Jon Jons",  # elgépelés
                    "division_id": self.division.id,
                    "age": 30,
                    "weight": "70.00",
                    "height": "180.00",
                    "wins": 0,
                    "losses": 0,
                    "draw": 0,
                }

                serializer = FighterSerializer(data=data)
                self.assertFalse(serializer.is_valid())
                self.assertIn("name", serializer.errors)

    def test_accepts_known_name(self):
        with TemporaryDirectory() as td:
            td = Path(td)
            csv_path = td / "ufc_fighter_details.csv"
            csv_path.write_text(
                "FIRST,LAST,NICKNAME,URL\n"
                "Jon,Jones,,http://ufcstats.com/fighter-details/x\n",
                encoding="utf-8",
            )

            with patch("fighters.services.ufcstats_registry.UFC_FIGHTER_DETAILS_CSV", csv_path):
                known_fighter_names.cache_clear()

                data = {
                    "name": "Jon Jones",
                    "division_id": self.division.id,
                    "age": 30,
                    "weight": "70.00",
                    "height": "180.00",
                    "wins": 0,
                    "losses": 0,
                    "draw": 0,
                }

                serializer = FighterSerializer(data=data)
                self.assertTrue(serializer.is_valid(), serializer.errors)
