import csv
import unicodedata
from pathlib import Path

from django.core.management.base import BaseCommand
from fighters.models import Fighter

CSV_TOTT = Path("data/ufcstats/ufc_fighter_tott.csv")
CSV_DETAILS = Path("data/ufcstats/ufc_fighter_details.csv")

def norm_name(s: str) -> str:
    s = (s or "").strip().lower()
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = " ".join(s.split())
    return s

def parse_height_cm(v: str):
    # "5' 11\"" -> cm
    if not v or v.strip() in ("--", ""):
        return None
    v = v.strip()
    try:
        feet_part, inch_part = v.split("'")
        feet = int(feet_part.strip())
        inch = int(inch_part.replace('"', "").strip())
        total_in = feet * 12 + inch
        return round(total_in * 2.54, 2)
    except Exception:
        return None

def parse_weight_kg(v: str):
    # "155 lbs." -> kg
    if not v or v.strip() in ("--", ""):
        return None
    v = v.strip().lower().replace("lbs.", "").replace("lb.", "").replace("lbs", "").strip()
    try:
        lbs = float(v)
        return round(lbs * 0.45359237, 2)
    except Exception:
        return None

def parse_reach_cm(v: str):
    # '71"' -> cm
    if not v or v.strip() in ("--", ""):
        return None
    v = v.strip().replace('"', "").strip()
    try:
        inch = float(v)
        return int(round(inch * 2.54))
    except Exception:
        return None

class Command(BaseCommand):
    help = "Import UFC fighter profile data from CSV into existing Fighters (dry-run by default)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Actually save changes to DB (otherwise dry-run).",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Limit how many Fighters to process (0 = all).",
        )

    def handle(self, *args, **options):
        apply = options["apply"]
        limit = options["limit"]

        if not CSV_TOTT.exists():
            self.stderr.write(f"Missing file: {CSV_TOTT.resolve()}")
            return
        if not CSV_DETAILS.exists():
            self.stderr.write(f"Missing file: {CSV_DETAILS.resolve()}")
            return

        # URL -> nickname
        nick_by_url = {}
        with CSV_DETAILS.open(newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for row in r:
                url = (row.get("URL") or "").strip()
                nick = (row.get("NICKNAME") or "").strip()
                if url:
                    nick_by_url[url] = nick

        # normalized fighter name -> row
        row_by_name = {}
        with CSV_TOTT.open(newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for row in r:
                nm = norm_name(row.get("FIGHTER"))
                if nm:
                    row_by_name[nm] = row

        qs = Fighter.objects.all().order_by("id")
        if limit and limit > 0:
            qs = qs[:limit]

        updated = 0
        unchanged = 0
        missing = 0

        for fobj in qs:
            key = norm_name(fobj.name)
            row = row_by_name.get(key)

            if not row:
                missing += 1
                self.stdout.write(f"[MISS] {fobj.name}")
                continue

            ufc_url = (row.get("URL") or "").strip()
            h_cm = parse_height_cm(row.get("HEIGHT"))
            w_kg = parse_weight_kg(row.get("WEIGHT"))
            r_cm = parse_reach_cm(row.get("REACH"))
            nick = nick_by_url.get(ufc_url, "") if ufc_url else ""

            changes = {}

            if h_cm is not None and float(fobj.height) != float(h_cm):
                changes["height"] = h_cm
            if w_kg is not None and float(fobj.weight) != float(w_kg):
                changes["weight"] = w_kg
            if r_cm is not None and fobj.reach != r_cm:
                changes["reach"] = r_cm
            if nick and fobj.nickname != nick:
                changes["nickname"] = nick

            if not changes:
                unchanged += 1
                continue

            updated += 1
            self.stdout.write(f"[{'APPLY' if apply else 'DRY'}] {fobj.name} -> {changes}")

            if apply:
                for k, v in changes.items():
                    setattr(fobj, k, v)
                fobj.save(update_fields=list(changes.keys()))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(
            f"Done. apply={apply} | updated={updated} | unchanged={unchanged} | missing={missing}"
        ))
