import csv
from pathlib import Path
from datetime import datetime

from django.core.management.base import BaseCommand
from ufcstats.models import UFCEvent

CSV_EVENTS = Path("data/ufcstats/ufc_event_details.csv")

def parse_date(s: str):
    # "December 13, 2025"
    s = (s or "").strip()
    if not s:
        return None
    return datetime.strptime(s, "%B %d, %Y").date()

class Command(BaseCommand):
    help = "Import UFC events from CSV into ufcstats.UFCEvent"

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true", help="Save to DB (otherwise dry-run).")
        parser.add_argument("--limit", type=int, default=0, help="Process only N rows (0 = all).")

    def handle(self, *args, **options):
        apply = options["apply"]
        limit = options["limit"]

        if not CSV_EVENTS.exists():
            self.stderr.write(f"Missing file: {CSV_EVENTS.resolve()}")
            return

        created = 0
        updated = 0
        skipped = 0

        with CSV_EVENTS.open(newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for i, row in enumerate(r, start=1):
                if limit and i > limit:
                    break

                name = (row.get("EVENT") or "").strip()
                url = (row.get("URL") or "").strip()
                date_s = (row.get("DATE") or "").strip()
                location = (row.get("LOCATION") or "").strip()

                if not name or not url or not date_s:
                    skipped += 1
                    continue

                dt = parse_date(date_s)
                if not dt:
                    skipped += 1
                    continue

                obj = UFCEvent.objects.filter(url=url).first()
                if not obj:
                    created += 1
                    self.stdout.write(f"[{'APPLY' if apply else 'DRY'}] create: {name} {dt}")
                    if apply:
                        UFCEvent.objects.create(name=name, url=url, date=dt, location=location)
                else:
                    changes = {}
                    if obj.name != name:
                        changes["name"] = name
                    if obj.date != dt:
                        changes["date"] = dt
                    if obj.location != location:
                        changes["location"] = location

                    if changes:
                        updated += 1
                        self.stdout.write(f"[{'APPLY' if apply else 'DRY'}] update: {name} -> {changes}")
                        if apply:
                            for k, v in changes.items():
                                setattr(obj, k, v)
                            obj.save(update_fields=list(changes.keys()))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(
            f"Done. apply={apply} created={created} updated={updated} skipped={skipped}"
        ))
