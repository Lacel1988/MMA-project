"""Prepare an isolated, deterministic SQLite database for Playwright."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent
SOURCE_DB = BACKEND_DIR / "db.sqlite3"
E2E_DB = BACKEND_DIR / "db.e2e.sqlite3"


def main() -> None:
    if E2E_DB.exists():
        E2E_DB.unlink()

    if SOURCE_DB.exists():
        shutil.copy2(SOURCE_DB, E2E_DB)

    os.environ["MMA_DATABASE_PATH"] = str(E2E_DB)
    os.environ.setdefault("DJANGO_SECRET_KEY", "playwright-only-insecure-secret-key")
    subprocess.run(
        [sys.executable, str(BACKEND_DIR / "manage.py"), "migrate", "--noinput"],
        check=True,
        cwd=BACKEND_DIR,
        env=os.environ,
    )

    sys.path.insert(0, str(BACKEND_DIR))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    import django

    django.setup()

    from django.contrib.auth import get_user_model
    from fighters.models import Division, Fighter
    from forum.models import Category, Topic

    user_model = get_user_model()
    user, _ = user_model.objects.get_or_create(
        username="playwright_user",
        defaults={"email": "playwright@example.test"},
    )
    user.set_password("PlaywrightPass123!")
    user.is_staff = False
    user.is_superuser = False
    user.save()

    division, _ = Division.objects.get_or_create(
        name="Lightweight",
        defaults={"min_weight": 146, "max_weight": 155},
    )

    fighter_defaults = [
        ("Charles Oliveira", "Do Bronx", 35, 11, 1, 70, 155, 74),
        ("Islam Makhachev", "", 27, 1, 0, 70, 155, 70),
    ]
    for name, nickname, wins, losses, draw, height, weight, reach in fighter_defaults:
        Fighter.objects.update_or_create(
            name=name,
            defaults={
                "nickname": nickname,
                "division": division,
                "wins": wins,
                "losses": losses,
                "draw": draw,
                "height_in": height,
                "weight_lbs": weight,
                "reach_in": reach,
                "description": f"E2E profile for {name}.",
            },
        )

    category, _ = Category.objects.get_or_create(
        name="E2E Discussion",
        defaults={"description": "Deterministic Playwright forum fixture."},
    )
    Topic.objects.get_or_create(
        category=category,
        title="E2E Fight Night",
        defaults={"description": "Playwright discussion topic.", "created_by": user},
    )

    print(f"Prepared Playwright database: {E2E_DB}")


if __name__ == "__main__":
    main()
