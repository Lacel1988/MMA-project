from django.core.management.base import BaseCommand

from fighters.models import Fighter
from fighters.services.ufcstats_registry import is_known_fighter


class Command(BaseCommand):
    help = "Checks whether all Fighter records in DB exist in the UFCStats CSV reference."

    def handle(self, *args, **options):
        bad = []

        for fighter in Fighter.objects.all().only("id", "name", "ufcstats_url"):
            name = (fighter.name or "").strip()
            url = (fighter.ufcstats_url or "").strip() or None

            if not name or not is_known_fighter(name, url):
                bad.append((fighter.id, fighter.name, fighter.ufcstats_url))

        if not bad:
            self.stdout.write(self.style.SUCCESS("OK: All fighters match UFCStats CSV reference."))
            return

        self.stdout.write(
            self.style.ERROR(f"FAIL: {len(bad)} fighter(s) not found in UFCStats CSV reference:")
        )
        for fid, name, url in bad:
            self.stdout.write(f"- id={fid} name={name} url={url}")

        raise SystemExit(1)