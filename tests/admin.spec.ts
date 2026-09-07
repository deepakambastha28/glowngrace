import { test, expect } from "@playwright/test";

test.describe("Admin", () => {
  test("login page renders without storefront chrome or the admin sidebar", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    await expect(page.getByTestId("topbar")).toHaveCount(0);
    await expect(page.getByTestId("navbar")).toHaveCount(0);
    await expect(page.getByTestId("admin-sidebar")).toHaveCount(0);
  });

  test("login page surfaces the demo credentials on the glowngrace.in domain", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.getByText("admin@glowngrace.in")).toBeVisible();
  });

  test("signs in with the demo admin credentials and shows the dashboard with sidebar", async ({ page }) => {
    await page.goto("/admin");

    await page.getByLabel("Email Address").fill("admin@glowngrace.in");
    await page.getByLabel("Password", { exact: true }).fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByTestId("admin-sidebar")).toBeVisible();
    await expect(page.getByTestId("topbar")).toHaveCount(0);
    await expect(page.getByTestId("navbar")).toHaveCount(0);
  });
});