from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory

from ufcstats.api.ufc_radar import (
    _aggregate_for_fighter,
    _event_dates_map,
    _fight_results_map,
    _fighter_last_fights_keys,
    _fight_duration_seconds,
    _parse_of,
    _parse_time_mmss,
    _pct,
    _per15,
    ufc_radar,
)


class RadarParsingTests(SimpleTestCase):
    def test_parse_of(self):
        self.assertEqual(_parse_of("10 of 20"), (10, 20))
        self.assertEqual(_parse_of("---"), (0, 0))
        self.assertEqual(_parse_of(""), (0, 0))
        self.assertEqual(_parse_of("broken"), (0, 0))

    def test_parse_time_mmss(self):
        self.assertEqual(_parse_time_mmss("2:15"), 135)
        self.assertEqual(_parse_time_mmss("---"), 0)
        self.assertEqual(_parse_time_mmss(""), 0)
        self.assertEqual(_parse_time_mmss("99"), 0)

    def test_fight_duration_seconds(self):
        # round 2, time 1:00 => 300 (round1) + 60
        self.assertEqual(_fight_duration_seconds(2, "1:00"), 360)
        self.assertEqual(_fight_duration_seconds(0, "1:00"), 0)
        self.assertEqual(_fight_duration_seconds(1, "---"), 0)

    def test_pct_and_per15(self):
        self.assertEqual(_pct(1, 0), 0.0)
        self.assertAlmostEqual(_pct(5, 10), 50.0)

        # 3 count over 900 sec (15 min) => 3 per15
        self.assertAlmostEqual(_per15(3, 900), 3.0)
        self.assertEqual(_per15(3, 0), 0.0)


class RadarCsvIntegrationTests(SimpleTestCase):
    def setUp(self):
        # Clear caches before each test, otherwise lru_cache keeps old file content
        _event_dates_map.cache_clear()
        _fight_results_map.cache_clear()

    def _write(self, path: Path, content: str):
        path.write_text(content, encoding="utf-8")

    def test_last_fights_keys_sorted_by_event_date(self):
        with TemporaryDirectory() as td:
            td = Path(td)

            events_csv = td / "ufc_event_details.csv"
            results_csv = td / "ufc_fight_results.csv"
            stats_csv = td / "ufc_fight_stats.csv"

            # IMPORTANT: dates contain commas, so they must be quoted in CSV
            self._write(
                events_csv,
                "EVENT,DATE\n"
                "EV1,\"January 01, 2024\"\n"
                "EV2,\"February 01, 2024\"\n"
                "EV3,\"March 01, 2024\"\n",
            )

            # Not used in this specific test but required for existence checks in view
            self._write(results_csv, "EVENT,BOUT,OUTCOME,METHOD,ROUND,TIME,WEIGHTCLASS\n")

            self._write(
                stats_csv,
                "EVENT,BOUT,FIGHTER,KD,SUB.ATT,SIG.STR.,TD,CTRL\n"
                "EV1,B1,John Doe,0,0,1 of 2,0 of 0,0:10\n"
                "EV2,B2,John Doe,0,0,1 of 2,0 of 0,0:10\n"
                "EV3,B3,John Doe,0,0,1 of 2,0 of 0,0:10\n",
            )

            with patch("ufcstats.api.ufc_radar.EVENTS_CSV", events_csv), patch(
                "ufcstats.api.ufc_radar.RESULTS_CSV", results_csv
            ), patch("ufcstats.api.ufc_radar.STATS_CSV", stats_csv):
                _event_dates_map.cache_clear()
                keys = _fighter_last_fights_keys("John Doe", last_n=2)

                # EV3 is newest, then EV2
                self.assertEqual(keys, [("EV3", "B3"), ("EV2", "B2")])

    def test_aggregate_for_fighter_metrics_inputs(self):
        with TemporaryDirectory() as td:
            td = Path(td)

            events_csv = td / "ufc_event_details.csv"
            results_csv = td / "ufc_fight_results.csv"
            stats_csv = td / "ufc_fight_stats.csv"

            self._write(
                events_csv,
                "EVENT,DATE\n"
                "EV1,\"January 01, 2024\"\n",
            )

            # Round 1 time 1:00 => 60 sec duration
            self._write(
                results_csv,
                "EVENT,BOUT,OUTCOME,METHOD,ROUND,TIME,WEIGHTCLASS\n"
                "EV1,B1,Win,KO,1,1:00,Lightweight\n",
            )

            self._write(
                stats_csv,
                "EVENT,BOUT,FIGHTER,KD,SUB.ATT,SIG.STR.,TD,CTRL\n"
                "EV1,B1,John Doe,1,2,10 of 20,1 of 3,0:30\n",
            )

            with patch("ufcstats.api.ufc_radar.EVENTS_CSV", events_csv), patch(
                "ufcstats.api.ufc_radar.RESULTS_CSV", results_csv
            ), patch("ufcstats.api.ufc_radar.STATS_CSV", stats_csv):
                _event_dates_map.cache_clear()
                _fight_results_map.cache_clear()

                agg = _aggregate_for_fighter("John Doe", last_n=5)
                self.assertIsNotNone(agg)
                self.assertEqual(agg.fights, 1)
                self.assertEqual(agg.kd, 1)
                self.assertEqual(agg.sub_att, 2)
                self.assertEqual(agg.sig_landed, 10)
                self.assertEqual(agg.sig_att, 20)
                self.assertEqual(agg.td_landed, 1)
                self.assertEqual(agg.td_att, 3)
                self.assertEqual(agg.ctrl_sec, 30)
                self.assertEqual(agg.dur_sec, 60)

    def test_view_returns_400_when_missing_fighter(self):
        factory = APIRequestFactory()
        request = factory.get("/api/ufc/radar")
        response = ufc_radar(request)
        self.assertEqual(response.status_code, 400)

    def test_view_returns_404_when_no_fights_found(self):
        with TemporaryDirectory() as td:
            td = Path(td)
            events_csv = td / "ufc_event_details.csv"
            results_csv = td / "ufc_fight_results.csv"
            stats_csv = td / "ufc_fight_stats.csv"

            self._write(events_csv, "EVENT,DATE\nEV1,\"January 01, 2024\"\n")
            self._write(results_csv, "EVENT,BOUT,OUTCOME,METHOD,ROUND,TIME,WEIGHTCLASS\n")
            self._write(stats_csv, "EVENT,BOUT,FIGHTER,KD,SUB.ATT,SIG.STR.,TD,CTRL\n")

            with patch("ufcstats.api.ufc_radar.EVENTS_CSV", events_csv), patch(
                "ufcstats.api.ufc_radar.RESULTS_CSV", results_csv
            ), patch("ufcstats.api.ufc_radar.STATS_CSV", stats_csv):
                _event_dates_map.cache_clear()
                _fight_results_map.cache_clear()

                factory = APIRequestFactory()
                request = factory.get("/api/ufc/radar?fighter=John%20Doe&last=5")
                response = ufc_radar(request)
                self.assertEqual(response.status_code, 404)
