import { test, expect } from "@playwright/test";

test.describe("Admin Pages menu", () => {
  test("Pages menu lists blank page sections Home, Shop, Career, Partner, Event, Contact", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@glowngrace.in");
    await page.getByLabel("Password", { exact: true }).fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });

    const sidebar = page.getByTestId("admin-sidebar");
    await expect(sidebar.getByText("Pages")).toBeVisible();

    const pages = [
      { label: "Home", path: "/admin/pages/home" },
      { label: "Shop", path: "/admin/pages/shop" },
      { label: "Career", path: "/admin/pages/career" },
      { label: "Partner", path: "/admin/pages/partner" },
      { label: "Event", path: "/admin/pages/event" },
      { label: "Contact", path: "/admin/pages/contact" },
    ];

    for (const p of pages) {
      await sidebar.getByRole("link", { name: p.label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(p.path.replace("/", "\\/")));
      await expect(page.getByTestId("admin-sidebar")).toBeVisible();
    }
  });
});