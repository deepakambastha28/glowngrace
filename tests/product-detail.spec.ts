import { test, expect } from "@playwright/test";
import { seedProduct, deleteSeededProduct } from "./helpers";

test.describe("Product detail", () => {
  const seededSlugs: string[] = [];

  test.afterEach(async ({ request }) => {
    for (const slug of seededSlugs.splice(0)) {
      await deleteSeededProduct(request, slug);
    }
  });

  test("adds to cart and updates the nav badge", async ({ page, request }) => {
    const name = `E2E Detail Cart ${Date.now()}`;
    const slug = await seedProduct(request, name);
    seededSlugs.push(slug);

    await page.goto(`/products/${slug}`);

    const addToCart = page.getByRole("button", { name: "Add to Cart" });
    await expect(addToCart).toBeVisible();

    await addToCart.click();

    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await page.getByTestId("cart-link").click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByTestId("cart-item")).toHaveCount(1);
  });

  test("quantity stepper increases the checked-out count", async ({ page, request }) => {
    const name = `E2E Detail Qty ${Date.now()}`;
    const slug = await seedProduct(request, name);
    seededSlugs.push(slug);

    await page.goto(`/products/${slug}`);

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

  test("detail page gallery hero is strictly 440×460", async ({ page, request }) => {
    const name = `E2E Detail Hero ${Date.now()}`;
    const slug = await seedProduct(request, name);
    seededSlugs.push(slug);

    await page.goto(`/products/${slug}`);
    const hero = page.getByTestId("product-gallery");
    await expect(hero).toBeVisible();

    const box = await hero.boundingBox();
    expect(box!.width).toBe(440);
    expect(box!.height).toBe(460);
  });
});