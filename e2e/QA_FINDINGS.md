# QA Findings

## Repository observations

- The frontend is a React 19, TypeScript, Vite, MUI single-page application. Views are selected by React state rather than URL routes.
- The backend is Django 5 with Django REST Framework and SimpleJWT. Fighter reads require authentication; fighter writes require staff permissions.
- The forum API permits anonymous reads, authenticated topic/post/reply creation, owner-or-staff mutation, and staff-only category mutation.
- The UI protects Fighters, Details, Compare, and Forum behind authentication.
- Existing automated coverage is backend-focused and uses Django's test runner.

## Product issues and gaps

### Non-admin users see category administration controls

**Steps:** Sign in with a regular user, open Forum, then select a category edit or delete icon.

**Actual:** Edit and delete controls are rendered for every authenticated user. The backend correctly rejects the operation with HTTP 403, and the UI surfaces a generic error.

**Expected:** Category edit and delete controls should only be rendered for staff/superusers, matching the backend permission model.

### Forum ownership controls are not hidden

**Steps:** Sign in as a regular user and open a topic or post created by another user.

**Actual:** Edit/delete controls are visible even when the current user is neither the owner nor staff. The backend denies the operation.

**Expected:** The UI should hide or disable unauthorized controls while keeping the backend authorization checks.

### No URL-level application routing or not-found page

**Steps:** Navigate directly to an arbitrary frontend path such as `/fighters/does-not-exist`.

**Actual:** Vite serves the SPA shell; the application has no route-aware not-found experience.

**Expected:** If shareable/deep-linked routes are a product goal, introduce explicit React routes and a user-facing 404 page.

These findings are documented rather than hidden by permissive assertions in the E2E suite.
