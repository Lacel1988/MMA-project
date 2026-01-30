import csv
from functools import lru_cache
from pathlib import Path

from django.conf import settings

UFC_FIGHTER_DETAILS_CSV = Path(settings.BASE_DIR) / "data" / "ufcstats" / "ufc_fighter_details.csv"


def normalize_name(name: str) -> str:
    name = (name or "").strip()
    name = " ".join(name.split())
    return name.casefold()


@lru_cache(maxsize=1)
def known_fighter_names() -> set[str]:
    if not UFC_FIGHTER_DETAILS_CSV.exists():
        return set()

    out: set[str] = set()
    with UFC_FIGHTER_DETAILS_CSV.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            first = (row.get("FIRST") or "").strip()
            last = (row.get("LAST") or "").strip()
            full = f"{first} {last}".strip()
            if full:
                out.add(normalize_name(full))
    return out


def is_known_fighter(name: str) -> bool:
    return normalize_name(name) in known_fighter_names()
