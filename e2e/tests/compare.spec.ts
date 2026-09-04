import { test, expect } from "../fixtures/test";

async function selectAutocomplete(page: import("@playwright/test").Page, label: string, option: string) {
  await page.getByLabel(label).fill(option);
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("compares two fighters and renders statistics", async ({ authenticatedPage: page }) => {
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await expect(page.getByLabel("Fighter A")).toBeVisible();
  await selectAutocomplete(page, "Fighter A", "Charles Oliveira");
  await selectAutocomplete(page, "Fighter B", "Islam Makhachev");

  await expect(page.getByTestId("tale-of-the-tape")).toContainText("Lightweight");
  await expect(page.getByTestId("fighter-radar-chart")).toHaveCount(2);
  await expect(page.getByText("Charles Oliveira | last 5 fights")).toBeVisible();
  await expect(page.getByText("Islam Makhachev | last 5 fights")).toBeVisible();
});
