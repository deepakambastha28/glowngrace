import { test, expect } from "@playwright/test";
import { seedProduct, deleteSeededProduct } from "./helpers";

test.describe("Home page", () => {
  const seededSlugs: string[] = [];

  test.beforeAll(async ({ request }) => {
    const stamp = Date.now();
    for (let i = 0; i < 4; i += 1) {
      const slug = await seedProduct(request, `E2E Home ${stamp} ${i}`);
      seededSlugs.push(slug);
    }
  });

  test.afterAll(async ({ request }) => {
    for (const slug of seededSlugs) {
      await deleteSeededProduct(request, slug);
    }
  });

  test("renders layout, hero, and key sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("topbar")).toBeVisible();
    await expect(page.getByTestId("navbar")).toBeVisible();
    await expect(page.getByTestId("logo")).toBeVisible();

    await expect(page.getByTestId("hero-shop")).toBeVisible();
    await expect(page.getByTestId("services-section")).toHaveCount(0);
    await expect(page.getByTestId("jobs-section")).toBeVisible();
    await expect(page.getByTestId("testimonials-section")).toBeVisible();
    await expect(page.getByTestId("cta-banner")).toBeVisible();

    await expect(page).toHaveTitle(/Glow & Grace/);
  });

  test("hero CTA navigates to the shop", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("hero-shop").click();
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByTestId("product-card").first()).toBeVisible();
  });

  test("career CTA navigates to the careers page", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("hero-career").click();
    await expect(page).toHaveURL(/\/careers/);
  });

  test("hero circle cycles through product slides", async ({ page }) => {
    await page.goto("/");

    const circle = page.getByTestId("hero-circle");
    await expect(circle).toBeVisible();

    const slides = circle.getByTestId("hero-circle-product");
    await expect(slides).toHaveCount(4);
    await expect(slides.first()).toHaveAttribute("data-active", "true");

    await expect(slides.nth(1)).toHaveAttribute("data-active", "true", {
      timeout: 7000,
    });

    await expect(circle.getByTestId("hero-circle-prev")).toHaveCount(0);
    await expect(circle.getByTestId("hero-circle-next")).toHaveCount(0);
    await expect(circle.locator("button")).toHaveCount(0);
  });

  test("hero circle product links to its product page", async ({ page }) => {
    await page.goto("/");

    const circle = page.getByTestId("hero-circle");
    await circle.hover();
    await expect(circle).toBeVisible();

    const slides = circle.getByTestId("hero-circle-product");
    await expect(slides).toHaveCount(4);

    await slides.first().click();

    await expect(page).toHaveURL(/\/products\/.+$/);
  });
});