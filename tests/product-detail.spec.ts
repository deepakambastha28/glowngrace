import { test, expect } from "@playwright/test";

test.describe("Product detail", () => {
  test("adds to cart and updates the nav badge", async ({ page }) => {
    await page.goto("/products/luxe-liquid-lipstick");

    const addToCart = page.getByRole("button", { name: "Add to Cart" });
    await expect(addToCart).toBeVisible();

    await addToCart.click();

    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await page.getByTestId("cart-link").click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByTestId("cart-item")).toHaveCount(1);
  });

  test("quantity stepper increases the checked-out count", async ({ page }) => {
    await page.goto("/products/vitamin-c-face-serum");

    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.getByTestId("quantity-display")).toHaveText("2");
  });

  test("wishlist button toggles state", async ({ page }) => {
    await page.goto("/products");

    const wish = page.getByTestId("product-card").first().getByTestId("wishlist-button");
    await wish.click();
    await expect(wish).toHaveClass(/bg-rose/);
    await wish.click();
    await expect(wish).not.toHaveClass(/bg-rose/);
  });
});
