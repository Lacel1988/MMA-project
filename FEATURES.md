FEATURES.txt

# FEATURES

---

# HU – Főbb funkciók

## Fighter adatbázis

Az alkalmazás egy MMA harcos adatbázist biztosít, ahol a felhasználók böngészhetik a fighter adatokat.

Főbb adatok:

- név
- súlycsoport
- magasság
- reach
- győzelem / vereség / döntetlen statisztika


## Fighter grid virtualizáció

A fighter lista megjelenítése virtualizált grid segítségével történik.

Technológia:

react-window

Előnyök:

- több száz fighter megjelenítése teljesítményvesztés nélkül
- csak a látható elemek renderelődnek
- gyors görgetés nagy adatmennyiség esetén


## Fighter részletek és timeline

A fighter részletes oldala vizuális timeline rendszert használ.

Funkciók:

- esemény pontok (event points)
- vizuális timeline
- dinamikus háttérképek
- reszponzív megjelenítés


## Fighter összehasonlítás

A rendszer lehetővé teszi két fighter statisztikájának összehasonlítását.

Megjelenített adatok például:

- magasság
- reach
- súly
- mérleg (wins / losses)


## UFCStats CSV adatforrás

A fighter adatok egy része UFCStats CSV fájlokból származik.

A projekt tartalmaz:

- CSV adatfeldolgozást
- adatimportot
- fighter referencia adatbázist


## Adatkonzisztencia ellenőrzés

A projekt tartalmaz egy egyedi Django management commandot:

check_fighter_registry

Funkció:

- ellenőrzi, hogy a database-ben szereplő fighter nevek léteznek-e az UFCStats CSV referenciában
- kiszűri a hibás vagy véletlenül létrehozott rekordokat


## Forum rendszer

A projekt egy egyszerű fórum modult is tartalmaz.

Funkciók:

- kategóriák
- témák
- hozzászólások
- válaszok


## Autentikáció

A backend JWT alapú autentikációt használ.

Technológia:

djangorestframework_simplejwt

Ez lehetővé teszi:

- felhasználói bejelentkezést
- védett API végpontokat


---

# EN – Main features

## Fighter database

The application provides an MMA fighter database where users can browse fighter information.

Main data fields include:

- name
- weight class
- height
- reach
- win / loss / draw statistics


## Fighter grid virtualization

The fighter list uses a virtualized grid.

Technology used:

react-window

Advantages:

- supports hundreds of fighters efficiently
- only visible elements are rendered
- smooth scrolling even with large datasets


## Fighter details and timeline

The fighter details page includes a visual timeline system.

Features:

- event points
- timeline visualization
- dynamic background images
- responsive layout


## Fighter comparison

The system allows comparison of two fighters.

Displayed statistics include:

- height
- reach
- weight
- fight record (wins / losses)


## UFCStats CSV data source

Part of the fighter data originates from UFCStats CSV datasets.

The project includes:

- CSV data parsing
- data import pipeline
- fighter reference dataset


## Data integrity validation

The project includes a custom Django management command:

check_fighter_registry

Purpose:

- verify that fighter names stored in the database exist in the UFCStats CSV reference
- detect invalid or accidentally created records


## Forum system

The project includes a simple forum module.

Features:

- categories
- topics
- posts
- replies


## Authentication

The backend uses JWT based authentication.

Technology:

djangorestframework_simplejwt

This enables:

- user login
- protected API endpoints