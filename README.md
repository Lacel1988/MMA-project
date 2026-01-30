## Environment configuration

This project uses a local `secret.py` file to store sensitive configuration values.
Sensitive files are intentionally excluded from version control.

### SECRET_KEY

To run the project, you must create a file named `secret.py` in the following directory:

`backend/config/secret.py`

The file must contain the following variable:

```python
SECRET_KEY = "your-django-secret-key"
```

The `secret.py` file is intentionally excluded from version control and must be created locally by each developer.

You can generate a secure Django secret key here:
https://djecrety.ir/

---

### Database

The project uses a local SQLite database (`db.sqlite3`) for development purposes.

The database file is created locally on each developer’s machine and is not included in version control,
as it may contain local data such as users, permissions and test records.

After cloning the repository, initialize the database by running the following commands:

```bash
python manage.py migrate
python manage.py createsuperuser
```

These commands will create the database structure and allow you to create an admin user.
