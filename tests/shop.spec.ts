import { test, expect } from "@playwright/test";

test.describe("Shop (product listing)", () => {
  test("shows the full curated product grid", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByTestId("product-card").first()).toBeVisible();
    const cards = await page.getByTestId("product-card").count();
    expect(cards).toBeGreaterThan(0);

    await expect(page).toHaveTitle(/Shop|Products|Beauty/i);
  });

  test("search filters the grid", async ({ page }) => {
    await page.goto("/products");

    const before = await page.getByTestId("product-card").count();
    await page.getByTestId("product-search").fill("Lipstick");
    await expect
      .poll(async () => page.getByTestId("product-card").count())
      .toBeLessThan(before);
  });

  test("clicking a product opens its detail page", async ({ page }) => {
    await page.goto("/products");

    const card = page.getByTestId("product-card").first();
    await card.getByTestId("product-card-image").click();

    await expect(page).toHaveURL(/\/products\/.+$/);
    await expect(page.getByRole("button", { name: "Add to Cart" })).toBeVisible();
  });
});
