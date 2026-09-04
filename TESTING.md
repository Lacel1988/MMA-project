# Testing / Tesztelés

Testing and validation in this project consist of multiple complementary layers:

1) Automated tests (unit/integration) run in a temporary isolated Django test database.
2) Strict data integrity check validates database fighters against UFCStats reference data.
3) Fuzzy name audit detects possible typos and manual data entry errors.
4) Import and sync management commands support dry-run execution for safe verification before applying database changes.
5) Playwright end-to-end tests validate complete user flows through the React frontend, Django backend, and a real Chromium browser.

---

## Prerequisites / Előfeltételek

Before running tests or validation commands make sure the required environments are prepared.

English:

Backend:

```cmd
cd backend
```

```cmd
python -m pip install -r requirements.txt
```

```cmd
python manage.py migrate
```

For Playwright E2E testing, Node.js dependencies must also be installed from the project root:

```cmd
npm install
```

Install the Chromium browser used by Playwright:

```cmd
npx playwright install chromium
```

Magyar:

Backend:

```cmd
cd backend
```

```cmd
python -m pip install -r requirements.txt
```

```cmd
python manage.py migrate
```

A Playwright E2E teszteléshez a projekt gyökerében a Node.js függőségeket is telepíteni kell:

```cmd
npm install
```

A Playwright által használt Chromium böngésző telepítése:

```cmd
npx playwright install chromium
```

---

# ENGLISH

## 1) Automated tests (Django test runner)

Purpose:

- Verify backend logic in isolation.
- Run unit and integration tests in a temporary Django-managed test database.
- These tests do not validate the current development database content.

Run all backend tests:

```cmd
cd backend
```

```cmd
python manage.py test
```

Run tests for a single app:

```cmd
python manage.py test fighters
```

```cmd
python manage.py test ufcstats
```

Run a specific test module:

```cmd
python manage.py test ufcstats.tests.test_model
```

Notes:

- These tests run against a temporary test database created by Django.
- They do not validate the existing development database.
- UFCStats radar tests are deterministic and use small temporary CSV fixtures.

---

## 2) Strict data integrity check

Command:

```cmd
python manage.py check_fighter_registry
```

Purpose:

- Verify that every Fighter record stored in the database exists in the UFCStats reference dataset.
- Uses fighter name and `ufcstats_url` during validation.
- Helps detect invalid, fake, or inconsistent records in the database.

Reference files:

```text
backend/data/ufcstats/ufc_fighter_details.csv
```

```text
backend/data/ufcstats/ufc_fighter_tott.csv
```

Expected output:

OK when all fighter records match the reference dataset.

Example OK output:

```text
OK: All fighters match UFCStats CSV reference.
```

Example FAIL output:

```text
FAIL: 1 fighter(s) not found in UFCStats CSV reference:
- id=15 name=Teszt Elek url=None
```

---

## 3) Fighter name audit (fuzzy matching / typo detection)

Command:

```cmd
python manage.py audit_fighter_name_integrity
```

Purpose:

- Detect possible typos or manually inserted incorrect fighter names.
- Uses similarity-based comparison against UFCStats reference names.
- Example: `"Yon Yones"` may suggest `"Jon Jones"`.

Useful variants:

Only suspicious records:

```cmd
python manage.py audit_fighter_name_integrity --only-suspects
```

Limit check size:

```cmd
python manage.py audit_fighter_name_integrity --limit 50
```

Strict CI-style check:

```cmd
python manage.py audit_fighter_name_integrity --only-suspects --fail-on-suspects
```

What it does:

- `[OK]` exact match found
- `[SUSPECT]` likely typo with suggestions
- `[MISS]` no close match found

---

## 4) Fighter sync from recent UFCStats CSV data

Command:

```cmd
python manage.py sync_recent_fighters_csv --days 365 --dry-run --show-invalid
```

Purpose:

- Synchronize fighters appearing in recent UFCStats events.
- Creates or updates Fighter records from CSV data.
- Fills wins, losses, and draw values.
- Tries to determine the fighter division from fight results.
- Can safely run in dry-run mode before making real changes.

Useful variants:

Dry-run with invalid sample output:

```cmd
python manage.py sync_recent_fighters_csv --days 365 --dry-run --show-invalid --show-invalid-limit 30
```

Dry-run with unknown division fallback:

```cmd
python manage.py sync_recent_fighters_csv --days 365 --dry-run --ensure-unknown-division
```

Dry-run with canonical division creation logic enabled:

```cmd
python manage.py sync_recent_fighters_csv --days 365 --dry-run --create-missing-divisions
```

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

```cmd
python manage.py import_ufc_fighters
```

Purpose:

- Import and update fighter profile attributes from UFCStats CSV files.
- Matches fighters by `ufcstats_url` first, then by normalized fighter name.
- Updates profile-related fields such as:
  - `ufcstats_url`
  - `height_in`
  - `weight_lbs`
  - `reach_in`
  - `nickname`

Useful variants:

Dry-run on first 20 records:

```cmd
python manage.py import_ufc_fighters --limit 20
```

Full apply mode:

```cmd
python manage.py import_ufc_fighters --apply
```

What it does:

- reads fighter profile CSV files
- matches existing database fighters against reference rows
- updates physical profile data and nickname
- runs model validation before saving in apply mode

Note:

- Without `--apply` this command behaves as a safe dry-run preview.

---

## 6) Tale of the Tape unit import

Command:

```cmd
python manage.py import_tott_units --dry-run
```

Purpose:

- Import Tale of the Tape physical values into the model fields used by the application.
- Updates:
  - `height_in`
  - `weight_lbs`
  - `reach_in`
- Matches fighters primarily through the UFCStats URL identifier.

Useful variants:

Dry-run for first 20 records:

```cmd
python manage.py import_tott_units --dry-run --limit 20
```

Full dry-run:

```cmd
python manage.py import_tott_units --dry-run
```

Apply changes:

```cmd
python manage.py import_tott_units
```

What it does:

- reads `ufc_fighter_tott.csv`
- extracts height, weight, and reach
- converts values into model-compatible units
- updates existing fighter records

---

## 7) UFC profile image import

Command:

```cmd
python manage.py import_ufc_upload_images --dry-run --limit 20
```

Purpose:

- Downloads fighter profile images from UFC athlete pages.
- Saves the image into `Fighter.upload_image`.
- Supports safe dry-run testing before writing files.

Useful variants:

Dry-run only for fighters missing an image:

```cmd
python manage.py import_ufc_upload_images --dry-run --limit 20 --only-missing
```

Dry-run on a larger sample:

```cmd
python manage.py import_ufc_upload_images --dry-run --limit 50
```

Apply missing images only:

```cmd
python manage.py import_ufc_upload_images --only-missing
```

Force overwrite existing images:

```cmd
python manage.py import_ufc_upload_images --force
```

What it does:

- builds athlete page URL from fighter name
- downloads the `og:image` metadata image
- stores the file in `Fighter.upload_image`
- supports overwrite and missing-file recovery logic

Note:

- This command depends on external UFC page structure, therefore dry-run testing is recommended first.

---

## 8) Playwright end-to-end tests

Purpose:

- Validate complete user flows through the React frontend and Django backend.
- Verify that frontend components, API communication, authentication, and rendered data work together.
- Run tests in a real Chromium browser controlled by Playwright.
- Use an isolated E2E database so normal development data is not modified.

Technology:

- Playwright
- TypeScript
- Node.js
- Chromium
- React / Vite frontend
- Django backend

### Test architecture

Playwright itself does not run inside the Python virtual environment.

The architecture is:

```text
Node.js + TypeScript
        |
        v
Playwright Test
        |
        v
Chromium browser
        |
        v
React frontend
        |
        v
Django backend
        |
        v
Isolated E2E database
```

The Python virtual environment is used by the Django backend that serves the application during the E2E test run.

### Python environment

Example PowerShell activation from the project root:

```powershell
& "$PWD\.venv-e2e\Scripts\Activate.ps1"
```

If the Playwright configuration needs an explicit Python interpreter:

```powershell
$env:PLAYWRIGHT_PYTHON="$PWD\.venv-e2e\Scripts\python.exe"
```

### Run all E2E tests

From the project root:

```cmd
npx playwright test
```

### Run with visible browser

```cmd
npx playwright test --headed
```

This opens a visible Chromium window and allows the browser automation to be observed.

### Open Playwright UI Mode

```cmd
npx playwright test --ui
```

UI Mode allows tests to be:

- started individually
- filtered
- inspected interactively
- stepped through visually
- investigated after a failure

### Run one test file

Example:

```cmd
npx playwright test e2e/tests/compare.spec.ts
```

### Run one specific test by name

```cmd
npx playwright test -g "compares two fighters"
```

### Open the HTML report

```cmd
npx playwright show-report
```

The HTML report shows:

- passed tests
- failed tests
- execution duration
- test files
- individual test cases
- failure diagnostics

### Current E2E coverage

The current suite contains 13 automated tests.

Authentication:

- login screen is shown to unauthenticated users
- invalid credentials are rejected
- successful login and logout
- registration validation

Fighter database:

- fighter list loading
- fighter detail page
- fighter search
- division filtering
- empty result handling

Fighter comparison:

- selecting two fighters
- Tale of the Tape rendering
- fighter statistics
- two radar charts
- fighter names and recent fight data

Forum:

- authenticated comment creation
- guest access restriction

Smoke testing:

- critical authenticated application navigation

API error handling:

- missing fighter resource returns HTTP 404
- missing radar fighter parameter returns validation error

Current verified result:

```text
13 tests
13 passed
0 failed
0 flaky
0 skipped
```

The test suite was successfully executed locally on Chromium.

### Example E2E flow

The fighter comparison test performs a complete user interaction:

```text
Open application
    |
    v
Open Compare view
    |
    v
Select Charles Oliveira
    |
    v
Select Islam Makhachev
    |
    v
Frontend requests comparison data
    |
    v
Django API responds
    |
    v
React renders statistics
    |
    v
Verify Tale of the Tape
    |
    v
Verify two radar charts
    |
    v
Verify fighter data
    |
    v
PASS
```

Example Playwright assertion flow:

```typescript
await page.getByRole("button", { name: "Compare", exact: true }).click();

await expect(page.getByLabel("Fighter A")).toBeVisible();

await selectAutocomplete(page, "Fighter A", "Charles Oliveira");
await selectAutocomplete(page, "Fighter B", "Islam Makhachev");

await expect(page.getByTestId("tale-of-the-tape"))
  .toContainText("Lightweight");

await expect(page.getByTestId("fighter-radar-chart"))
  .toHaveCount(2);

await expect(
  page.getByText("Charles Oliveira | last 5 fights")
).toBeVisible();

await expect(
  page.getByText("Islam Makhachev | last 5 fights")
).toBeVisible();
```

### Stable element selectors

The suite prefers stable Playwright locators:

```typescript
page.getByRole(...)
page.getByLabel(...)
page.getByTestId(...)
page.getByText(...)
```

Some frontend components contain `data-testid` attributes to provide stable automation targets.

These are preferred over fragile CSS or XPath selectors when appropriate.

### Automatic waiting

Playwright automatically waits for elements and assertions to become ready when possible.

Example:

```typescript
await expect(page.getByLabel("Fighter A")).toBeVisible();
```

This avoids unnecessary fixed delays.

Arbitrary waits such as:

```typescript
waitForTimeout(...)
```

should generally be avoided unless there is a specific technical reason.

### Fixtures and authenticated users

Reusable fixtures prepare common test conditions.

The E2E suite includes an authenticated test fixture that provides a logged-in Playwright user for tests that require authentication.

This allows tests to reuse authentication setup instead of repeating login logic in every test.

### Page Object Model

Reusable fighter-related browser interactions are stored in the Page Object layer.

Example location:

```text
e2e/pages/fighters.page.ts
```

The Page Object Model helps:

- reduce duplicated test code
- keep selectors in reusable locations
- separate page interaction logic from test assertions
- make tests easier to maintain

### Isolated E2E database

The E2E environment uses a dedicated database:

```text
db.e2e.sqlite3
```

This allows browser automation tests to run without modifying the normal development database.

Test data can therefore be prepared deterministically before the suite starts.

Related backend helper:

```text
backend/e2e_prepare.py
```

### Failure diagnostics

The Playwright configuration supports diagnostic artifacts such as:

- HTML reports
- screenshots
- trace files
- video recordings

These make failed E2E tests easier to investigate.

### Chromium

Chromium is an open-source browser project and browser engine used as the foundation for several browsers, including Google Chrome.

Playwright installs and controls its own compatible browser binaries.

If Playwright itself is installed but Chromium is missing, browser-based tests cannot start.

### Troubleshooting: missing browser executable

Typical error:

```text
browserType.launch:
Executable doesn't exist
```

Solution:

```cmd
npx playwright install chromium
```

A common symptom is:

- API tests pass
- browser-based tests fail immediately
- UI tests execute only for a few milliseconds

In this case, verify that the Playwright browser binaries are installed.

### Related files

```text
playwright.config.ts

e2e/
├── README.md
├── QA_FINDINGS.md
├── fixtures/
│   └── test.ts
├── pages/
│   └── fighters.page.ts
└── tests/
    ├── api-errors.spec.ts
    ├── auth.spec.ts
    ├── compare.spec.ts
    ├── fighters.spec.ts
    ├── forum.spec.ts
    └── smoke.spec.ts

backend/e2e_prepare.py
```

---

## Suggested verification order

Recommended safe validation sequence:

```cmd
cd backend
python manage.py test
python manage.py check_fighter_registry
python manage.py audit_fighter_name_integrity --only-suspects
python manage.py import_ufc_fighters --limit 20
python manage.py import_tott_units --dry-run --limit 20
python manage.py sync_recent_fighters_csv --days 365 --dry-run --show-invalid
python manage.py import_ufc_upload_images --dry-run --limit 10 --only-missing
```

Then return to the project root and run the full E2E suite:

```cmd
cd ..
npx playwright test
```

For interactive inspection:

```cmd
npx playwright test --ui
```

---

## Summary

The project uses multiple complementary testing and validation layers:

1) Django automated unit and integration tests
2) strict UFCStats reference-based data integrity validation
3) fuzzy fighter name auditing for human data-entry errors
4) dry-run capable import and synchronization commands
5) Playwright browser-based end-to-end automation

Together these layers help verify:

- backend logic
- database consistency
- imported data
- frontend behavior
- API communication
- authentication
- complete user workflows

This supports development, debugging, QA automation, and reliable portfolio documentation.

---

# MAGYAR

## 1) Automatizált tesztek (Django tesztfuttató)

Cél:

- A backend logika ellenőrzése elkülönített környezetben.
- Unit és integrációs tesztek futtatása ideiglenes Django teszt adatbázisban.
- Ezek a tesztek nem a fejlesztői adatbázis aktuális tartalmát vizsgálják.

Minden backend teszt futtatása:

```cmd
cd backend
```

```cmd
python manage.py test
```

Egy adott app tesztjei:

```cmd
python manage.py test fighters
```

```cmd
python manage.py test ufcstats
```

Egy konkrét tesztmodul futtatása:

```cmd
python manage.py test ufcstats.tests.test_model
```

Megjegyzések:

- A tesztek a Django által létrehozott ideiglenes teszt adatbázisban futnak.
- Nem a jelenlegi fejlesztői adatbázis tartalmát ellenőrzik.
- Az UFCStats radar tesztek determinisztikusak és kis ideiglenes CSV mintákat használnak.

---

## 2) Szigorú adatkonzisztencia ellenőrzés

Parancs:

```cmd
python manage.py check_fighter_registry
```

Cél:

- Ellenőrzi, hogy a DB-ben szereplő minden Fighter rekord létezik-e az UFCStats referenciaadatokban.
- A validáció név és `ufcstats_url` alapján történik.
- Kiszűri a hibás, fake vagy inkonzisztens rekordokat.

Referencia fájlok:

```text
backend/data/ufcstats/ufc_fighter_details.csv
```

```text
backend/data/ufcstats/ufc_fighter_tott.csv
```

Várt eredmény:

OK, ha minden fighter illeszkedik a referenciaadatokhoz.

Példa sikeres eredmény:

```text
OK: All fighters match UFCStats CSV reference.
```

Példa hiba:

```text
FAIL: 1 fighter(s) not found in UFCStats CSV reference:
- id=15 name=Teszt Elek url=None
```

---

## 3) Fighter név audit (fuzzy matching / elgépelés figyelés)

Parancs:

```cmd
python manage.py audit_fighter_name_integrity
```

Cél:

- Az elgépelések és kézi adatbevitelből eredő hibák felismerése.
- Hasonlósági alapú összevetést végez az UFCStats referencia nevekkel.
- Példa: `"Yon Yones"` esetén javasolhatja a `"Jon Jones"` nevet.

Hasznos változatok:

Csak a gyanús rekordok:

```cmd
python manage.py audit_fighter_name_integrity --only-suspects
```

Limitált ellenőrzés:

```cmd
python manage.py audit_fighter_name_integrity --limit 50
```

Szigorú, CI-szerű ellenőrzés:

```cmd
python manage.py audit_fighter_name_integrity --only-suspects --fail-on-suspects
```

Mit csinál:

- `[OK]` pontos egyezést talált
- `[SUSPECT]` valószínű elgépelést jelöl és javaslatot ad
- `[MISS]` nincs közeli találat

---

## 4) Fighter szinkronizálás friss UFCStats CSV adatokból

Parancs:

```cmd
python manage.py sync_recent_fighters_csv --days 365 --dry-run --show-invalid
```

Cél:

- Az utóbbi UFC események alapján fighter rekordokat hoz létre vagy frissít.
- Kitölti a wins, losses és draw mezőket.
- Megpróbálja meghatározni a divíziót.
- Dry-run módban biztonságosan tesztelhető.

Hasznos változatok:

Dry-run hibás rekordok mintájával:

```cmd
python manage.py sync_recent_fighters_csv --days 365 --dry-run --show-invalid --show-invalid-limit 30
```

Dry-run unknown division fallbackkel:

```cmd
python manage.py sync_recent_fighters_csv --days 365 --dry-run --ensure-unknown-division
```

Dry-run hiányzó divíziók kezelési logikájával:

```cmd
python manage.py sync_recent_fighters_csv --days 365 --dry-run --create-missing-divisions
```

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

```cmd
python manage.py import_ufc_fighters
```

Cél:

- Fighter profiladatok betöltése és frissítése UFCStats CSV fájlokból.
- Elsősorban `ufcstats_url` alapján illeszt, másodsorban normalizált név alapján.
- Olyan mezőket frissít, mint:
  - `ufcstats_url`
  - `height_in`
  - `weight_lbs`
  - `reach_in`
  - `nickname`

Hasznos változatok:

Dry-run az első 20 rekordra:

```cmd
python manage.py import_ufc_fighters --limit 20
```

Éles futtatás:

```cmd
python manage.py import_ufc_fighters --apply
```

Mit csinál:

- beolvassa a fighter profil CSV-ket
- összeveti a DB rekordokat a referencia sorokkal
- frissíti a fizikai adatokat és a becenevet
- apply módban model validáció után ment

Megjegyzés:

- A command alapból biztonságos dry-run előnézetként működik, amíg nincs megadva a `--apply`.

---

## 6) Tale of the Tape egységek importálása

Parancs:

```cmd
python manage.py import_tott_units --dry-run
```

Cél:

- A Tale of the Tape fizikai adatok betöltése az alkalmazás által használt mezőkbe.
- A következő mezőket frissíti:
  - `height_in`
  - `weight_lbs`
  - `reach_in`
- Elsősorban UFCStats URL azonosító alapján illeszt.

Hasznos változatok:

Dry-run az első 20 rekordra:

```cmd
python manage.py import_tott_units --dry-run --limit 20
```

Teljes dry-run:

```cmd
python manage.py import_tott_units --dry-run
```

Éles futtatás:

```cmd
python manage.py import_tott_units
```

Mit csinál:

- beolvassa az `ufc_fighter_tott.csv` fájlt
- kinyeri a height, weight és reach adatokat
- model-kompatibilis mértékegységekre alakítja őket
- frissíti a meglévő fighter rekordokat

---

## 7) UFC profilképek importálása

Parancs:

```cmd
python manage.py import_ufc_upload_images --dry-run --limit 20
```

Cél:

- Fighter profilképek letöltése az UFC athlete oldalakról.
- A képet a `Fighter.upload_image` mezőbe menti.
- Dry-run módban biztonságosan tesztelhető.

Hasznos változatok:

Dry-run csak hiányzó képekre:

```cmd
python manage.py import_ufc_upload_images --dry-run --limit 20 --only-missing
```

Dry-run nagyobb mintára:

```cmd
python manage.py import_ufc_upload_images --dry-run --limit 50
```

Éles futtatás csak hiányzó képekre:

```cmd
python manage.py import_ufc_upload_images --only-missing
```

Meglévő képek felülírása:

```cmd
python manage.py import_ufc_upload_images --force
```

Mit csinál:

- fighter névből athlete oldal URL-t képez
- letölti az oldal `og:image` képét
- eltárolja a fájlt a `Fighter.upload_image` mezőben
- kezeli a hiányzó fájlokat és az opcionális felülírást

Megjegyzés:

- Ez a command külső UFC oldalstruktúrától is függ, ezért először dry-run tesztelés ajánlott.

---

## 8) Playwright end-to-end tesztek

Cél:

- Teljes felhasználói folyamatok ellenőrzése a React frontend és Django backend között.
- Annak ellenőrzése, hogy a frontend komponensek, API kommunikáció, autentikáció és megjelenített adatok együtt megfelelően működnek-e.
- A tesztek valódi Chromium böngészőben futnak, amelyet a Playwright vezérel.
- Elkülönített E2E adatbázist használ, így a normál fejlesztői adatbázis nem módosul.

Használt technológiák:

- Playwright
- TypeScript
- Node.js
- Chromium
- React / Vite frontend
- Django backend

### Tesztelési architektúra

A Playwright maga nem a Python virtual environmentben fut.

A rendszer felépítése:

```text
Node.js + TypeScript
        |
        v
Playwright Test
        |
        v
Chromium böngésző
        |
        v
React frontend
        |
        v
Django backend
        |
        v
Elkülönített E2E adatbázis
```

A Python virtual environment a tesztelés közben használt Django backend elkülönített Python környezetét biztosítja.

### Python környezet aktiválása

PowerShellből, a projekt gyökerében:

```powershell
& "$PWD\.venv-e2e\Scripts\Activate.ps1"
```

Ha a Playwright konfiguráció explicit Python interpretert vár:

```powershell
$env:PLAYWRIGHT_PYTHON="$PWD\.venv-e2e\Scripts\python.exe"
```

### Minden E2E teszt futtatása

A projekt gyökeréből:

```cmd
npx playwright test
```

### Tesztek futtatása látható böngészővel

```cmd
npx playwright test --headed
```

Ebben a módban megjelenik a Chromium böngésző ablaka, így látható, ahogy a Playwright végrehajtja a felhasználói műveleteket.

### Playwright UI Mode

```cmd
npx playwright test --ui
```

Az UI Mode segítségével a tesztek:

- külön-külön futtathatók
- szűrhetők
- interaktívan vizsgálhatók
- vizuálisan követhetők
- hiba esetén részletesebben elemezhetők

### Egyetlen tesztfájl futtatása

Példa:

```cmd
npx playwright test e2e/tests/compare.spec.ts
```

### Egy konkrét teszt futtatása név alapján

```cmd
npx playwright test -g "compares two fighters"
```

### HTML riport megnyitása

```cmd
npx playwright show-report
```

A HTML riport megmutatja:

- sikeres teszteket
- sikertelen teszteket
- futási időket
- tesztfájlokat
- egyes teszteseteket
- hibakeresési információkat

### Jelenlegi E2E lefedettség

A jelenlegi tesztcsomag 13 automatizált tesztet tartalmaz.

Autentikáció:

- login oldal megjelenítése vendég felhasználónak
- hibás belépési adatok kezelése
- sikeres login és logout
- regisztráció validáció

Fighter adatbázis:

- fighter lista betöltése
- fighter részletes adatlap
- keresés
- divízió szűrés
- üres találati lista kezelése

Fighter összehasonlítás:

- két fighter kiválasztása
- Tale of the Tape megjelenítése
- fighter statisztikák
- két radar chart
- fighter nevek és legutóbbi mérkőzések adatai

Fórum:

- komment létrehozása belépett felhasználóval
- vendég hozzáférés korlátozása

Smoke teszt:

- kritikus alkalmazásnézetek és navigáció ellenőrzése

API hibakezelés:

- nem létező fighter esetén HTTP 404
- hiányzó radar fighter paraméter esetén validációs hiba

Jelenleg ellenőrzött eredmény:

```text
13 teszt
13 sikeres
0 sikertelen
0 flaky
0 kihagyott
```

A tesztcsomag lokálisan sikeresen lefutott Chromium böngészővel.

### Példa teljes E2E folyamatra

A fighter összehasonlítási teszt:

```text
Alkalmazás megnyitása
    |
    v
Compare nézet megnyitása
    |
    v
Charles Oliveira kiválasztása
    |
    v
Islam Makhachev kiválasztása
    |
    v
Frontend API kérés
    |
    v
Django API válasz
    |
    v
React megjeleníti a statisztikákat
    |
    v
Tale of the Tape ellenőrzése
    |
    v
Két radar chart ellenőrzése
    |
    v
Fighter adatok ellenőrzése
    |
    v
PASS
```

### Stabil locatorok

A tesztek elsősorban stabil Playwright locatorokat használnak:

```typescript
page.getByRole(...)
page.getByLabel(...)
page.getByTestId(...)
page.getByText(...)
```

A frontend néhány komponensébe `data-testid` attribútumok kerültek, hogy az automatizált tesztek stabilan megtalálják a szükséges elemeket.

Ez általában megbízhatóbb megoldás, mint törékeny CSS vagy XPath selectorokra építeni.

### Automatikus várakozás

A Playwright lehetőség szerint automatikusan megvárja, hogy az elemek és assertionök a megfelelő állapotba kerüljenek.

Példa:

```typescript
await expect(page.getByLabel("Fighter A")).toBeVisible();
```

Ezért általában nincs szükség fix várakozásokra, például:

```typescript
waitForTimeout(...)
```

Ilyen fix várakozást csak konkrét technikai indok esetén érdemes használni.

### Fixture és autentikált felhasználó

Az ismétlődő tesztelési előfeltételekhez reusable fixture-ök használhatók.

A jelenlegi E2E rendszer tartalmaz autentikált teszt fixture-t, amely egy már bejelentkezott Playwright tesztfelhasználót biztosít azokhoz a tesztekhez, amelyekhez autentikáció szükséges.

Így nem kell minden tesztben külön megismételni a teljes login folyamatot.

### Page Object Model

Az újrafelhasználható fighter-oldali böngészőműveletek külön Page Object rétegben találhatók.

Példa:

```text
e2e/pages/fighters.page.ts
```

A Page Object Model előnyei:

- csökkenti az ismétlődő tesztkódot
- közös helyre szervezi a locatorokat
- elkülöníti az oldalkezelési logikát a teszt assertionöktől
- könnyebbé teszi a tesztek karbantartását

### Elkülönített E2E adatbázis

Az E2E környezet külön adatbázist használ:

```text
db.e2e.sqlite3
```

Ennek köszönhetően a böngészős automatizált tesztek nem módosítják a normál fejlesztői adatbázist.

A tesztadatok determinisztikusan előkészíthetők a tesztcsomag indulása előtt.

Kapcsolódó backend helper:

```text
backend/e2e_prepare.py
```

### Hibakeresési lehetőségek

A Playwright konfiguráció támogat hibakeresési artifactokat, például:

- HTML riport
- screenshot
- trace fájl
- videófelvétel

Ezek megkönnyítik a sikertelen E2E tesztek okának felderítését.

### Chromium

A Chromium egy nyílt forráskódú böngészőprojekt, amely több böngésző, többek között a Google Chrome alapjául is szolgál.

A Playwright saját kompatibilis böngésző-binárisokat telepít és vezérel.

Ha maga a Playwright telepítve van, de a Chromium nincs, a böngészőalapú tesztek nem tudnak elindulni.

### Gyakori hiba: hiányzó böngésző

Tipikus hiba:

```text
browserType.launch:
Executable doesn't exist
```

Megoldás:

```cmd
npx playwright install chromium
```

Jellemző tünet lehet:

- API tesztek sikeresek
- a böngészős tesztek azonnal elbuknak
- a UI tesztek csak néhány ezredmásodpercig futnak

Ebben az esetben először a Playwright böngésző telepítését érdemes ellenőrizni.

### Kapcsolódó fájlok

```text
playwright.config.ts

e2e/
├── README.md
├── QA_FINDINGS.md
├── fixtures/
│   └── test.ts
├── pages/
│   └── fighters.page.ts
└── tests/
    ├── api-errors.spec.ts
    ├── auth.spec.ts
    ├── compare.spec.ts
    ├── fighters.spec.ts
    ├── forum.spec.ts
    └── smoke.spec.ts

backend/e2e_prepare.py
```

---

## Javasolt ellenőrzési sorrend

Ajánlott biztonságos ellenőrzési sorrend:

```cmd
cd backend
python manage.py test
python manage.py check_fighter_registry
python manage.py audit_fighter_name_integrity --only-suspects
python manage.py import_ufc_fighters --limit 20
python manage.py import_tott_units --dry-run --limit 20
python manage.py sync_recent_fighters_csv --days 365 --dry-run --show-invalid
python manage.py import_ufc_upload_images --dry-run --limit 10 --only-missing
```

Ezután vissza kell lépni a projekt gyökerébe, és lefuttatni a teljes E2E tesztcsomagot:

```cmd
cd ..
npx playwright test
```

Interaktív vizsgálathoz:

```cmd
npx playwright test --ui
```

---

## Összegzés

A projekt több egymást kiegészítő tesztelési és validációs réteget használ:

1) Django unit és integrációs automatizált tesztek
2) szigorú UFCStats referencia alapú adatkonzisztencia ellenőrzés
3) fuzzy fighter név audit a kézi adatbeviteli hibák felismerésére
4) dry-run képes import és szinkronizálási parancsok
5) Playwright böngészőalapú end-to-end automatizálás

Ezek együtt segítenek ellenőrizni:

- a backend logikát
- az adatbázis konzisztenciáját
- az importált adatokat
- a frontend működését
- az API kommunikációt
- az autentikációt
- a teljes felhasználói folyamatokat

Ez támogatja a fejlesztést, hibakeresést, QA automatizálást és a projekt megbízható portfólió-dokumentációját.
