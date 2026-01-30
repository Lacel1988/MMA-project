from django.core.management.base import BaseCommand
from fighters.models import Fighter
from fighters.services.ufcstats_registry import is_known_fighter


class Command(BaseCommand):
    help = "Checks whether all Fighter names in DB exist in the UFCStats CSV reference."

    def handle(self, *args, **options):
        bad = []

        for f in Fighter.objects.all().only("id", "name"):
            name = (f.name or "").strip()
            if not name or not is_known_fighter(name):
                bad.append((f.id, f.name))

        if not bad:
            self.stdout.write(self.style.SUCCESS("OK: All fighters match UFCStats CSV reference."))
            return

        self.stdout.write(self.style.ERROR(f"FAIL: {len(bad)} fighter(s) not found in UFCStats CSV reference:"))
        for fid, name in bad:
            self.stdout.write(f"- id={fid} name={name}")

        # non-zero exit code: CI-ben is fail legyen, meg PowerShellben is látszik
        raise SystemExit(1)
