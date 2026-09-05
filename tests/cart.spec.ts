import { test, expect } from "@playwright/test";

async function addToCart(page: import("@playwright/test").Page) {
  await page.goto("/products/luxe-liquid-lipstick");
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByTestId("cart-count")).toHaveText("1");
}

test.describe("Cart", () => {
  test("applies the GLOW10 promo and shows a discount row", async ({ page }) => {
    await addToCart(page);

    await page.goto("/cart");
    await expect(page.getByTestId("cart-item")).toHaveCount(1);

    await page.getByTestId("promo-input").fill("GLOW10");
    await page.getByTestId("promo-apply").click();

    await expect(page.getByText("Promo Discount (10%)")).toBeVisible();
    await expect(page.getByTestId("promo-apply")).toHaveText("Applied");
  });

  test("removes an item back to the empty state", async ({ page }) => {
    await addToCart(page);

    await page.goto("/cart");
    await page.getByTestId("cart-remove").click();

    await expect(page.getByTestId("empty-cart")).toBeVisible();
  });

  test("proceeds to checkout", async ({ page }) => {
    await addToCart(page);

    await page.goto("/cart");
    await page.getByTestId("cart-checkout").click();

    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByTestId("checkout-next")).toBeVisible();
  });
});
