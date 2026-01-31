import csv
from functools import lru_cache
from pathlib import Path

from django.conf import settings


DATA_DIR = Path(settings.BASE_DIR) / "data" / "ufcstats"
FIGHTERS_CSV = DATA_DIR / "ufc_fighter_details.csv"
UFC_FIGHTER_DETAILS_CSV = FIGHTERS_CSV




def _normalize_name(name: str) -> str:
    return " ".join((name or "").strip().split()).lower()

def _normalize_url(url: str) -> str:
    u = (url or "").strip()
    if not u:
        return ""
    
    while u.endswith("/"):
        u = u[:-1]
    return u.lower()

@lru_cache(maxsize=1)
def known_fighters_set() -> set[str]:
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

@lru_cache(maxsize=1)
def known_fighters_urls() -> set[str]:

    if not FIGHTERS_CSV.exists():
        return set()
    
    out: set[str] = set()
    
    with FIGHTERS_CSV.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        if not r.fieldnames:
            return set()
        
        if "URL" not in r.fieldnames:
            return set()
        
        for row in r:
            url = _normalize_url(row.get("URL") or "")
            if url:
                out.add(url)     
                
    return out                 
                                
    
    
def is_known_fighter_name(name: str) -> bool:
    return _normalize_name(name) in known_fighters_set()

def is_known_fighter_url(url: str) -> bool:
    u = _normalize_url(url)
    if not u:
        return False
    return u in known_fighters_urls()

def is_known_fighter(name: str, url: str | None = None) -> bool:
    if url:
        return is_known_fighter_url(url)
    return is_known_fighter_name(name)


def clear_cache():
    known_fighters_set.cache_clear()
    known_fighters_urls.cache_clear()
    
known_fighter_names = known_fighters_set
    
