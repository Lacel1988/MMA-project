from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.test import SimpleTestCase

from fighters.services.ufcstats_registry import known_fighter_names, is_known_fighter


class UfcStatsRegistryTests(SimpleTestCase):
    def setUp(self):
        known_fighter_names.cache_clear()

    def test_known_fighter_name_matches(self):
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
                self.assertTrue(is_known_fighter("Jon Jones"))
                self.assertTrue(is_known_fighter("  jon   jones  "))
                self.assertFalse(is_known_fighter("Jon Jons"))
