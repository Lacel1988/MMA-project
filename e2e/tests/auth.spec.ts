import { test, expect, E2E_USER } from "../fixtures/test";

test.describe("authentication", () => {
  test("shows the login screen to an unauthenticated visitor", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Auth" })).toBeVisible();
    await expect(page.getByRole("button", { name: "LOGIN", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Fighters", exact: true })).toHaveCount(0);
  });

  test("reports invalid credentials", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Username").fill(E2E_USER.username);
    await page.getByLabel("Password").fill("incorrect-password");
    await page.getByRole("button", { name: "LOGIN", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("No active account found");
  });

  test("logs in and logs out", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Username").fill(E2E_USER.username);
    await page.getByLabel("Password").fill(E2E_USER.password);
    await page.getByRole("button", { name: "LOGIN", exact: true }).click();
    await expect(page.getByText(`Hi, ${E2E_USER.username}`)).toBeVisible();
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page.getByRole("heading", { name: "Auth" })).toBeVisible();
  });

  test("validates registration input", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "REGISTER" }).click();
    await page.getByRole("button", { name: "REGISTER", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("Username is required");
  });
});
