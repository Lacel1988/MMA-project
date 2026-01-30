TESTING.md (Backend)

=====================
ENGLISH
=====================

Purpose
The backend tests exist to:
- enforce model-level domain rules (field types, validators)
- verify UFCStats CSV-based data processing and aggregation
- validate DRF serializer behavior (e.g. fighter name validation)

Where to run tests
Run all commands from the backend directory where manage.py is located.

Commands (PowerShell)

1) Run all tests (recommended before every commit)
python manage.py test

2) Run only the fighters app tests
python manage.py test fighters

3) Run only the ufcstats app tests
python manage.py test ufcstats

4) Run targeted tests (faster during development)
python manage.py test fighters.tests.test_models
python manage.py test fighters.tests.test_ufcstats_registry
python manage.py test fighters.tests.test_serializers
python manage.py test ufcstats.tests.test_model

When to use which
- During development: use targeted tests
- Before pull request or major change: run fighters and ufcstats separately
- Before commit: always run the full test suite

What is tested?

fighters
- test_models.py
  Model-level validation (e.g. age, wins, field constraints, full_clean)
- test_ufcstats_registry.py
  Service logic: validates fighter names against UFCStats CSV reference data using mocking
- test_serializers.py
  DRF serializer validation: invalid fighter names are rejected at serializer level

ufcstats
- test_model.py (name is slightly misleading, tests radar logic)
  Unit tests for parsing helpers (parse_of, parse_time_mmss, pct, per15)
  Integration-style tests using temporary CSV files for radar aggregation and API responses

Common pitfalls
- Do not type the '>' character in PowerShell commands; it is only a prompt indicator.
- Test files must be named test_*.py to be discovered by Django.
- If old code seems to run, restarting the IDE (VS Code) often resolves it.
- CSV fields containing commas must be quoted (e.g. "January 01, 2024").
- Flaky tests (sometimes pass, sometimes fail) usually indicate non-deterministic logic.

Deterministic sorting note
The UFC radar logic originally used a set -> list conversion, which caused unstable ordering.
A deterministic tie-breaker was added to the sort key (date + event name) to guarantee consistent results.


=====================
MAGYAR
=====================

Cél
A backend tesztek célja:
- a model szintű szabályok kikényszerítése (mezőtípusok, validátorok)
- az UFCStats CSV-alapú adatfeldolgozás és aggregáció ellenőrzése
- a DRF serializer működésének validálása (például harcosnév ellenőrzés)

Hol futtasd a teszteket?
A backend mappából futtasd, ahol a manage.py található.

Parancsok (PowerShell)

1) Összes teszt futtatása (commit előtt kötelező)
python manage.py test

2) Csak a fighters app tesztjei
python manage.py test fighters

3) Csak az ufcstats app tesztjei
python manage.py test ufcstats

4) Célzott futtatás (fejlesztés közben gyors ellenőrzéshez)
python manage.py test fighters.tests.test_models
python manage.py test fighters.tests.test_ufcstats_registry
python manage.py test fighters.tests.test_serializers
python manage.py test ufcstats.tests.test_model

Mikor melyiket használd?
- Fejlesztés közben: célzott tesztek
- Pull request vagy nagyobb módosítás előtt: fighters és ufcstats külön
- Commit előtt: mindig az összes teszt

Mit tesztelünk?

fighters
- test_models.py
  Model szintű validációk (pl. életkor, győzelmek, mezőkorlátok, full_clean)
- test_ufcstats_registry.py
  Service logika: harcosnév ellenőrzés UFCStats CSV referencia alapján, mocking használatával
- test_serializers.py
  DRF serializer validáció: hibás vagy nem létező harcosnév elutasítása

ufcstats
- test_model.py (a név félrevezető, a radar logikát teszteli)
  Unit tesztek parse helper függvényekre
  Integráció jellegű tesztek ideiglenes CSV fájlokkal (radar aggregáció és API válaszok)

Gyakori hibák
- PowerShellben ne írd be a '>' karaktert, az csak prompt jel.
- A tesztfájlok neve test_*.py kell legyen.
- Ha régi kód futna, egy VS Code újraindítás gyakran megoldja.
- CSV-ben a vesszőt tartalmazó mezőket idézőjelbe kell tenni.
- Flaky teszt (néha zöld, néha piros) nem determinisztikus logikára utal.

Determininsztikus rendezés megjegyzés
Az UFC radar logikában a set -> list sorrend nem stabil.
Ezért került be egy másodlagos rendezési kulcs (dátum + event név),
ami garantálja az állandó, megismételhető sorrendet.
