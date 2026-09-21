import { test, expect } from "@playwright/test";
import { restoreAdminConfig } from "./helpers";

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
});