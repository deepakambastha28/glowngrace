import { test, expect } from "@playwright/test";

test.describe("Auth pages", () => {
  test("login validates fields and shows a demo success toast", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("priya@example.com");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText(/Welcome back/)).toBeVisible();
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
});