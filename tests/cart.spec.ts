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

  test("shows a wishlisted product on the cart page even when the cart is empty", async ({ page }) => {
    await page.goto("/products");
    await page.getByTestId("product-card").first().getByTestId("wishlist-button").click();

    await page.goto("/cart");
    const wishlistItem = page.getByTestId("wishlist-item").first();
    await expect(wishlistItem).toBeVisible();
    await expect(page.getByTestId("empty-cart")).toBeVisible();
  });

  test("adds a wishlist item to the cart from the cart page", async ({ page }) => {
    await page.goto("/products");
    const card = page.getByTestId("product-card").first();
    await card.getByTestId("wishlist-button").click();
    const name = (await card.locator("h3").innerText()).trim();

    await page.goto("/cart");
    const wishlistItem = page.getByTestId("wishlist-item").first();
    await expect(wishlistItem).toBeVisible();
    await wishlistItem.getByTestId("wishlist-add-to-cart").click();

    await expect(page.getByTestId("cart-item")).toHaveCount(1);
    await expect(page.getByTestId("cart-item")).toContainText(name);
    await expect(wishlistItem.getByTestId("wishlist-add-to-cart")).toHaveText(/In Cart/);
  });

  test("removes a wishlist item from the cart page", async ({ page }) => {
    await page.goto("/products");
    await page.getByTestId("product-card").first().getByTestId("wishlist-button").click();

    await page.goto("/cart");
    const wishlistItem = page.getByTestId("wishlist-item").first();
    await expect(wishlistItem).toBeVisible();
    await wishlistItem.getByTestId("wishlist-remove").click();

    await expect(page.getByTestId("wishlist-item")).toHaveCount(0);
  });
});
