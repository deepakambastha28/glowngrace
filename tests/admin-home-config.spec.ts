import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@glowngrace.in");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
}

test.describe("Admin home page configuration", () => {
  test("edits hero text and section visibility, reflected on the storefront", async ({ page }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/home-config");
    const originalConfig = (await originalRes.json()).config;

    const marker = `E2E Home ${Date.now()}`;

    try {
      await login(page);

      await page.goto("/admin/pages/home");
      await expect(page.getByTestId("home-config-form")).toBeVisible({ timeout: 30_000 });

      await page.getByTestId("home-hero-eyebrow").fill(marker);
      await page.getByTestId("home-section-toggle-testimonials").click();

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/home-config") && r.request().method() === "PUT"
        ),
        page.getByTestId("home-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/");
      await expect(page.getByText(marker)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("testimonials-section")).toHaveCount(0);
    } finally {
      const restore = await page.request.put("/api/admin/home-config", {
        data: originalConfig,
      });
      expect(restore.ok()).toBeTruthy();
    }
  });

  test("deletes and restores a section, reflected on the admin page and storefront", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/home-config");
    const originalConfig = (await originalRes.json()).config;

    try {
      await login(page);

      await page.goto("/admin/pages/home");
      await expect(page.getByTestId("home-config-form")).toBeVisible({ timeout: 30_000 });

      await expect(page.getByTestId("home-section-delete-cta")).toBeVisible();
      await page.getByTestId("home-section-delete-cta").click();
      await expect(page.getByTestId("home-section-restore-cta")).toBeVisible();

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/home-config") && r.request().method() === "PUT"
        ),
        page.getByTestId("home-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/");
      await expect(page.getByTestId("cta-banner")).toHaveCount(0);

      await page.goto("/admin/pages/home");
      await expect(page.getByTestId("home-config-form")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("home-section-restore-cta")).toBeVisible();
      await page.getByTestId("home-section-restore-cta").click();
      await expect(page.getByTestId("home-section-restore-cta")).toHaveCount(0);

      const [restoreRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/home-config") && r.request().method() === "PUT"
        ),
        page.getByTestId("home-config-save").click(),
      ]);
      expect(restoreRes.ok()).toBeTruthy();

      await page.goto("/");
      await expect(page.getByTestId("cta-banner")).toBeVisible({ timeout: 30_000 });
    } finally {
      const restore = await page.request.put("/api/admin/home-config", {
        data: originalConfig,
      });
      expect(restore.ok()).toBeTruthy();
    }
  });
});
