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

test.describe("Admin shop page configuration", () => {
  test("edits heading text and hides the category chips, reflected on the storefront", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/shop-config");
    const originalConfig = (await originalRes.json()).config;

    const marker = `E2E Shop ${Date.now()}`;

    try {
      await login(page);

      await page.goto("/admin/pages/shop");
      await expect(page.getByTestId("shop-config-form")).toBeVisible({ timeout: 30_000 });

      await page.getByTestId("shop-heading-eyebrow").fill(marker);
      await page.getByTestId("shop-section-toggle-categories").click();

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/shop-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("shop-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/products");
      await expect(page.getByTestId("shop-heading")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(marker)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("shop-categories")).toHaveCount(0);
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/shop-config",
        "/api/shop-config",
        originalConfig
      );
    }
  });

  test("uploads a banner image and sets banner text, reflected on the storefront", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/shop-config");
    const originalConfig = (await originalRes.json()).config;

    const title = `E2E Banner ${Date.now()}`;
    const subtitle = "Handpicked beauty essentials for every occasion.";

    try {
      await login(page);

      await page.goto("/admin/pages/shop");
      await expect(page.getByTestId("shop-config-form")).toBeVisible({ timeout: 30_000 });

      const upload = page.getByTestId("shop-banner-image-upload");
      if (await upload.count()) {
        await upload.setInputFiles({
          name: "banner-e2e.png",
          mimeType: "image/png",
          buffer: ONE_PX_PNG,
        });
        await expect(page.getByTestId("shop-banner-image-preview").first()).toBeVisible({ timeout: 30_000 });
      }

      await page.getByTestId("shop-banner-title").fill(title);
      await page.getByTestId("shop-banner-subtitle").fill(subtitle);

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/shop-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("shop-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/products");
      await expect(page.getByTestId("shop-banner")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(title, { exact: true })).toBeVisible();
      await expect(page.getByText(subtitle, { exact: true })).toBeVisible();
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/shop-config",
        "/api/shop-config",
        originalConfig
      );
    }
  });

  test("uploads up to multiple banner images shown as slides on the storefront", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/shop-config");
    const originalConfig = (await originalRes.json()).config;

    try {
      await login(page);

      await page.goto("/admin/pages/shop");
      await expect(page.getByTestId("shop-config-form")).toBeVisible({ timeout: 30_000 });

      const upload = page.getByTestId("shop-banner-image-upload");
      if (await upload.count()) {
        await upload.setInputFiles([
          {
            name: "banner1-e2e.png",
            mimeType: "image/png",
            buffer: ONE_PX_PNG,
          },
          {
            name: "banner2-e2e.png",
            mimeType: "image/png",
            buffer: ONE_PX_PNG,
          },
        ]);
        await expect(page.getByTestId("shop-banner-image-preview").first()).toBeVisible({ timeout: 30_000 });
        expect(await page.getByTestId("shop-banner-image-preview").count()).toBeGreaterThanOrEqual(2);
      }

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/shop-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("shop-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/products");
      await expect(page.getByTestId("shop-banner")).toBeVisible({ timeout: 30_000 });
      const slides = page.getByRole("button", { name: /Go to banner slide/ });
      await expect(slides.first()).toBeVisible();
      expect(await slides.count()).toBeGreaterThanOrEqual(2);
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/shop-config",
        "/api/shop-config",
        originalConfig
      );
    }
  });

  test("adds a custom category chip, reflected on the storefront", async ({ page }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/shop-config");
    const originalConfig = (await originalRes.json()).config;

    const categoryName = `E2E Category ${Date.now()}`;

    try {
      await login(page);

      await page.goto("/admin/pages/shop");
      await expect(page.getByTestId("shop-config-form")).toBeVisible({ timeout: 30_000 });

      await page.getByTestId("shop-category-add").click();
      await page.getByTestId("shop-category-input-0").fill(categoryName);

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/shop-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("shop-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/products");
      await expect(page.getByTestId("shop-categories")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("shop-categories").locator("button")).toHaveText([
        "All",
        categoryName,
      ]);
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/shop-config",
        "/api/shop-config",
        originalConfig
      );
    }
  });
});