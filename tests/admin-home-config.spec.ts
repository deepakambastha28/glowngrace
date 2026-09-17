import { test, expect } from "@playwright/test";
import { restoreAdminConfig } from "./helpers";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@glowngrace.in");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
}

const ONE_PX_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

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
          (r) => r.url().includes("/api/admin/home-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("home-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/");
      await expect(page.getByText(marker)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("testimonials-section")).toHaveCount(0);
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/home-config",
        "/api/home-config",
        originalConfig
      );
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
          (r) => r.url().includes("/api/admin/home-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
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
          (r) => r.url().includes("/api/admin/home-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("home-config-save").click(),
      ]);
      expect(restoreRes.ok()).toBeTruthy();

      await page.goto("/");
      await expect(page.getByTestId("cta-banner")).toBeVisible({ timeout: 30_000 });
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/home-config",
        "/api/home-config",
        originalConfig
      );
    }
  });

  test("uploads up to multiple hero circle images shown as slides, with dimension guide", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/home-config");
    const originalConfig = (await originalRes.json()).config;

    try {
      await login(page);

      await page.goto("/admin/pages/home");
      await expect(page.getByTestId("home-config-form")).toBeVisible({ timeout: 30_000 });

      await expect(page.getByText("380 × 380 px").first()).toBeVisible();

      const upload = page.getByTestId("home-hero-image-upload");
      if (await upload.count()) {
        await upload.setInputFiles([
          {
            name: "hero1-e2e.png",
            mimeType: "image/png",
            buffer: ONE_PX_PNG,
          },
          {
            name: "hero2-e2e.png",
            mimeType: "image/png",
            buffer: ONE_PX_PNG,
          },
        ]);
        await expect(page.getByTestId("home-hero-image-preview").first()).toBeVisible({ timeout: 30_000 });
        expect(
          await page.getByTestId("home-hero-image-preview").count()
        ).toBeGreaterThanOrEqual(2);
      }

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/home-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("home-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/");
      await expect(page.getByTestId("hero-circle")).toBeVisible({ timeout: 30_000 });
      const slides = page.getByTestId("hero-circle-image");
      await expect(slides.first()).toBeVisible();
      expect(await slides.count()).toBeGreaterThanOrEqual(2);
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/home-config",
        "/api/home-config",
        originalConfig
      );
    }
  });
});
