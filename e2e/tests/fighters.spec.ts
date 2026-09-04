import { test, expect } from "../fixtures/test";
import { FightersPage } from "../pages/fighters.page";

test.describe("fighter database", () => {
  test("loads fighters and opens a fighter detail", async ({ authenticatedPage: page }) => {
    const fighters = new FightersPage(page);
    await expect(page.getByTestId("fighter-card").first()).toBeVisible();
    await fighters.fighterCard("Charles Oliveira").click();
    await expect(page.getByTestId("fighter-details")).toContainText("Charles Oliveira");
    await expect(page.getByTestId("fighter-details")).toContainText("Record: 35-11-1");
  });

  test("searches and filters fighters", async ({ authenticatedPage: page }) => {
    const fighters = new FightersPage(page);
    await fighters.openFilters();
    await fighters.searchFor("Charles Oliveira");
    await expect(fighters.fighterCard("Charles Oliveira")).toBeVisible();
    await expect(page.getByTestId("fighter-grid")).toHaveAttribute("aria-label", "1 fighters found");

    await page.getByRole("button", { name: "Reset" }).click();
    await page.getByRole("button", { name: "Lightweight", exact: true }).click();
    await expect(page.getByTestId("fighter-grid")).toHaveAttribute("aria-label", /[1-9]\d* fighters found/);
  });

  test("shows an empty result for an unknown fighter", async ({ authenticatedPage: page }) => {
    const fighters = new FightersPage(page);
    await fighters.openFilters();
    await fighters.searchFor("No Such Fighter 9f0c3d");
    await expect(page.getByTestId("fighter-grid")).toHaveAttribute("aria-label", "0 fighters found");
    await expect(page.getByText("Select a fighter on the left to view details.")).toBeVisible();
  });
});
