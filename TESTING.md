# Testing / Tesztelés

Testing and validation in this project consist of multiple complementary layers:

1) Automated tests (unit/integration) run in a temporary isolated Django test database.
2) Strict data integrity check validates database fighters against UFCStats reference data.
3) Fuzzy name audit detects possible typos and manual data entry errors.
4) Import and sync management commands support dry-run execution for safe verification before applying database changes.

---

## Prerequisites / Előfeltételek

Before running tests or validation commands make sure the backend environment is prepared.

English:

cd backend
python -m pip install -r requirements.txt
python manage.py migrate

Magyar:

cd backend
python -m pip install -r requirements.txt
python manage.py migrate

---

# ENGLISH

## 1) Automated tests (Django test runner)

Purpose:

- Verify backend logic in isolation.
- Run unit and integration tests in a temporary Django-managed test database.
- These tests do not validate the current development database content.

Run all backend tests:

cd backend
python manage.py test

Run tests for a single app:

python manage.py test fighters
python manage.py test ufcstats

Run a specific test module:

python manage.py test ufcstats.tests.test_model

Notes:

- These tests run against a temporary test database created by Django.
- They do not validate the existing development database.
- UFCStats radar tests are deterministic and use small temporary CSV fixtures.

---

## 2) Strict data integrity check

Command:

python manage.py check_fighter_registry

Purpose:

- Verify that every Fighter record stored in the database exists in the UFCStats reference dataset.
- Uses fighter name and ufcstats_url during validation.
- Helps detect invalid, fake, or inconsistent records in the database.

Reference files:

backend/data/ufcstats/ufc_fighter_details.csv
backend/data/ufcstats/ufc_fighter_tott.csv

Expected output:

OK when all fighter records match the reference dataset.

Example OK output:

OK: All fighters match UFCStats CSV reference.

Example FAIL output:

FAIL: 1 fighter(s) not found in UFCStats CSV reference:
- id=15 name=Teszt Elek url=None

---

## 3) Fighter name audit (fuzzy matching / typo detection)

Command:

python manage.py audit_fighter_name_integrity

Purpose:

- Detect possible typos or manually inserted incorrect fighter names.
- Uses similarity-based comparison against UFCStats reference names.
- Example: "Yon Yones" may suggest "Jon Jones".

Useful variants:

Only suspicious records:

python manage.py audit_fighter_name_integrity --only-suspects

Limit check size:

python manage.py audit_fighter_name_integrity --limit 50

Strict CI-style check:

python manage.py audit_fighter_name_integrity --only-suspects --fail-on-suspects

What it does:

- [OK] exact match found
- [SUSPECT] likely typo with suggestions
- [MISS] no close match found

---

## 4) Fighter sync from recent UFCStats CSV data

Command:

python manage.py sync_recent_fighters_csv --days 365 --dry-run --show-invalid

Purpose:

- Synchronize fighters appearing in recent UFCStats events.
- Creates or updates Fighter records from CSV data.
- Fills wins, losses, draw values.
- Tries to determine the fighter division from fight results.
- Can safely run in dry-run mode before making real changes.

Useful variants:

Dry-run with invalid sample output:

python manage.py sync_recent_fighters_csv --days 365 --dry-run --show-invalid --show-invalid-limit 30

Dry-run with unknown division fallback:

python manage.py sync_recent_fighters_csv --days 365 --dry-run --ensure-unknown-division

Dry-run with canonical division creation logic enabled:

python manage.py sync_recent_fighters_csv --days 365 --dry-run --create-missing-divisions

What it does:

- indexes recent UFC events
- collects active fighters in the selected date window
- calculates W/L/D career totals from results CSV
- maps the most recent known division
- creates missing fighters or updates existing ones
- validates fighters before saving

---

## 5) Fighter profile import from UFCStats CSV files

Command:

python manage.py import_ufc_fighters

Purpose:

- Import and update fighter profile attributes from UFCStats CSV files.
- Matches fighters by ufcstats_url first, then by normalized fighter name.
- Updates profile-related fields such as:
  - ufcstats_url
  - height_in
  - weight_lbs
  - reach_in
  - nickname

Useful variants:

Dry-run on first 20 records:

python manage.py import_ufc_fighters --limit 20

Full apply mode:

python manage.py import_ufc_fighters --apply

What it does:

- reads fighter profile CSV files
- matches existing database fighters against reference rows
- updates physical profile data and nickname
- runs model validation before saving in apply mode

Note:

- Without --apply this command behaves as a safe dry-run preview.

---

## 6) Tale of the Tape unit import

Command:

python manage.py import_tott_units --dry-run

Purpose:

- Import Tale of the Tape physical values into the model fields used by the application.
- Updates:
  - height_in
  - weight_lbs
  - reach_in
- Matches fighters primarily through the UFCStats URL identifier.

Useful variants:

Dry-run for first 20 records:

python manage.py import_tott_units --dry-run --limit 20

Full dry-run:

python manage.py import_tott_units --dry-run

Apply changes:

python manage.py import_tott_units

What it does:

- reads ufc_fighter_tott.csv
- extracts height, weight, and reach
- converts values into model-compatible units
- updates existing fighter records

---

## 7) UFC profile image import

Command:

python manage.py import_ufc_upload_images --dry-run --limit 20

Purpose:

- Downloads fighter profile images from UFC athlete pages.
- Saves the image into Fighter.upload_image.
- Supports safe dry-run testing before writing files.

Useful variants:

Dry-run only for fighters missing an image:

python manage.py import_ufc_upload_images --dry-run --limit 20 --only-missing

Dry-run on a larger sample:

python manage.py import_ufc_upload_images --dry-run --limit 50

Apply missing images only:

python manage.py import_ufc_upload_images --only-missing

Force overwrite existing images:

python manage.py import_ufc_upload_images --force

What it does:

- builds athlete page URL from fighter name
- downloads the og:image metadata image
- stores the file in Fighter.upload_image
- supports overwrite and missing-file recovery logic

Note:

- This command depends on external UFC page structure, therefore dry-run testing is recommended first.

---

## Suggested verification order

Recommended safe validation sequence:

cd backend
python manage.py check_fighter_registry
python manage.py audit_fighter_name_integrity --only-suspects
python manage.py import_ufc_fighters --limit 20
python manage.py import_tott_units --dry-run --limit 20
python manage.py sync_recent_fighters_csv --days 365 --dry-run --show-invalid
python manage.py import_ufc_upload_images --dry-run --limit 10 --only-missing

---

# MAGYAR

## 1) Automatizált tesztek (Django tesztfuttató)

Cél:

- A backend logika ellenőrzése elkülönített környezetben.
- Unit és integrációs tesztek futtatása ideiglenes Django teszt adatbázisban.
- Ezek a tesztek nem a fejlesztői adatbázist vizsgálják.

Minden backend teszt futtatása:

cd backend
python manage.py test

Egy adott app tesztjei:

python manage.py test fighters
python manage.py test ufcstats

Egy konkrét tesztmodul futtatása:

python manage.py test ufcstats.tests.test_model

Megjegyzések:

- A tesztek a Django által létrehozott ideiglenes teszt adatbázisban futnak.
- Nem a jelenlegi fejlesztői adatbázis tartalmát ellenőrzik.
- Az UFCStats radar tesztek determinisztikusak és kis ideiglenes CSV mintákat használnak.

---

## 2) Szigorú adatkonzisztencia ellenőrzés

Parancs:

python manage.py check_fighter_registry

Cél:

- Ellenőrzi, hogy a DB-ben szereplő minden Fighter rekord létezik-e az UFCStats referenciaadatokban.
- A validáció név és ufcstats_url alapján történik.
- Kiszűri a hibás, fake vagy inkonzisztens rekordokat.

Referencia fájlok:

backend/data/ufcstats/ufc_fighter_details.csv
backend/data/ufcstats/ufc_fighter_tott.csv

Várt eredmény:

OK, ha minden fighter illeszkedik a referencia adatokhoz.

Példa hiba:

FAIL: 1 fighter(s) not found in UFCStats CSV reference:
- id=15 name=Teszt Elek url=None

---

## 3) Fighter név audit (fuzzy matching / elgépelés figyelés)

Parancs:

python manage.py audit_fighter_name_integrity

Cél:

- Az elgépelések és kézi adatbevitelből eredő hibák felismerése.
- Hasonlósági alapú összevetést végez az UFCStats referencia nevekkel.
- Példa: "Yon Yones" esetén javasolhatja a "Jon Jones" nevet.

Hasznos változatok:

Csak a gyanús rekordok:

python manage.py audit_fighter_name_integrity --only-suspects

Limitált ellenőrzés:

python manage.py audit_fighter_name_integrity --limit 50

Szigorú, CI-szerű ellenőrzés:

python manage.py audit_fighter_name_integrity --only-suspects --fail-on-suspects

Mit csinál:

- [OK] pontos egyezést talált
- [SUSPECT] valószínű elgépelést jelöl és javaslatot ad
- [MISS] nincs közeli találat

---

## 4) Fighter szinkronizálás friss UFCStats CSV adatokból

Parancs:

python manage.py sync_recent_fighters_csv --days 365 --dry-run --show-invalid

Cél:

- Az utóbbi UFC események alapján fighter rekordokat hoz létre vagy frissít.
- Kitölti a wins, losses, draw mezőket.
- Megpróbálja meghatározni a divíziót.
- Dry-run módban biztonságosan tesztelhető.

Hasznos változatok:

Dry-run hibás rekordok mintájával:

python manage.py sync_recent_fighters_csv --days 365 --dry-run --show-invalid --show-invalid-limit 30

Dry-run unknown division fallbackkel:

python manage.py sync_recent_fighters_csv --days 365 --dry-run --ensure-unknown-division

Dry-run hiányzó divíziók kezelési logikájával:

python manage.py sync_recent_fighters_csv --days 365 --dry-run --create-missing-divisions

Mit csinál:

- feldolgozza a friss UFC eseményeket
- összegyűjti az adott időablak aktív fightereit
- kiszámolja a W/L/D statisztikákat
- meghatározza a legfrissebb ismert divíziót
- létrehozza vagy frissíti a fighter rekordokat
- mentés előtt validál

---

## 5) Fighter profil adatok importálása UFCStats CSV fájlokból

Parancs:

python manage.py import_ufc_fighters

Cél:

- Fighter profiladatok betöltése és frissítése UFCStats CSV fájlokból.
- Elsősorban ufcstats_url alapján illeszt, másodsorban normalizált név alapján.
- Olyan mezőket frissít, mint:
  - ufcstats_url
  - height_in
  - weight_lbs
  - reach_in
  - nickname

Hasznos változatok:

Dry-run az első 20 rekordra:

python manage.py import_ufc_fighters --limit 20

Éles futtatás:

python manage.py import_ufc_fighters --apply

Mit csinál:

- beolvassa a fighter profil CSV-ket
- összeveti a DB rekordokat a referencia sorokkal
- frissíti a fizikai adatokat és a becenevet
- apply módban model validáció után ment

Megjegyzés:

- A command alapból biztonságos dry-run előnézetként működik, amíg nincs megadva a --apply.

---

## 6) Tale of the Tape egységek importálása

Parancs:

python manage.py import_tott_units --dry-run

Cél:

- A Tale of the Tape fizikai adatok betöltése az alkalmazás által használt mezőkbe.
- A következő mezőket frissíti:
  - height_in
  - weight_lbs
  - reach_in
- Elsősorban UFCStats URL azonosító alapján illeszt.

Hasznos változatok:

Dry-run az első 20 rekordra:

python manage.py import_tott_units --dry-run --limit 20

Teljes dry-run:

python manage.py import_tott_units --dry-run

Éles futtatás:

python manage.py import_tott_units

Mit csinál:

- beolvassa az ufc_fighter_tott.csv fájlt
- kinyeri a height, weight és reach adatokat
- model-kompatibilis mértékegységekre alakítja őket
- frissíti a meglévő fighter rekordokat

---

## 7) UFC profilképek importálása

Parancs:

python manage.py import_ufc_upload_images --dry-run --limit 20

Cél:

- Fighter profilképek letöltése az UFC athlete oldalakról.
- A képet a Fighter.upload_image mezőbe menti.
- Dry-run módban biztonságosan tesztelhető.

Hasznos változatok:

Dry-run csak hiányzó képekre:

python manage.py import_ufc_upload_images --dry-run --limit 20 --only-missing

Dry-run nagyobb mintára:

python manage.py import_ufc_upload_images --dry-run --limit 50

Éles futtatás csak hiányzó képekre:

python manage.py import_ufc_upload_images --only-missing

Meglévő képek felülírása:

python manage.py import_ufc_upload_images --force

Mit csinál:

- fighter névből athlete oldal URL-t képez
- letölti az oldal og:image képét
- eltárolja a fájlt a Fighter.upload_image mezőben
- kezeli a hiányzó fájlokat és az opcionális felülírást

Megjegyzés:

- Ez a command külső UFC oldalstruktúrától is függ, ezért először dry-run tesztelés ajánlott.

---

## Javasolt ellenőrzési sorrend

Ajánlott biztonságos ellenőrzési sorrend:

cd backend
python manage.py check_fighter_registry
python manage.py audit_fighter_name_integrity --only-suspects
python manage.py import_ufc_fighters --limit 20
python manage.py import_tott_units --dry-run --limit 20
python manage.py sync_recent_fighters_csv --days 365 --dry-run --show-invalid
python manage.py import_ufc_upload_images --dry-run --limit 10 --only-missing

---

## Összegzés

A rendszer több szinten biztosítja az adatok helyességét és megbízhatóságát:

1) automatizált tesztek a backend logika ellenőrzésére
2) szigorú referencia alapú adatkonzisztencia ellenőrzés
3) fuzzy név audit az emberi hibák kiszűrésére
4) dry-run képes import és szinkron parancsok a biztonságos ellenőrzéshez

Ez együtt támogatja a fejlesztői munkát, a hibakeresést és a vizsgaremek dokumentáció hitelességét.