# Testing / Tesztelés

This project contains two complementary layers:

1) **Automated tests** (unit/integration) run in an isolated *test database* created by Django.
2) **Data integrity check** verifies the *current development database* against the UFCStats CSV reference.

---

## ENGLISH

### 1) Automated tests (Django test runner)

Run all backend tests:

```powershell
cd backend
python manage.py test
```

Run tests for a single app:

```powershell
python manage.py test fighters
python manage.py test ufcstats
```

Run a specific test module:

```powershell
python manage.py test ufcstats.tests.test_model
```

Notes:
- These tests run against a temporary test database created by Django and do **not** validate your existing dev data.
- UFCStats radar tests are designed to be deterministic and use small temporary CSV fixtures.

### 2) Data integrity check (DB vs UFCStats CSV)

Purpose:
- Verify that every `Fighter.name` stored in the database exists in the UFCStats CSV fighter reference (`ufc_fighter_details.csv`, columns: `FIRST`, `LAST`).
- This is useful to detect accidental “fake” or misspelled fighters added by admins.

Run:

```powershell
cd backend
python manage.py check_fighter_registry
```

Expected output:
- **OK** when all names match the CSV reference
- **FAIL** with a list of invalid records (id + name) when mismatches exist

Example FAIL output:

```
FAIL: 1 fighter(s) not found in UFCStats CSV reference:
- id=15 name=Teszt Elek
```

---

## MAGYAR

### 1) Automatizált tesztek (Django tesztfuttató)

Minden backend teszt futtatása:

```powershell
cd backend
python manage.py test
```

Egy adott app tesztjei:

```powershell
python manage.py test fighters
python manage.py test ufcstats
```

Egy konkrét teszt modul futtatása:

```powershell
python manage.py test ufcstats.tests.test_model
```

Megjegyzés:
- A tesztek a Django által létrehozott ideiglenes *teszt adatbázisban* futnak, ezért **nem** ellenőrzik a saját fejlesztői adatbázisod tartalmát.
- Az ufcstats radar tesztek determinisztikusak, kis ideiglenes CSV mintákkal dolgoznak.

### 2) Adatkonzisztencia ellenőrzés (DB vs UFCStats CSV)

Cél:
- Ellenőrizni, hogy a DB-ben tárolt összes `Fighter.name` szerepel-e az UFCStats fighter CSV referenciában
  (`ufc_fighter_details.csv`, oszlopok: `FIRST`, `LAST`).
- Ez kiszűri a véletlen fake / elgépeléses neveket, amelyeket admin felhasználó vihetne fel.

Futtatás:

```powershell
cd backend
python manage.py check_fighter_registry
```

Várt eredmény:
- **OK**, ha minden név illeszkedik
- **FAIL**, ha van eltérés, és kilistázza a hibás rekordokat (id + név)

Példa FAIL:

```
FAIL: 1 fighter(s) not found in UFCStats CSV reference:
- id=15 name=Teszt Elek
```
