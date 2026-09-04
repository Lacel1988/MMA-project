import { expect, type Page } from "@playwright/test";

export class FightersPage {
  constructor(private readonly page: Page) {}

  async openFilters() {
    await this.page.getByRole("button", { name: "Filters" }).click();
    await expect(this.page.getByPlaceholder("Type fighter name...")).toBeVisible();
  }

  async searchFor(name: string) {
    await this.page.getByPlaceholder("Type fighter name...").fill(name);
  }

  fighterCard(name: string) {
    return this.page.getByTestId("fighter-card").filter({ hasText: name });
  }
}
