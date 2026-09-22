import { test, expect } from "@playwright/test";
import { restoreAdminConfig } from "./helpers";
import { normalizePartnerConfig } from "../src/lib/partner-config";

test("a stored config without the banner section shows the banner by default", () => {
  const config = normalizePartnerConfig({
    sections: [
      { key: "directory", visible: true, deleted: false },
      { key: "benefits", visible: true, deleted: false },
      { key: "steps", visible: true, deleted: false },
      { key: "cta", visible: true, deleted: false },
    ],
  });
  const banner = config.sections.find((s) => s.key === "banner");
  expect(banner?.visible).toBe(true);
  expect(banner?.deleted).toBe(false);
});

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("admin@glowngrace.in");
  await page.getByLabel("Password", { exact: true }).fill("admin123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
}

test.describe("Admin partner page configuration", () => {
  test("edits the directory heading and hides the benefits section, reflected on the storefront", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/partner-config");
    const originalConfig = (await originalRes.json()).config;

    const marker = `E2E Directory ${Date.now()}`;

    try {
      await login(page);

      await page.goto("/admin/pages/partner");
      await expect(page.getByTestId("partner-config-form")).toBeVisible({ timeout: 30_000 });

      await page.getByTestId("partner-directory-title").fill(marker);
      await page.getByTestId("partner-section-toggle-benefits").click();

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/partner-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("partner-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/partners");
      await expect(page.getByTestId("partner-directory")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(marker)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("partner-benefits")).toHaveCount(0);
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/partner-config",
        "/api/partner-config",
        originalConfig
      );
    }
  });

  test("adds a benefit card and edits a step, reflected on the storefront", async ({ page }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/partner-config");
    const originalConfig = (await originalRes.json()).config;

    const benefitTitle = `E2E Benefit ${Date.now()}`;
    const benefitDesc = "An admin-managed partner benefit for testing.";
    const stepTitle = `E2E Step ${Date.now()}`;

    try {
      await login(page);

      await page.goto("/admin/pages/partner");
      await expect(page.getByTestId("partner-config-form")).toBeVisible({ timeout: 30_000 });

      await page.getByTestId("partner-benefits-add").click();
      await page.getByTestId("partner-benefits-title-0").fill(benefitTitle);
      await page.getByTestId("partner-benefits-description-0").fill(benefitDesc);
      await page.getByTestId("partner-steps-title-0").fill(stepTitle);

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/partner-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("partner-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/partners");
      await expect(page.getByTestId("partner-benefits")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(benefitTitle, { exact: true })).toBeVisible();
      await expect(page.getByText(benefitDesc, { exact: true })).toBeVisible();
      await expect(page.getByText(stepTitle, { exact: true })).toBeVisible();
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/partner-config",
        "/api/partner-config",
        originalConfig
      );
    }
  });

  test("edits the CTA copy and shows it on the storefront", async ({ page }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/partner-config");
    const originalConfig = (await originalRes.json()).config;

    const ctaTitle = `E2E CTA ${Date.now()}`;

    try {
      await login(page);

      await page.goto("/admin/pages/partner");
      await expect(page.getByTestId("partner-config-form")).toBeVisible({ timeout: 30_000 });

      await page.getByTestId("partner-cta-title").fill(ctaTitle);

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/partner-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("partner-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/partners");
      await expect(page.getByTestId("partner-cta")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(ctaTitle, { exact: true })).toBeVisible();
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/partner-config",
        "/api/partner-config",
        originalConfig
      );
    }
  });

  test("uploads a banner image and sets banner text, reflected on the storefront", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/partner-config");
    const originalConfig = (await originalRes.json()).config;

    const title = `E2E Partners Banner ${Date.now()}`;
    const subtitle = "Partner with verified salons across Lucknow.";

    const ONE_PX_PNG = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );

    try {
      await login(page);

      await page.goto("/admin/pages/partner");
      await expect(page.getByTestId("partner-config-form")).toBeVisible({ timeout: 30_000 });

      const bannerSaved = originalConfig.sections.find(
        (s: { key: string }) => s.key === "banner"
      );
      if (!bannerSaved?.visible) {
        const restore = page.getByTestId("partner-section-restore-banner");
        if (await restore.count()) {
          await restore.click();
          await page.getByRole("button", { name: "Banner", expanded: false }).click();
        } else {
          await page.getByTestId("partner-section-toggle-banner").click();
        }
      }

      const upload = page.getByTestId("partner-banner-image-upload");
      if (await upload.count()) {
        await upload.setInputFiles({
          name: "partner-banner-e2e.png",
          mimeType: "image/png",
          buffer: ONE_PX_PNG,
        });
        await expect(page.getByTestId("partner-banner-image-preview").first()).toBeVisible({
          timeout: 30_000,
        });
      }

      await page.getByTestId("partner-banner-title").fill(title);
      await page.getByTestId("partner-banner-subtitle").fill(subtitle);

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/partner-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("partner-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/partners");
      await expect(page.getByTestId("partner-banner")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(title, { exact: true })).toBeVisible();
      await expect(page.getByText(subtitle, { exact: true })).toBeVisible();
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/partner-config",
        "/api/partner-config",
        originalConfig
      );
    }
  });
});