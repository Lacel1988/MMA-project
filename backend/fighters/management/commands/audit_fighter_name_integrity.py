import csv
import unicodedata
from difflib import SequenceMatcher, get_close_matches
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from fighters.models import Fighter


DATA_DIR = Path(settings.BASE_DIR) / "data" / "ufcstats"
CSV_DETAILS = DATA_DIR / "ufc_fighter_details.csv"
CSV_TOTT = DATA_DIR / "ufc_fighter_tott.csv"


def norm_text(s: str) -> str:
    s = (s or "").strip().lower()
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = " ".join(s.split())
    return s


def load_reference_names() -> dict[str, str]:
    """
    Visszaad egy normalizált_név -> eredeti_név mapet.
    Több CSV-ből is gyűjtünk, hogy minél teljesebb legyen a referencia.
    """
    ref = {}

    files_and_columns = [
        (CSV_DETAILS, "FIGHTER"),
        (CSV_TOTT, "FIGHTER"),
    ]

    for csv_file, col in files_and_columns:
        if not csv_file.exists():
            continue

        with csv_file.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                original = (row.get(col) or "").strip()
                if not original:
                    continue

                key = norm_text(original)
                if key and key not in ref:
                    ref[key] = original

    return ref


class Command(BaseCommand):
    help = (
        "Audits Fighter names against UFCStats reference CSV files and suggests likely intended names "
        "for suspicious manually inserted or misspelled records."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Maximum number of Fighter records to check (0 = all).",
        )
        parser.add_argument(
            "--cutoff",
            type=float,
            default=0.80,
            help="Similarity threshold between 0 and 1 for suspicious suggestions. Default: 0.80",
        )
        parser.add_argument(
            "--top",
            type=int,
            default=3,
            help="How many suggestions to print per suspicious fighter. Default: 3",
        )
        parser.add_argument(
            "--only-suspects",
            action="store_true",
            help="Print only suspicious / non-matching fighters.",
        )
        parser.add_argument(
            "--fail-on-suspects",
            action="store_true",
            help="Exit with code 1 if suspicious fighters are found.",
        )

    def handle(self, *args, **options):
        limit = options["limit"]
        cutoff = float(options["cutoff"])
        top = int(options["top"])
        only_suspects = bool(options["only_suspects"])
        fail_on_suspects = bool(options["fail_on_suspects"])

        if not CSV_DETAILS.exists() and not CSV_TOTT.exists():
            self.stdout.write(
                self.style.ERROR(
                    "No reference CSV found. Expected at least one of:\n"
                    f"- {CSV_DETAILS}\n"
                    f"- {CSV_TOTT}"
                )
            )
            raise SystemExit(1)

        ref_map = load_reference_names()
        if not ref_map:
            self.stdout.write(self.style.ERROR("Reference fighter name set is empty."))
            raise SystemExit(1)

        ref_keys = list(ref_map.keys())

        qs = Fighter.objects.all().only("id", "name", "ufcstats_url").order_by("id")
        if limit and limit > 0:
            qs = qs[:limit]

        checked = 0
        exact_ok = 0
        suspicious = 0
        empty_name = 0

        for fighter in qs:
            checked += 1

            raw_name = (fighter.name or "").strip()
            norm_name = norm_text(raw_name)

            if not raw_name or not norm_name:
                empty_name += 1
                suspicious += 1

                self.stdout.write(
                    self.style.WARNING(
                        f"[EMPTY] id={fighter.id} name={repr(fighter.name)} url={fighter.ufcstats_url}"
                    )
                )
                continue

            if norm_name in ref_map:
                exact_ok += 1
                if not only_suspects:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"[OK] id={fighter.id} name={raw_name} -> exact match"
                        )
                    )
                continue

            candidates = get_close_matches(norm_name, ref_keys, n=max(1, top), cutoff=cutoff)

            ranked = []
            for cand in candidates:
                ratio = SequenceMatcher(None, norm_name, cand).ratio()
                ranked.append((ratio, ref_map[cand]))

            ranked.sort(key=lambda x: x[0], reverse=True)

            suspicious += 1

            if ranked:
                suggestions = ", ".join(
                    [f"{name} ({ratio:.2f})" for ratio, name in ranked[:top]]
                )
                self.stdout.write(
                    self.style.WARNING(
                        f"[SUSPECT] id={fighter.id} name={raw_name} url={fighter.ufcstats_url} "
                        f"| suggestions: {suggestions}"
                    )
                )
            else:
                self.stdout.write(
                    self.style.ERROR(
                        f"[MISS] id={fighter.id} name={raw_name} url={fighter.ufcstats_url} "
                        f"| no close match found"
                    )
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Audit finished. Checked: {checked}, Exact OK: {exact_ok}, Suspicious: {suspicious}, Empty: {empty_name}"
            )
        )

        if suspicious > 0 and fail_on_suspects:
            raise SystemExit(1)