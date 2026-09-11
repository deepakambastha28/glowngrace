import { test, expect } from "@playwright/test";

test.describe("Auth pages", () => {
  test("shopper login validates fields and shows a success toast", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("shopper@glowngrace.in");
    await page.getByLabel("Password").fill("shopper123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.waitForURL(/\/shopper/);
    await expect(page).toHaveURL(/\/shopper/);
  });

  test("candidate login works and redirects", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("candidate@glowngrace.in");
    await page.getByLabel("Password").fill("candidate123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.waitForURL(/\/candidate/);
    await expect(page).toHaveURL(/\/candidate/);
  });

  test("admin login works and redirects", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("admin@glowngrace.in");
    await page.getByLabel("Password").fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.waitForURL(/\/admin/);
    await expect(page).toHaveURL(/\/admin/);
  });

  test("login shows validation errors for a short password", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("priya@example.com");
    await page.getByLabel("Password").fill("123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Password must be at least 6 characters")).toBeVisible();
  });

  test("signup links through to login", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("login page renders a two-column split with a brand panel left of the form", async ({ page }) => {
    await page.goto("/login");

    const brand = page.getByTestId("login-brand-panel");
    const form = page.getByTestId("login-form-panel");

    await expect(brand).toBeVisible();
    await expect(form).toBeVisible();

    const brandBox = await brand.boundingBox();
    const formBox = await form.boundingBox();
    expect(brandBox!.x).toBeLessThan(formBox!.x);
  });
});
