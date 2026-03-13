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
    return "png"


class Command(BaseCommand):
    help = "Downloads UFC athlete page og:image and saves it into Fighter.upload_image."

    def add_arguments(self, parser):
        parser.add_argument(
            "--only-missing",
            action="store_true",
            help="Process only fighters who have no image or whose image file is missing.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Process at most this many fighters (0 = no limit).",
        )
        parser.add_argument(
            "--sleep",
            type=float,
            default=0.25,
            help="Delay between requests in seconds.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Do not save anything, only print planned actions.",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Overwrite existing upload_image and delete old file first.",
        )

    def handle(self, *args, **options):
        only_missing = options["only_missing"]
        limit = options["limit"]
        sleep_s = options["sleep"]
        dry_run = options["dry_run"]
        force = options["force"]

        qs = Fighter.objects.all().order_by("id")
        total = qs.count()
        self.stdout.write(
            self.style.NOTICE(
                f"Fighters: {total}. Dry-run: {dry_run}. Force: {force}. Only-missing: {only_missing}."
            )
        )

        session = requests.Session()
        session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
                ),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            }
        )

        done = 0
        ok = 0
        skipped = 0
        failed = 0

        for fighter in qs.iterator():
            if limit and done >= limit:
                break
            done += 1

            if fighter.upload_image and not force:
                file_exists = False
                try:
                    file_exists = os.path.exists(fighter.upload_image.path)
                except Exception:
                    file_exists = False

                if only_missing:
                    if file_exists:
                        skipped += 1
                        self.stdout.write(f"[SKIP] {fighter.pk} {fighter.name} (image exists and file exists)")
                        continue
                else:
                    if file_exists:
                        skipped += 1
                        self.stdout.write(f"[SKIP] {fighter.pk} {fighter.name} (image exists, use --force to overwrite)")
                        continue

            slug = slugify(fighter.name)
            if not slug:
                failed += 1
                self.stdout.write(self.style.ERROR(f"[FAIL] {fighter.pk} {fighter.name} (slug cannot be created)"))
                continue

            page_url = UFC_ATHLETE_URL.format(slug=slug)

            try:
                page_resp = session.get(page_url, timeout=25, allow_redirects=True)
                if page_resp.status_code != 200:
                    failed += 1
                    self.stdout.write(
                        self.style.ERROR(f"[FAIL] {fighter.pk} {fighter.name} ({page_url}) HTTP {page_resp.status_code}")
                    )
                    time.sleep(sleep_s)
                    continue

                img_url = extract_og_image(page_resp.text)
                if not img_url:
                    failed += 1
                    self.stdout.write(self.style.ERROR(f"[FAIL] {fighter.pk} {fighter.name} (no og:image) {page_url}"))
                    time.sleep(sleep_s)
                    continue

                img_url = strip_query(img_url)
                ext = guess_ext_from_url(img_url)

                img_resp = session.get(img_url, timeout=30, allow_redirects=True)
                if img_resp.status_code != 200:
                    failed += 1
                    self.stdout.write(
                        self.style.ERROR(f"[FAIL] {fighter.pk} {fighter.name} image HTTP {img_resp.status_code} {img_url}")
                    )
                    time.sleep(sleep_s)
                    continue

                safe_slug = slug.replace("-", "_")
                filename = f"{fighter.pk}_{safe_slug}.{ext}"

                if dry_run:
                    ok += 1
                    self.stdout.write(f"[DRY] {fighter.pk} {fighter.name} -> {filename} ({img_url})")
                    time.sleep(sleep_s)
                    continue

                if force:
                    try:
                        if fighter.upload_image:
                            fighter.upload_image.delete(save=False)
                    except Exception:
                        pass

                fighter.upload_image.save(filename, ContentFile(img_resp.content), save=True)

                ok += 1
                self.stdout.write(self.style.SUCCESS(f"[OK] {fighter.pk} {fighter.name} -> {fighter.upload_image.name}"))

            except Exception as e:
                failed += 1
                self.stdout.write(self.style.ERROR(f"[ERR] {fighter.pk} {fighter.name} ({page_url}) {type(e).__name__}: {e}"))

            time.sleep(sleep_s)

        self.stdout.write("")
        self.stdout.write(self.style.NOTICE(f"Done. Processed: {done}, OK: {ok}, Skip: {skipped}, Fail: {failed}"))