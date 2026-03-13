import csv
import re
import unicodedata
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from fighters.models import Fighter


DATA_DIR = Path(settings.BASE_DIR) / "data" / "ufcstats"
CSV_TOTT = DATA_DIR / "ufc_fighter_tott.csv"
CSV_DETAILS = DATA_DIR / "ufc_fighter_details.csv"


def norm_name(s: str) -> str:
    s = (s or "").strip().lower()
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = " ".join(s.split())
    return s


def norm_url(s: str) -> str:
    s = (s or "").strip().lower()
    while s.endswith("/"):
        s = s[:-1]
    return s


def parse_height_in(v: str):
    if not v or v.strip() in ("--", ""):
        return None

    v = v.strip()
    m = re.match(r"^\s*(\d+)\s*'\s*(\d+)\s*\"?\s*$", v)
    if not m:
        return None

    feet = int(m.group(1))
    inches = int(m.group(2))
    return feet * 12 + inches


def parse_weight_lbs(v: str):
    if not v or v.strip() in ("--", ""):
        return None

    v = v.strip().lower().replace("lbs.", "").replace("lb.", "").replace("lbs", "").strip()
    try:
        return round(float(v), 2)
    except Exception:
        return None


def parse_reach_in(v: str):
    if not v or v.strip() in ("--", ""):
        return None

    v = v.strip().replace('"', "").strip()
    try:
        return int(round(float(v)))
    except Exception:
        return None


class Command(BaseCommand):
    help = "Import UFC fighter profile data from CSV into existing Fighters (dry-run by default)."

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
        apply_changes = options["apply"]
        limit = options["limit"]

        if not CSV_TOTT.exists():
            self.stderr.write(f"Missing file: {CSV_TOTT.resolve()}")
            return
        if not CSV_DETAILS.exists():
            self.stderr.write(f"Missing file: {CSV_DETAILS.resolve()}")
            return

        nick_by_url = {}
        with CSV_DETAILS.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                url = norm_url(row.get("URL") or "")
                nick = (row.get("NICKNAME") or "").strip()
                if url:
                    nick_by_url[url] = nick

        row_by_url = {}
        row_by_name = {}

        with CSV_TOTT.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                url = norm_url(row.get("URL") or "")
                name = norm_name(row.get("FIGHTER") or "")

                if url:
                    row_by_url[url] = row
                if name:
                    row_by_name[name] = row

        qs = Fighter.objects.all().order_by("id")
        if limit and limit > 0:
            qs = qs[:limit]

        updated = 0
        unchanged = 0
        missing = 0

        for fighter in qs:
            db_url = norm_url(fighter.ufcstats_url or "")
            db_name = norm_name(fighter.name)

            row = None
            if db_url:
                row = row_by_url.get(db_url)
            if row is None:
                row = row_by_name.get(db_name)

            if not row:
                missing += 1
                self.stdout.write(f"[MISS] {fighter.name}")
                continue

            row_url = norm_url(row.get("URL") or "")
            height_in = parse_height_in(row.get("HEIGHT"))
            weight_lbs = parse_weight_lbs(row.get("WEIGHT"))
            reach_in = parse_reach_in(row.get("REACH"))
            nickname = nick_by_url.get(row_url, "") if row_url else ""

            changes = {}

            if row_url and norm_url(fighter.ufcstats_url or "") != row_url:
                changes["ufcstats_url"] = row_url

            if height_in is not None and fighter.height_in != height_in:
                changes["height_in"] = height_in

            if weight_lbs is not None:
                current_weight = float(fighter.weight_lbs) if fighter.weight_lbs is not None else None
                if current_weight != float(weight_lbs):
                    changes["weight_lbs"] = weight_lbs

            if reach_in is not None and fighter.reach_in != reach_in:
                changes["reach_in"] = reach_in

            if nickname and fighter.nickname != nickname:
                changes["nickname"] = nickname

            if not changes:
                unchanged += 1
                continue

            updated += 1
            self.stdout.write(f"[{'APPLY' if apply_changes else 'DRY'}] {fighter.name} -> {changes}")

            if apply_changes:
                for key, value in changes.items():
                    setattr(fighter, key, value)

                fighter.full_clean()
                fighter.save(update_fields=list(changes.keys()))

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Done. apply={apply_changes} | updated={updated} | unchanged={unchanged} | missing={missing}"
            )
        )