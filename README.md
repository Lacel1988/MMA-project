README.txt

# MMA Project

## HU – Projekt leírás

Az MMA Project egy teljes stack webalkalmazás, amely MMA harcosok adatainak kezelésére és megjelenítésére készült.

A projekt célja egy modern webes felület létrehozása, ahol a felhasználók böngészhetik a harcosok adatait, összehasonlíthatják őket, valamint megtekinthetik a részletes statisztikákat.

A rendszer két fő részből áll:

- Backend: Django + Django REST Framework
- Frontend: React + TypeScript + MUI


## Projekt struktúra

MMA-project
├ backend
│  ├ manage.py
│  ├ requirements.txt
│  ├ config
│  │  └ secret.py (local file, not in repository)
│  └ ...
├ frontend
│  ├ package.json
│  ├ src
│  └ ...


## Backend telepítés

Lépj be a backend könyvtárba:

cd backend

Telepítsd a szükséges Python csomagokat:

pip install -r requirements.txt


### SECRET_KEY konfiguráció

A projekt egy lokális secret.py fájlt használ az érzékeny adatok tárolására.

Hozd létre a következő fájlt:

```cmd
echo SECRET_KEY="<IDE_ILLESZD_BE_A_KULCSOT>" > backend/config/secret.py
```

A fájl tartalma:
```python
SECRET_KEY = "your-django-secret-key"
```

Biztonságos Django SECRET_KEY generálható itt:
https://djecrety.ir/

Ez a fájl nem része a repository-nak és minden fejlesztőnek lokálisan kell létrehoznia.


### Adatbázis inicializálása

A projekt fejlesztés során SQLite adatbázist használ.

Az adatbázis lokálisan jön létre, ezért klónozás után futtasd:

```cmd
python manage.py migrate
```
Admin felhasználó létrehozása:

```cmd
python manage.py createsuperuser
```
Backend indítása:

```cmd
python manage.py runserver
```

## Frontend telepítés

Lépj be a frontend könyvtárba:

```cmd
cd frontend
```
Telepítsd a dependency-ket:

```cmd
npm install
```
Frontend indítása:

```cmd
npm run dev
```

## Tesztelés

A tesztelési útmutató a következő fájlban található:

TESTING.md


# EN – Project description

The MMA Project is a full-stack web application designed to manage and display MMA fighter data.

The goal of the project is to provide a modern interface where users can browse fighters, compare statistics and view detailed fighter information.

The system consists of two main components:

- Backend: Django + Django REST Framework
- Frontend: React + TypeScript + MUI


## Backend setup

Navigate to the backend directory:
```cmd
cd backend
```
Install Python dependencies:
```cmd
pip install -r requirements.txt
```

### SECRET_KEY configuration

The project uses a local secret.py file to store sensitive configuration values.

Create the following file:

```cmd
echo SECRET_KEY="<COPY_THE_SECRET_KEY_HERE>" > backend/config/secret.py
```

Content:
```python
SECRET_KEY = "your-django-secret-key"
```
You can generate a secure Django secret key here:
https://djecrety.ir/

This file is intentionally excluded from version control.


### Database initialization

The project uses a local SQLite database for development.

After cloning the repository run:
```cmd
python manage.py migrate
```
Create an admin user:
```cmd
python manage.py createsuperuser
```
Start the backend server:
```cmd
python manage.py runserver
```

## Frontend setup

Navigate to the frontend directory:
```cmd
cd frontend
```
Install dependencies:
```cmd
npm install
```
Start the development server:
```cmd
npm run dev
```

## Testing

Testing instructions can be found in:

TESTING.md