# Playwright E2E Testing

This suite exercises the MMA Project through its React UI and Django REST API. It uses an isolated SQLite database copied from the local development database and enriched with deterministic fixtures. The development database is never modified by the tests.

## Prerequisites

- Node.js 20 or newer
- Python 3.11 or newer available as `python`
- Backend packages from `backend/requirements.txt`
- Frontend packages from `frontend/package.json`

Install dependencies from the repository root:

```bash
npm install
npm --prefix frontend install
python -m pip install -r backend/requirements.txt
npx playwright install chromium
```

The backend can read `backend/config/secret.py` as before. For automation, the Playwright configuration supplies a test-only `DJANGO_SECRET_KEY` environment variable.

## Running the suite

From the repository root:

```bash
npx playwright test
npx playwright test --ui
npx playwright test --headed
npx playwright show-report
```

Equivalent npm scripts are available:

```bash
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed
npm run test:e2e:report
```

Playwright automatically prepares `backend/db.e2e.sqlite3`, starts Django on port 8000, and starts Vite on port 5173. Existing local servers are reused outside CI.

If Python is not on `PATH`, set `PLAYWRIGHT_PYTHON` to the absolute Python executable path before running Playwright.

## Structure

```text
e2e/
  fixtures/       Authentication and shared test fixtures
  pages/          Focused page objects for repeated interactions
  tests/          Independent user-flow specifications
```

The suite covers authentication, protected navigation, fighter browsing, search and division filtering, fighter details, comparison statistics and radar charts, forum comments, and negative API/search cases.

## Test artifacts

On failure, Playwright retains a screenshot, video, and trace in `test-results/`. The HTML report is written to `playwright-report/` and can be opened with `npx playwright show-report`.

## Test data and isolation

`backend/e2e_prepare.py` recreates the E2E database before a run. It copies `backend/db.sqlite3` when available, applies migrations, and creates a regular test user plus deterministic fighter and forum records. Tests may create comments or users only in this isolated database.

The deterministic account is intended for local E2E use only:

- Username: `playwright_user`
- Password: `PlaywrightPass123!`

Never reuse these credentials outside the local test environment.
