import { test, expect } from "@playwright/test";

test.describe("Admin sidebar navigation stays authenticated", () => {
  test("sidebar offers one combined menu per section (no separate Add* links), incl. Partners", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@glowngrace.in");
    await page.getByLabel("Password", { exact: true }).fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("admin-sidebar")).toBeVisible();

    const sidebar = page.getByTestId("admin-sidebar");

    for (const gone of ["Add Product", "Add Job", "Add Review"]) {
      await expect(sidebar.getByRole("link", { name: gone })).toHaveCount(0);
    }

    const menus = [
      { label: "Products", heading: "Products" },
      { label: "Jobs", heading: "Jobs" },
      { label: "Reviews", heading: "Reviews" },
      { label: "Partners", heading: "Partners" },
      { label: "Candidates", heading: "Candidates" },
    ];

    for (const menu of menus) {
      await sidebar.getByRole("link", { name: menu.label }).click();
      await expect(page.getByRole("heading", { name: "Welcome Back" })).toHaveCount(0, {
        timeout: 5_000,
      });
      await expect(page.getByRole("heading", { name: menu.heading })).toBeVisible({ timeout: 30_000 });
      await expect(sidebar).toBeVisible();
    }
  });

  test("add flows stay reachable from each combined list page", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@glowngrace.in");
    await page.getByLabel("Password", { exact: true }).fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });

    const targets = [
      { listHeading: "Products", addButton: "Add Product", addHeading: "Add New Product" },
      { listHeading: "Jobs", addButton: "Add Job", addHeading: "Post a New Job" },
      { listHeading: "Reviews", addButton: "Add Review", addHeading: "Add a Review" },
    ];

    for (const t of targets) {
      await page.getByTestId("admin-sidebar").getByRole("link", { name: t.listHeading }).click();
      await expect(page.getByRole("heading", { name: t.listHeading })).toBeVisible({ timeout: 30_000 });
      await page.getByRole("link", { name: t.addButton }).click();
      await expect(page.getByRole("heading", { name: t.addHeading })).toBeVisible({ timeout: 30_000 });
    }
  });
});