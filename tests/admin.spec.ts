import { test, expect } from "@playwright/test";

test.describe("Admin", () => {
  test("unauthenticated visits to /admin redirect to the single login page", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    await expect(page.getByTestId("admin-sidebar")).toHaveCount(0);
  });

  test("login page surfaces the admin demo credentials on the glowngrace.in domain", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("admin@glowngrace.in")).toBeVisible();
  });

  test("signs in with the demo admin credentials and shows the dashboard with sidebar", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("admin@glowngrace.in");
    await page.getByLabel("Password").fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByTestId("admin-sidebar")).toBeVisible();
  });
});