import os
import re
import time
from urllib.parse import urlsplit, urlunsplit

import requests
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from fighters.models import Fighter

UFC_ATHLETE_URL = "https://www.ufc.com/athlete/{slug}"


def strip_query(url: str) -> str:
    parts = urlsplit(url)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, "", ""))


def extract_og_image(html: str) -> str | None:
    # og:image meta tag kinyerés
    m = re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', html)
    return m.group(1) if m else None


def guess_ext_from_url(url: str) -> str:
    path = urlsplit(url).path.lower()
    if path.endswith(".png"):
        return "png"
    if path.endswith(".webp"):
        return "webp"
    if path.endswith(".jpg") or path.endswith(".jpeg"):
        return "jpg"
    # ha nem ismert, legyen png
    return "png"


class Command(BaseCommand):
    help = "Letölti az UFC athlete oldalak og:image képét és betölti Fighter.upload_image mezőbe."

    def add_arguments(self, parser):
        parser.add_argument("--only-missing", action="store_true", help="Csak azoknak, akiknek nincs kép VAGY hiányzik a fájl.")
        parser.add_argument("--limit", type=int, default=0, help="Max ennyi fightert dolgozzon fel (0 = nincs limit).")
        parser.add_argument("--sleep", type=float, default=0.25, help="Kérések közötti várakozás másodpercben.")
        parser.add_argument("--dry-run", action="store_true", help="Nem ment, csak kiírja mit csinálna.")
        parser.add_argument("--force", action="store_true", help="Felülírja a meglévő upload_image-t is (és törli a régi fájlt).")

    def handle(self, *args, **options):
        only_missing = options["only_missing"]
        limit = options["limit"]
        sleep_s = options["sleep"]
        dry_run = options["dry_run"]
        force = options["force"]

        qs = Fighter.objects.all().order_by("id")
        total = qs.count()
        self.stdout.write(self.style.NOTICE(f"Fighterek: {total}. Dry-run: {dry_run}. Force: {force}. Only-missing: {only_missing}."))

        session = requests.Session()
        session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                              "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            }
        )

        done = 0
        ok = 0
        skipped = 0
        failed = 0

        for f in qs.iterator():
            if limit and done >= limit:
                break
            done += 1

            # Eldöntjük, hogy dolgozunk-e vele
            if f.upload_image and not force:
                file_exists = False
                try:
                    file_exists = os.path.exists(f.upload_image.path)
                except Exception:
                    file_exists = False

                # only_missing esetén: ha van kép és a fájl is megvan, skip
                if only_missing:
                    if file_exists:
                        skipped += 1
                        self.stdout.write(f"[SKIP] {f.pk} {f.name} (van kép és megvan a fájl)")
                        continue
                    # ha nincs fájl, akkor töltsük újra
                else:
                    # nem only_missing: ha van kép és nem force, akkor általában skip
                    # (de ha fájl nincs, akkor is töltsük újra)
                    if file_exists:
                        skipped += 1
                        self.stdout.write(f"[SKIP] {f.pk} {f.name} (van kép, force nélkül)")
                        continue

            elif only_missing and not force:
                # only_missing és nincs upload_image: megyünk tovább, töltsük
                pass

            # slug képzés a DB névből
            slug = slugify(f.name)
            if not slug:
                failed += 1
                self.stdout.write(self.style.ERROR(f"[FAIL] {f.pk} {f.name} (slug nem képezhető)"))
                continue

            page_url = UFC_ATHLETE_URL.format(slug=slug)

            try:
                # Athlete oldal letöltése
                r = session.get(page_url, timeout=25, allow_redirects=True)
                if r.status_code != 200:
                    failed += 1
                    self.stdout.write(self.style.ERROR(f"[FAIL] {f.pk} {f.name} ({page_url}) HTTP {r.status_code}"))
                    time.sleep(sleep_s)
                    continue

                img_url = extract_og_image(r.text)
                if not img_url:
                    failed += 1
                    self.stdout.write(self.style.ERROR(f"[FAIL] {f.pk} {f.name} (og:image nincs) {page_url}"))
                    time.sleep(sleep_s)
                    continue

                img_url = strip_query(img_url)
                ext = guess_ext_from_url(img_url)

                # Kép letöltése
                img_resp = session.get(img_url, timeout=30, allow_redirects=True)
                if img_resp.status_code != 200:
                    failed += 1
                    self.stdout.write(self.style.ERROR(f"[FAIL] {f.pk} {f.name} kép HTTP {img_resp.status_code} {img_url}"))
                    time.sleep(sleep_s)
                    continue

                # Stabil, ütközésmentes fájlnév:
                # 1_charles_oliveira.png
                safe_slug = slug.replace("-", "_")
                filename = f"{f.pk}_{safe_slug}.{ext}"

                if dry_run:
                    ok += 1
                    self.stdout.write(f"[DRY] {f.pk} {f.name} -> {filename} ({img_url})")
                    time.sleep(sleep_s)
                    continue

                # FORCE esetén tényleg felülírás: töröljük a régi fájlt, különben suffixet gyárt a Django
                if force:
                    try:
                        if f.upload_image:
                            f.upload_image.delete(save=False)
                    except Exception:
                        pass

                # Mentés ImageField-be (upload_to: fighters/images/)
                f.upload_image.save(filename, ContentFile(img_resp.content), save=True)

                ok += 1
                self.stdout.write(self.style.SUCCESS(f"[OK] {f.pk} {f.name} -> {f.upload_image.name}"))

            except Exception as e:
                failed += 1
                self.stdout.write(self.style.ERROR(f"[ERR] {f.pk} {f.name} ({page_url}) {type(e).__name__}: {e}"))

            time.sleep(sleep_s)

        self.stdout.write("")
        self.stdout.write(self.style.NOTICE(f"Kész. Feldolgozva: {done}, OK: {ok}, Skip: {skipped}, Fail: {failed}"))