import { test, expect } from "../fixtures/test";

test("returns a clear 404 for a missing fighter resource", async ({ request }) => {
  const token = await request.post("http://127.0.0.1:8000/api/auth/token/", {
    data: { username: "playwright_user", password: "PlaywrightPass123!" },
  });
  const { access } = await token.json();
  const response = await request.get("http://127.0.0.1:8000/api/fighters/999999999/", {
    headers: { Authorization: `Bearer ${access}` },
  });
  expect(response.status()).toBe(404);
  await expect(response.json()).resolves.toMatchObject({ detail: "No Fighter matches the given query." });
});

test("returns a validation error when radar fighter is missing", async ({ request }) => {
  const token = await request.post("http://127.0.0.1:8000/api/auth/token/", {
    data: { username: "playwright_user", password: "PlaywrightPass123!" },
  });
  const { access } = await token.json();
  const response = await request.get("http://127.0.0.1:8000/api/ufc/radar/", {
    headers: { Authorization: `Bearer ${access}` },
  });
  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({ error: "Missing ?fighter=" });
});
