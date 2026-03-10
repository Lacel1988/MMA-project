TESTING.txt

# Testing / Tesztelés

Testing in this project consists of two complementary layers:

1) Automated tests (unit/integration) run in an isolated test database created by Django.
2) Data integrity check verifies the current development database against the UFCStats CSV reference.

---

## Prerequisites / Előfeltételek

Before running tests make sure the backend environment is prepared.

English:

cd backend
pip install -r requirements.txt
python manage.py migrate

Magyar:

cd backend
pip install -r requirements.txt
python manage.py migrate

---

# ENGLISH

## 1) Automated tests (Django test runner)

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

## 2) Data integrity check (DB vs UFCStats CSV)

Purpose:

- Verify that every Fighter.name stored in the database exists in the UFCStats CSV fighter reference.
- The reference file is located at:

backend/ufcstats/data/ufc_fighter_details.csv

Columns used:

FIRST
LAST

This helps detect accidental fake fighters or misspelled names added by admins.

Run:

cd backend
python manage.py check_fighter_registry

Expected output:

OK when all fighter names match the CSV reference.

Example OK output:

OK: All fighters match the UFCStats CSV reference.

Example FAIL output:

FAIL: 1 fighter(s) not found in UFCStats CSV reference:
- id=15 name=Teszt Elek

---

# MAGYAR

## 1) Automatizált tesztek (Django tesztfuttató)

Minden backend teszt futtatása:

cd backend
python manage.py test

Egy adott app tesztjei:

python manage.py test fighters
python manage.py test ufcstats

Egy konkrét teszt modul futtatása:

python manage.py test ufcstats.tests.test_model

Megjegyzések:

- A tesztek a Django által létrehozott ideiglenes teszt adatbázisban futnak.
- Ezek nem ellenőrzik a fejlesztői adatbázis tartalmát.
- Az UFCStats radar tesztek determinisztikusak és kis ideiglenes CSV mintákat használnak.

---

## 2) Adatkonzisztencia ellenőrzés (DB vs UFCStats CSV)

Cél:

- Ellenőrizni, hogy a DB-ben tárolt összes Fighter.name szerepel-e az UFCStats fighter CSV referenciában.

Referencia fájl:

backend/ufcstats/data/ufc_fighter_details.csv

Használt oszlopok:

FIRST
LAST

Ez kiszűri a véletlen fake vagy elgépeléses neveket, amelyeket admin felhasználók vihetnek fel.

Futtatás:

cd backend
python manage.py check_fighter_registry

Várt eredmény:

OK ha minden név illeszkedik a CSV referenciához.

Példa OK:

OK: Minden fighter név szerepel az UFCStats CSV referenciában.

Példa FAIL:

FAIL: 1 fighter(s) not found in UFCStats CSV reference:
- id=15 name=Teszt Elek