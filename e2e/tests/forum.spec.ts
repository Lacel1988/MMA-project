import { test, expect } from "../fixtures/test";

test("creates a forum comment and displays it", async ({ authenticatedPage: page }) => {
  const comment = `Playwright comment ${Date.now()}`;
  await page.getByRole("button", { name: "Forum", exact: true }).click();
  const topic = page.getByTestId("forum-topic").filter({ hasText: "E2E Fight Night" });
  await expect(topic).toBeVisible();
  await topic.getByPlaceholder("Write down your opinion…").fill(comment);
  await topic.getByRole("button", { name: "Send comment" }).click();
  await expect(topic.getByText(comment, { exact: true })).toBeVisible();
});

test("prevents a guest from opening the forum UI", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Auth" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "MMA Forum" })).toHaveCount(0);
});
