import { test, expect } from "@playwright/test";

test.describe("Role menus in the top nav", () => {
  test("admin login shows an Admin menu linked to the admin portal sections", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@glowngrace.in");
    await page.getByLabel("Password", { exact: true }).fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await page.waitForURL("**/admin");

    await page.goto("/");
    const navbar = page.getByTestId("navbar");
    const adminTrigger = navbar.getByRole("button", { name: "Admin", exact: true });
    await expect(adminTrigger).toBeVisible();

    await adminTrigger.click();
    await expect(navbar.getByRole("link", { name: "Products", exact: true })).toBeVisible();
    await expect(navbar.getByRole("link", { name: "Reviews", exact: true })).toBeVisible();

    await navbar.getByRole("link", { name: "Products", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/products/);
  });

  test("recruiter login shows a Recruiter menu linked to the recruiter portal sections", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("recruiter@glowngrace.in");
    await page.getByLabel("Password", { exact: true }).fill("recruiter123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("**/recruiter");

    await page.goto("/");
    const navbar = page.getByTestId("navbar");
    const recruiterTrigger = navbar.getByRole("button", { name: "Recruiter", exact: true });
    await expect(recruiterTrigger).toBeVisible();

    await recruiterTrigger.click();
    await expect(navbar.getByRole("link", { name: "Candidates", exact: true })).toBeVisible();

    await navbar.getByRole("link", { name: "Candidates", exact: true }).click();
    await expect(page).toHaveURL(/\/recruiter\/candidates/);
  });

  test("shopper login shows no Admin or Recruiter menu", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("shopper@glowngrace.in");
    await page.getByLabel("Password", { exact: true }).fill("shopper123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.goto("/");
    const navbar = page.getByTestId("navbar");
    await expect(navbar.getByRole("button", { name: "Admin", exact: true })).toHaveCount(0);
    await expect(navbar.getByRole("button", { name: "Recruiter", exact: true })).toHaveCount(0);
  });
});