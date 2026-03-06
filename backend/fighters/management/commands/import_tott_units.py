import csv
import re
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from fighters.models import Fighter


DATA_DIR = Path(settings.BASE_DIR) / "data" / "ufcstats"
CSV_FILE = DATA_DIR / "ufc_fighter_tott.csv"


def fighter_id(url: str):
    if not url:
        return None

    m = re.search(r"fighter-details/([a-f0-9]+)", url)
    if not m:
        return None

    return m.group(1)


def parse_height(v):
    if not v or v == "--":
        return None

    m = re.match(r"(\d+)'[\s]?(\d+)", v)
    if not m:
        return None

    return int(m.group(1)) * 12 + int(m.group(2))


def parse_weight(v):
    if not v:
        return None

    m = re.search(r"(\d+)", v)
    if not m:
        return None

    return float(m.group(1))


def parse_reach(v):
    if not v or v == "--":
        return None

    m = re.search(r"(\d+)", v)
    if not m:
        return None

    return int(m.group(1))


class Command(BaseCommand):

    help = "Import height/weight/reach from ufc_fighter_tott.csv"

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")
        parser.add_argument("--limit", type=int, default=0)

    def handle(self, *args, **opts):

        dry_run = opts["dry_run"]
        limit = opts["limit"]

        if not CSV_FILE.exists():
            self.stdout.write(self.style.ERROR("CSV not found"))
            return

        # DB fighter ID map
        fighters = {}

        for f in Fighter.objects.exclude(ufcstats_url=None):

            fid = fighter_id(f.ufcstats_url)

            if fid:
                fighters[fid] = f

        processed = 0
        matched = 0
        updated = 0
        failed = 0

        with open(CSV_FILE, encoding="utf-8") as f:

            reader = csv.DictReader(f)

            with transaction.atomic():

                for row in reader:

                    if limit and processed >= limit:
                        break

                    processed += 1

                    fid = fighter_id(row.get("URL"))

                    fighter = fighters.get(fid)

                    if not fighter:
                        failed += 1
                        continue

                    matched += 1

                    height = parse_height(row.get("HEIGHT"))
                    weight = parse_weight(row.get("WEIGHT"))
                    reach = parse_reach(row.get("REACH"))

                    if not dry_run:

                        if height:
                            fighter.height_in = height

                        if weight:
                            fighter.weight_lbs = weight

                        if reach:
                            fighter.reach_in = reach

                        fighter.save(update_fields=[
                            "height_in",
                            "weight_lbs",
                            "reach_in"
                        ])

                    updated += 1

                if dry_run:
                    transaction.set_rollback(True)

        self.stdout.write(
            self.style.SUCCESS(
                f"Kész. Feldolgozva: {processed}, Matched: {matched}, Updated: {updated}, Failed: {failed}"
            )
        )