import { test, expect } from "@playwright/test";
import { seedProduct, deleteSeededProduct } from "./helpers";

test.describe("Shop (product listing)", () => {
  const seededSlugs: string[] = [];

  test.afterEach(async ({ request }) => {
    for (const slug of seededSlugs.splice(0)) {
      await deleteSeededProduct(request, slug);
    }
  });

  test("shows the product grid", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByTestId("product-card").first()).toBeVisible();
    const cards = await page.getByTestId("product-card").count();
    expect(cards).toBeGreaterThan(0);

    await expect(page).toHaveTitle(/Shop|Products|Beauty/i);
  });

  test("search filters the grid", async ({ page, request }) => {
    const slug = await seedProduct(request, `E2E Lush Lipstick ${Date.now()}`);
    seededSlugs.push(slug);

    await page.goto("/products");
    await expect(page.getByTestId("product-card").first()).toBeVisible();

    const before = await page.getByTestId("product-card").count();
    await page.getByTestId("product-search").fill("Lipstick");
    await expect
      .poll(async () => page.getByTestId("product-card").count())
      .toBeLessThan(before);
  });

  test("product tile image is strictly 266×200 with rounded corners", async ({
    page,
    request,
  }) => {
    const slug = await seedProduct(request, `E2E Size Test ${Date.now()}`);
    seededSlugs.push(slug);

    await page.goto("/products");
    const img = page.getByTestId("product-card-image").first();
    await expect(img).toBeVisible();

    const box = await img.boundingBox();
    expect(box!.width).toBe(266);
    expect(box!.height).toBe(200);

    const borderRadius = await img.evaluate(
      (el) => getComputedStyle(el).borderRadius
    );
    expect(borderRadius).not.toBe("0px");
  });

  test("clicking a product opens its detail page", async ({ page }) => {
    await page.goto("/products");

    const card = page.getByTestId("product-card").first();
    await card.getByTestId("product-card-image").click();

    await expect(page).toHaveURL(/\/products\/.+$/);
    await expect(page.getByRole("button", { name: "Add to Cart" })).toBeVisible();
  });
});