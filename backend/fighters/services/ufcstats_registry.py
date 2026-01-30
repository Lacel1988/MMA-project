import csv
from functools import lru_cache
from pathlib import Path

from django.conf import settings


DATA_DIR = Path(settings.BASE_DIR) / "data" / "ufcstats"
FIGHTERS_CSV = DATA_DIR / "ufc_fighter_details.csv"


def _normalize_name(name: str) -> str:
    # whitespace normalizálás + kisbetű
    return " ".join((name or "").strip().split()).lower()


@lru_cache(maxsize=1)
def _known_fighters_set() -> set[str]:
    if not FIGHTERS_CSV.exists():
        return set()

    out: set[str] = set()

    with FIGHTERS_CSV.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        if not r.fieldnames:
            return set()

        # Elvárt mezők a te CSV-dben
        has_first = "FIRST" in r.fieldnames
        has_last = "LAST" in r.fieldnames

        if not (has_first and has_last):
            # Ha valamiért más lett a header, inkább legyen üres, mint rossz
            return set()

        for row in r:
            first = (row.get("FIRST") or "").strip()
            last = (row.get("LAST") or "").strip()
            full = f"{first} {last}".strip()

            if full:
                out.add(_normalize_name(full))

    return out


def is_known_fighter(name: str) -> bool:
    return _normalize_name(name) in _known_fighters_set()


def clear_cache():
    _known_fighters_set.cache_clear()
