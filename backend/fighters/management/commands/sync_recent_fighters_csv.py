import csv
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, List, Set, Tuple

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.management.base import BaseCommand
from django.db import transaction

from fighters.models import Fighter, Division
from fighters.services.ufcstats_lookup import find_url_by_name


DATA_DIR = Path(settings.BASE_DIR) / "data" / "ufcstats"
EVENTS_CSV = DATA_DIR / "ufc_event_details.csv"
STATS_CSV = DATA_DIR / "ufc_fight_stats.csv"
RESULTS_CSV = DATA_DIR / "ufc_fight_results.csv"


def _parse_event_date(s: str):
    s = (s or "").strip()
    return datetime.strptime(s, "%B %d, %Y").date()


def _norm_name(name: str) -> str:
    return " ".join((name or "").strip().split())


def _norm_url(url: str) -> str:
    u = (url or "").strip()
    while u.endswith("/"):
        u = u[:-1]
    return u.lower()


def _split_bout(bout: str) -> Tuple[str, str]:
    s = (bout or "").strip()
    if " vs. " not in s:
        return "", ""
    a, b = s.split(" vs. ", 1)
    return _norm_name(a), _norm_name(b)


CANON_DIVS = [
    "Flyweight",
    "Bantamweight",
    "Featherweight",
    "Lightweight",
    "Welterweight",
    "Middleweight",
    "Light Heavyweight",
    "Heavyweight",
    "Women's Strawweight",
    "Women's Flyweight",
    "Women's Bantamweight",
    "Women's Featherweight",
    "Catchweight",
    "Open Weight",
]


def _extract_division_name(weightclass: str) -> str:
    s = (weightclass or "").strip()
    if not s:
        return ""

    s = " ".join(s.split())
    s_low = s.lower()

    if "catchweight" in s_low:
        return "Catchweight"

    if "superfight" in s_low:
        return "Open Weight"

    if "open weight" in s_low or "openweight" in s_low:
        return "Open Weight"

    if s.endswith("Bout"):
        s = s[:-len("Bout")].strip()
        s_low = s.lower()

    for div in [
        "Women's Strawweight",
        "Women's Flyweight",
        "Women's Bantamweight",
        "Women's Featherweight",
        "Light Heavyweight",
        "Heavyweight",
        "Middleweight",
        "Welterweight",
        "Lightweight",
        "Featherweight",
        "Bantamweight",
        "Flyweight",
    ]:
        if div.lower() in s_low:
            return div

    return ""


class Command(BaseCommand):
    help = "Sync fighters from last N days using UFCStats CSV files. Also fills W/L/D and Division."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=365)
        parser.add_argument("--ensure-unknown-division", action="store_true")
        parser.add_argument("--dry-run", action="store_true")
        parser.add_argument("--show-invalid", action="store_true")
        parser.add_argument("--show-invalid-limit", type=int, default=60)
        parser.add_argument("--create-missing-divisions", action="store_true")

    def handle(self, *args, **opts):
        days = int(opts["days"])
        ensure_unknown = bool(opts["ensure_unknown_division"])
        dry_run = bool(opts["dry_run"])
        show_invalid = bool(opts["show_invalid"])
        show_invalid_limit = int(opts["show_invalid_limit"])
        create_missing_divisions = bool(opts["create_missing_divisions"])

        if not EVENTS_CSV.exists():
            self.stdout.write(self.style.ERROR(f"Missing: {EVENTS_CSV}"))
            return
        if not STATS_CSV.exists():
            self.stdout.write(self.style.ERROR(f"Missing: {STATS_CSV}"))
            return
        if not RESULTS_CSV.exists():
            self.stdout.write(self.style.ERROR(f"Missing: {RESULTS_CSV}"))
            return

        event_dates: Dict[str, object] = {}
        latest_date = None

        with EVENTS_CSV.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ev = (row.get("EVENT") or "").strip()
                ds = (row.get("DATE") or "").strip()
                if not ev or not ds:
                    continue
                try:
                    d = _parse_event_date(ds)
                except ValueError:
                    continue
                event_dates[ev] = d
                if latest_date is None or d > latest_date:
                    latest_date = d

        if not latest_date:
            self.stdout.write(self.style.ERROR("Could not determine latest event date from events CSV."))
            return

        cutoff = latest_date - timedelta(days=days)

        self.stdout.write(f"Latest event date: {latest_date}")
        self.stdout.write(f"Cutoff date: {cutoff} (last {days} days)")
        self.stdout.write(f"Events indexed: {len(event_dates)}")

        names_set: Set[str] = set()

        with STATS_CSV.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ev = (row.get("EVENT") or "").strip()
                fighter = _norm_name(row.get("FIGHTER") or "")
                if not ev or not fighter:
                    continue

                ev_date = event_dates.get(ev)
                if not ev_date:
                    continue

                if ev_date >= cutoff:
                    names_set.add(fighter)

        names: List[str] = sorted(names_set)
        self.stdout.write(f"Distinct fighters in window: {len(names)}")

        wld: Dict[str, Tuple[int, int, int]] = {}
        last_div_by_fighter: Dict[str, str] = {}
        last_date_by_fighter: Dict[str, object] = {}

        with RESULTS_CSV.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ev = (row.get("EVENT") or "").strip()
                bout = (row.get("BOUT") or "").strip()
                outcome = (row.get("OUTCOME") or "").strip()
                weightclass_raw = (row.get("WEIGHTCLASS") or "").strip()

                a, b = _split_bout(bout)
                if not a or not b:
                    continue

                aw, al, ad = wld.get(a, (0, 0, 0))
                bw, bl, bd = wld.get(b, (0, 0, 0))

                if outcome == "W/L":
                    aw += 1
                    bl += 1
                elif outcome == "L/W":
                    al += 1
                    bw += 1
                elif outcome == "D/D":
                    ad += 1
                    bd += 1

                wld[a] = (aw, al, ad)
                wld[b] = (bw, bl, bd)

                ev_date = event_dates.get(ev)
                if not ev_date or ev_date < cutoff:
                    continue

                div_name = _extract_division_name(weightclass_raw)
                if not div_name:
                    continue

                prev_a = last_date_by_fighter.get(a)
                if prev_a is None or ev_date > prev_a:
                    last_date_by_fighter[a] = ev_date
                    last_div_by_fighter[a] = div_name

                prev_b = last_date_by_fighter.get(b)
                if prev_b is None or ev_date > prev_b:
                    last_date_by_fighter[b] = ev_date
                    last_div_by_fighter[b] = div_name

        unknown_div: Optional[Division] = None
        if ensure_unknown and not dry_run:
            unknown_div, _ = Division.objects.get_or_create(
                name="Unknown",
                defaults={"min_weight": 0, "max_weight": 999},
            )
        elif ensure_unknown:
            unknown_div = Division.objects.filter(name__iexact="Unknown").first()

        def _reload_div_lookup() -> Dict[str, Division]:
            divs = list(Division.objects.all())
            return {d.name.strip().lower(): d for d in divs}

        div_lookup = _reload_div_lookup()

        def find_division(div_name: str) -> Optional[Division]:
            key = (div_name or "").strip().lower()
            if not key:
                return None
            return div_lookup.get(key)

        if create_missing_divisions and not dry_run:
            for dn in CANON_DIVS:
                if dn.strip().lower() not in div_lookup:
                    Division.objects.get_or_create(
                        name=dn,
                        defaults={"min_weight": 0, "max_weight": 999},
                    )
            div_lookup = _reload_div_lookup()

        created = 0
        updated = 0
        unchanged = 0
        invalid = 0
        invalid_names: List[str] = []

        with transaction.atomic():
            for name in names:
                url = find_url_by_name(name)
                url_norm = _norm_url(url) if url else ""

                wins, losses, draw = wld.get(name, (0, 0, 0))

                div_name = last_div_by_fighter.get(name, "")
                div_obj = find_division(div_name) or (unknown_div if ensure_unknown else None)

                obj = None

                if url_norm:
                    obj = (
                        Fighter.objects
                        .exclude(ufcstats_url__isnull=True)
                        .exclude(ufcstats_url="")
                        .filter(ufcstats_url__iexact=url_norm)
                        .first()
                    )

                if obj is None:
                    obj = Fighter.objects.filter(name=name).first()

                if obj:
                    changed = False

                    if url_norm and not (obj.ufcstats_url or "").strip():
                        obj.ufcstats_url = url_norm
                        changed = True

                    if obj.wins != wins:
                        obj.wins = wins
                        changed = True
                    if obj.losses != losses:
                        obj.losses = losses
                        changed = True
                    if obj.draw != draw:
                        obj.draw = draw
                        changed = True

                    if div_obj is not None:
                        if obj.division is None:
                            obj.division = div_obj
                            changed = True
                        elif (
                            obj.division
                            and obj.division.name.strip().lower() == "unknown"
                            and div_obj.name.strip().lower() != "unknown"
                        ):
                            obj.division = div_obj
                            changed = True

                    if changed:
                        if not dry_run:
                            try:
                                obj.full_clean()
                                obj.save()
                                updated += 1
                            except DjangoValidationError:
                                invalid += 1
                                invalid_names.append(name)
                        else:
                            updated += 1
                    else:
                        unchanged += 1

                else:
                    obj = Fighter(
                        name=name,
                        ufcstats_url=url_norm or None,
                        division=div_obj,
                        age=None,
                        wins=wins,
                        losses=losses,
                        draw=draw,
                    )

                    if not dry_run:
                        try:
                            obj.full_clean()
                            obj.save()
                            created += 1
                        except DjangoValidationError:
                            invalid += 1
                            invalid_names.append(name)
                    else:
                        created += 1

            if dry_run:
                transaction.set_rollback(True)

        self.stdout.write(
            self.style.SUCCESS(
                f"Created: {created}, Updated: {updated}, Unchanged: {unchanged}, Invalid: {invalid}"
            )
        )

        if show_invalid and invalid_names:
            self.stdout.write(self.style.WARNING("Invalid fighter names (sample):"))
            for n in invalid_names[:max(0, show_invalid_limit)]:
                self.stdout.write(f"- {n}")

            if len(invalid_names) > show_invalid_limit:
                self.stdout.write(f"... and {len(invalid_names) - show_invalid_limit} more")