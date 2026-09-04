import { test, expect } from "../fixtures/test";

test.describe("authenticated smoke navigation", () => {
  test("loads all critical application views", async ({ authenticatedPage: page }) => {
    await expect(page.getByTestId("fighter-grid")).toBeVisible();

    await page.getByRole("button", { name: "Details", exact: true }).click();
    await expect(page.getByTestId("fighter-details-full")).toBeVisible();

    await page.getByRole("button", { name: "Compare", exact: true }).click();
    await expect(page.getByLabel("Fighter A")).toBeVisible();
    await expect(page.getByTestId("tale-of-the-tape")).toBeVisible();

    await page.getByRole("button", { name: "Forum", exact: true }).click();
    await expect(page.getByRole("heading", { name: "MMA Forum" })).toBeVisible();
    await expect(page.getByTestId("forum-category").first()).toBeVisible();
  });
});
