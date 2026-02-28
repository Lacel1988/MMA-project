import csv
from functools import lru_cache
from pathlib import Path

from django.conf import settings


DATA_DIR = Path(settings.BASE_DIR) / "data" / "ufcstats"
FIGHTERS_CSV = DATA_DIR / "ufc_fighter_details.csv"


def _normalize_name(name: str) -> str:
    return " ".join((name or "").strip().split()).lower()


def _normalize_url(url: str) -> str:
    u = (url or "").strip()
    while u.endswith("/"):
        u = u[:-1]
    return u.lower()


@lru_cache(maxsize=1)
def name_to_url_map() -> dict[str, str]:
    out: dict[str, str] = {}
    if not FIGHTERS_CSV.exists():
        return out

    with FIGHTERS_CSV.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            first = (row.get("FIRST") or "").strip()
            last = (row.get("LAST") or "").strip()
            full = f"{first} {last}".strip()
            url = _normalize_url(row.get("URL") or "")
            if full and url:
                out[_normalize_name(full)] = url
    return out


def find_url_by_name(name: str) -> str | None:
    return name_to_url_map().get(_normalize_name(name))