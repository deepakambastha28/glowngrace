import { test, expect } from "@playwright/test";

const DEMO_EMAIL = "admin@glowngrace.in";
const DEMO_PASS = "admin123";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/admin");
  await page.getByLabel("Email Address").fill(DEMO_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASS);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
}

test.describe("Admin Partner management", () => {
  test("add a partner from admin and see it on the storefront directory", async ({ page, request }) => {
    test.setTimeout(120_000);

    await signIn(page);
    await expect(page.getByTestId("admin-sidebar")).toBeVisible();

    await page.getByTestId("admin-sidebar").getByRole("link", { name: "Partners" }).click();
    await expect(page.getByRole("heading", { name: "Partners" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toHaveCount(0);
    await page.getByRole("link", { name: "Add Partner" }).click();
    await expect(page.getByRole("heading", { name: "Add New Partner" })).toBeVisible({ timeout: 30_000 });

    const partnerName = `Alpha Beauty Studio ${Date.now()}`;
    await page.getByLabel("Partner Name").fill(partnerName);
    await page.getByLabel("Locality / Area").fill("Hazratganj");
    await page.getByRole("button", { name: "Save Partner" }).click();

    await expect(page.getByRole("heading", { name: "Partners" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(partnerName, { exact: true })).toBeVisible();

    await page.goto("/partners");
    await expect(page.getByText(partnerName, { exact: true })).toBeVisible({ timeout: 30_000 });

    const list = await request.get("/api/admin/partners");
    const rows = ((await list.json()).items ?? []) as Array<{ id: number; name: string }>;
    const row = rows.find((p) => p.name === partnerName);
    if (row) {
      await request.delete(`/api/admin/partners?id=${row.id}`);
    }
  });
});