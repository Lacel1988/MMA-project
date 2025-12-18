import csv
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from datetime import datetime

from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response


DATA_DIR = Path(settings.BASE_DIR) / "data" / "ufcstats"
EVENTS_CSV = DATA_DIR / "ufc_event_details.csv"
RESULTS_CSV = DATA_DIR / "ufc_fight_results.csv"
STATS_CSV = DATA_DIR / "ufc_fight_stats.csv"


def _parse_event_date(s: str):
    s = (s or "").strip()
    return datetime.strptime(s, "%B %d, %Y").date()


def _parse_of(s: str):
    s = (s or "").strip()
    if not s or s == "---":
        return (0, 0)
    parts = s.split("of")
    if len(parts) != 2:
        return (0, 0)
    a = parts[0].strip()
    b = parts[1].strip()
    try:
        return (int(a), int(b))
    except:
        return (0, 0)


def _parse_time_mmss(s: str):
    s = (s or "").strip()
    if not s or s == "---":
        return 0
    if ":" not in s:
        return 0
    mm, ss = s.split(":", 1)
    try:
        return int(mm) * 60 + int(ss)
    except:
        return 0


def _fight_duration_seconds(finish_round: int, finish_time_mmss: str):
    t = _parse_time_mmss(finish_time_mmss)
    r = int(finish_round) if finish_round else 0
    if r <= 0:
        return 0
    return (r - 1) * 300 + t


@lru_cache(maxsize=1)
def _event_dates_map():
    if not EVENTS_CSV.exists():
        return {}
    out = {}
    with EVENTS_CSV.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            ev = (row.get("EVENT") or "").strip()
            ds = (row.get("DATE") or "").strip()
            if not ev or not ds:
                continue
            try:
                out[ev] = _parse_event_date(ds)
            except:
                continue
    return out


@lru_cache(maxsize=1)
def _fight_results_map():
    if not RESULTS_CSV.exists():
        return {}
    out = {}
    with RESULTS_CSV.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            ev = (row.get("EVENT") or "").strip()
            bout = (row.get("BOUT") or "").strip()
            if not ev or not bout:
                continue
            out[(ev, bout)] = {
                "outcome": (row.get("OUTCOME") or "").strip(),
                "method": (row.get("METHOD") or "").strip(),
                "round": (row.get("ROUND") or "").strip(),
                "time": (row.get("TIME") or "").strip(),
                "weightclass": (row.get("WEIGHTCLASS") or "").strip(),
            }
    return out


@dataclass
class Agg:
    fights: int = 0
    sig_landed: int = 0
    sig_att: int = 0
    td_landed: int = 0
    td_att: int = 0
    kd: int = 0
    sub_att: int = 0
    ctrl_sec: int = 0
    dur_sec: int = 0


def _fighter_last_fights_keys(fighter_name: str, last_n: int):
    fighter_name = (fighter_name or "").strip()
    if not fighter_name:
        return []

    event_dates = _event_dates_map()

    fights_set = set()
    with STATS_CSV.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            if (row.get("FIGHTER") or "").strip() != fighter_name:
                continue
            ev = (row.get("EVENT") or "").strip()
            bout = (row.get("BOUT") or "").strip()
            if ev and bout:
                fights_set.add((ev, bout))

    fights = list(fights_set)
    fights.sort(key=lambda k: event_dates.get(k[0], datetime(1900, 1, 1).date()), reverse=True)
    return fights[: max(0, int(last_n))]


def _aggregate_for_fighter(fighter_name: str, last_n: int):
    keys = _fighter_last_fights_keys(fighter_name, last_n)
    if not keys:
        return None

    wanted = set(keys)
    results = _fight_results_map()

    agg = Agg(fights=len(keys))

    for (ev, bout) in keys:
        res = results.get((ev, bout))
        if not res:
            continue
        try:
            r = int(res.get("round") or "0")
        except:
            r = 0
        t = res.get("time") or ""
        agg.dur_sec += _fight_duration_seconds(r, t)

    with STATS_CSV.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            if (row.get("FIGHTER") or "").strip() != fighter_name:
                continue
            ev = (row.get("EVENT") or "").strip()
            bout = (row.get("BOUT") or "").strip()
            if (ev, bout) not in wanted:
                continue

            agg.kd += int(float(row.get("KD") or 0) or 0)
            agg.sub_att += int(float(row.get("SUB.ATT") or 0) or 0)

            sig_l, sig_a = _parse_of(row.get("SIG.STR.") or "")
            agg.sig_landed += sig_l
            agg.sig_att += sig_a

            td_l, td_a = _parse_of(row.get("TD") or "")
            agg.td_landed += td_l
            agg.td_att += td_a

            agg.ctrl_sec += _parse_time_mmss(row.get("CTRL") or "")

    return agg


def _pct(landed: int, att: int):
    if att <= 0:
        return 0.0
    return (landed / att) * 100.0


def _per15(count: int, dur_sec: int):
    if dur_sec <= 0:
        return 0.0
    mins = dur_sec / 60.0
    return (count / mins) * 15.0


@api_view(["GET"])
def ufc_radar(request):
    fighter = (request.query_params.get("fighter") or "").strip()
    last_n = int(request.query_params.get("last") or 5)

    if not fighter:
        return Response({"error": "Missing ?fighter="}, status=400)

    if not STATS_CSV.exists() or not RESULTS_CSV.exists() or not EVENTS_CSV.exists():
        return Response(
            {"error": "Missing CSV files under data/ufcstats (event_details, fight_results, fight_stats)."},
            status=500,
        )

    agg = _aggregate_for_fighter(fighter, last_n)
    if not agg:
        return Response({"error": f"No fights found in stats CSV for fighter '{fighter}'."}, status=404)

    return Response({
        "fighter": fighter,
        "last": last_n,
        "fights_count": agg.fights,
        "duration_total_sec": agg.dur_sec,
        "metrics": {
            "sig_str_acc_pct": round(_pct(agg.sig_landed, agg.sig_att), 2),
            "td_acc_pct": round(_pct(agg.td_landed, agg.td_att), 2),
            "kd_per15": round(_per15(agg.kd, agg.dur_sec), 3),
            "sub_att_per15": round(_per15(agg.sub_att, agg.dur_sec), 3),
            "ctrl_sec_per15": round(_per15(agg.ctrl_sec, agg.dur_sec), 1),
        }
    })
