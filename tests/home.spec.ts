import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("renders layout, hero, and key sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("topbar")).toBeVisible();
    await expect(page.getByTestId("navbar")).toBeVisible();
    await expect(page.getByTestId("logo")).toBeVisible();

    await expect(page.getByTestId("hero-shop")).toBeVisible();
    await expect(page.getByTestId("services-section")).toBeVisible();
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

  test("career CTA jumps to the vacancies section", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("hero-career").click();
    await expect(page.getByTestId("jobs-section")).toBeVisible();
  });
});
