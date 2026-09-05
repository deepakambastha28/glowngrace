import { test, expect } from "@playwright/test";

test.describe("Newsletter", () => {
  test("subscribes with a valid email", async ({ page }) => {
    await page.goto("/");

    const block = page.getByTestId("newsletter");
    await expect(block).toBeVisible();

    await block.getByTestId("newsletter-email").fill(`glow+${Date.now()}@example.com`);
    await block.getByTestId("newsletter-submit").click();

    await expect(block.getByText(/Subscribed successfully/i)).toBeVisible();
  });

  test("rejects an invalid email gracefully", async ({ page }) => {
    await page.goto("/");

    const block = page.getByTestId("newsletter");
    await block.getByTestId("newsletter-email").fill("not-an-email");
    await block.getByTestId("newsletter-submit").click();

    // form-level guard shows a toast; no crash — the input must stay editable
    await expect(block.getByTestId("newsletter-email")).toBeEditable();
  });
});