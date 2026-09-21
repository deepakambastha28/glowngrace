import { test, expect } from "@playwright/test";
import { restoreAdminConfig } from "./helpers";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("admin@glowngrace.in");
  await page.getByLabel("Password", { exact: true }).fill("admin123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
}

test.describe("Admin event page configuration", () => {
  test("edits the heading and hides the carousel, reflected on the storefront", async ({ page }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/event-config");
    const originalConfig = (await originalRes.json()).config;

    const marker = `E2E Events ${Date.now()}`;

    try {
      await login(page);

      await page.goto("/admin/pages/event");
      await expect(page.getByTestId("event-config-form")).toBeVisible({ timeout: 30_000 });

      await page.getByTestId("event-heading-title").fill(marker);
      await page.getByTestId("event-section-toggle-carousel").click();

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/event-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("event-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/events");
      await expect(page.getByText(marker)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("event-carousel")).toHaveCount(0);
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/event-config",
        "/api/event-config",
        originalConfig
      );
    }
  });

  test("edits the heading eyebrow and description, reflected on the storefront", async ({ page }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/event-config");
    const originalConfig = (await originalRes.json()).config;

    const eyebrow = `E2E Eyebrow ${Date.now()}`;
    const description = "An admin-managed events description for testing.";

    try {
      await login(page);

      await page.goto("/admin/pages/event");
      await expect(page.getByTestId("event-config-form")).toBeVisible({ timeout: 30_000 });

      await page.getByTestId("event-heading-eyebrow").fill(eyebrow);
      await page.getByTestId("event-heading-description").fill(description);

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/event-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("event-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/events");
      await expect(page.getByText(eyebrow, { exact: true })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(description, { exact: true })).toBeVisible();
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/event-config",
        "/api/event-config",
        originalConfig
      );
    }
  });

  test("deletes the events listing section and restores it, reflected on the storefront", async ({
    page,
  }) => {
    test.setTimeout(240_000);

    const originalRes = await page.request.get("/api/event-config");
    const originalConfig = (await originalRes.json()).config;

    try {
      await login(page);

      await page.goto("/admin/pages/event");
      await expect(page.getByTestId("event-config-form")).toBeVisible({ timeout: 30_000 });

      await page.getByTestId("event-section-delete-heading").click();

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/event-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("event-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/events");
      await expect(page.getByTestId("event-heading")).toHaveCount(0);
      await expect(page.getByTestId("event-grid")).toHaveCount(0);

      await page.goto("/admin/pages/event");
      await expect(page.getByTestId("event-config-form")).toBeVisible({ timeout: 30_000 });
      await page.getByTestId("event-section-restore-heading").click();

      const [restoreRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/event-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("event-config-save").click(),
      ]);
      expect(restoreRes.ok()).toBeTruthy();

      await page.goto("/events");
      await expect(page.getByTestId("event-heading")).toBeVisible({ timeout: 30_000 });
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/event-config",
        "/api/event-config",
        originalConfig
      );
    }
  });

  test("uploads a banner image and sets banner text, reflected on the storefront", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/event-config");
    const originalConfig = (await originalRes.json()).config;

    const title = `E2E Events Banner ${Date.now()}`;
    const subtitle = "Masterclasses and workshops every month.";

    const ONE_PX_PNG = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );

    try {
      await login(page);

      await page.goto("/admin/pages/event");
      await expect(page.getByTestId("event-config-form")).toBeVisible({ timeout: 30_000 });

      const bannerSaved = originalConfig.sections.find(
        (s: { key: string }) => s.key === "banner"
      );
      if (!bannerSaved?.visible) {
        const restore = page.getByTestId("event-section-restore-banner");
        if (await restore.count()) {
          await restore.click();
          await page.getByRole("button", { name: "Banner", expanded: false }).click();
        } else {
          await page.getByTestId("event-section-toggle-banner").click();
        }
      }

      const upload = page.getByTestId("event-banner-image-upload");
      if (await upload.count()) {
        await upload.setInputFiles({
          name: "event-banner-e2e.png",
          mimeType: "image/png",
          buffer: ONE_PX_PNG,
        });
        await expect(page.getByTestId("event-banner-image-preview").first()).toBeVisible({
          timeout: 30_000,
        });
      }

      await page.getByTestId("event-banner-title").fill(title);
      await page.getByTestId("event-banner-subtitle").fill(subtitle);

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/event-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("event-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/events");
      await expect(page.getByTestId("event-banner")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(title, { exact: true })).toBeVisible();
      await expect(page.getByText(subtitle, { exact: true })).toBeVisible();
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/event-config",
        "/api/event-config",
        originalConfig
      );
    }
  });
});