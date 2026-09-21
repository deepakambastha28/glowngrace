import { test, expect } from "@playwright/test";
import { restoreAdminConfig } from "./helpers";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("admin@glowngrace.in");
  await page.getByLabel("Password", { exact: true }).fill("admin123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
}

test.describe("Admin career page configuration", () => {
  test("edits the heading and hides the services section, reflected on the storefront", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/career-config");
    const originalConfig = (await originalRes.json()).config;

    const marker = `E2E Career ${Date.now()}`;

    try {
      await login(page);

      await page.goto("/admin/pages/career");
      await expect(page.getByTestId("career-config-form")).toBeVisible({ timeout: 30_000 });

      await page.getByTestId("career-heading-title").fill(marker);

      const servicesSection = originalConfig.sections.find(
        (s: { key: string }) => s.key === "services"
      );
      if (servicesSection?.deleted) {
        await page.getByTestId("career-section-restore-services").click();
      }
      if (servicesSection?.deleted || servicesSection?.visible !== false) {
        await page.getByTestId("career-section-toggle-services").click();
      }

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/career-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("career-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/careers");
      await expect(page.getByTestId("career-heading")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(marker)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("career-services")).toHaveCount(0);
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/career-config",
        "/api/career-config",
        originalConfig
      );
    }
  });

  test("adds a service card and edits a step, reflected on the storefront", async ({ page }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/career-config");
    const originalConfig = (await originalRes.json()).config;

    const serviceTitle = `E2E Service ${Date.now()}`;
    const serviceDesc = "An admin-managed career service for testing.";
    const stepTitle = `E2E Step ${Date.now()}`;

    try {
      await login(page);

      await page.goto("/admin/pages/career");
      await expect(page.getByTestId("career-config-form")).toBeVisible({ timeout: 30_000 });

      const sectionLabels: Record<string, string> = {
        services: "Career Services",
        steps: "How It Works",
      };
      for (const key of ["services", "steps"] as const) {
        const section = originalConfig.sections.find(
          (s: { key: string }) => s.key === key
        );
        if (section?.deleted) {
          await page.getByTestId(`career-section-restore-${key}`).click();
          await page.getByRole("button", { name: sectionLabels[key], expanded: false }).click();
        } else if (section?.visible !== true) {
          await page.getByTestId(`career-section-toggle-${key}`).click();
        }
      }

      await page.getByTestId("career-services-add").click();
      await page.getByTestId("career-services-title-0").fill(serviceTitle);
      await page.getByTestId("career-services-description-0").fill(serviceDesc);
      await page.getByTestId("career-steps-title-0").fill(stepTitle);

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/career-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("career-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/careers");
      await expect(page.getByTestId("career-services")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(serviceTitle, { exact: true })).toBeVisible();
      await expect(page.getByText(serviceDesc, { exact: true })).toBeVisible();
      await expect(page.getByText(stepTitle, { exact: true })).toBeVisible();
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/career-config",
        "/api/career-config",
        originalConfig
      );
    }
  });

  test("edits the CTA copy and shows it on the storefront", async ({ page }) => {
    test.setTimeout(180_000);

    const originalRes = await page.request.get("/api/career-config");
    const originalConfig = (await originalRes.json()).config;

    const ctaTitle = `E2E CTA ${Date.now()}`;

    try {
      await login(page);

      await page.goto("/admin/pages/career");
      await expect(page.getByTestId("career-config-form")).toBeVisible({ timeout: 30_000 });

      const ctaSection = originalConfig.sections.find(
        (s: { key: string }) => s.key === "cta"
      );
      if (ctaSection?.deleted) {
        await page.getByTestId("career-section-restore-cta").click();
      } else if (ctaSection?.visible !== true) {
        await page.getByTestId("career-section-toggle-cta").click();
      }

      await page.getByTestId("career-cta-title").fill(ctaTitle);

      const [saveRes] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes("/api/admin/career-config") && r.request().method() === "PUT",
          { timeout: 60_000 }
        ),
        page.getByTestId("career-config-save").click(),
      ]);
      expect(saveRes.ok()).toBeTruthy();

      await page.goto("/careers");
      await expect(page.getByTestId("career-cta")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(ctaTitle, { exact: true })).toBeVisible();
    } finally {
      await restoreAdminConfig(
        page.request,
        "/api/admin/career-config",
        "/api/career-config",
        originalConfig
      );
    }
  });
});