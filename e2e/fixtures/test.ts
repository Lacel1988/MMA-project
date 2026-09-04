import { test as base, expect, type Page } from "@playwright/test";

export const E2E_USER = {
  username: "playwright_user",
  password: "PlaywrightPass123!",
};

type Fixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page, request }, use) => {
    const tokenResponse = await request.post("http://127.0.0.1:8000/api/auth/token/", {
      data: E2E_USER,
    });
    expect(tokenResponse.ok()).toBeTruthy();
    const tokens = await tokenResponse.json();

    await page.addInitScript(
      ({ access, refresh }) => {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
      },
      tokens,
    );
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Fighters", exact: true })).toBeVisible();
    await use(page);
  },
});

export { expect };
