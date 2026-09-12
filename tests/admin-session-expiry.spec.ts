import { test, expect } from "@playwright/test";

test.describe("Admin session expiry", () => {
  test("expired server session clears the stale profile name from the storefront chrome", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@glowngrace.in");
    await page.getByLabel("Password", { exact: true }).fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("admin-sidebar")).toBeVisible();

    await page.context().clearCookies();

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);

    const navbar = page.getByTestId("navbar");

    await expect(navbar.getByRole("button", { name: "Account menu" })).toHaveCount(0);
    await expect(page.getByText("Deepak (Admin)", { exact: true })).toHaveCount(0);
    await expect(
      navbar.getByRole("link", { name: "Account" }).first()
    ).toBeVisible();
  });
});