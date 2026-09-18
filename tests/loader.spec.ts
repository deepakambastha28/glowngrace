import { test, expect } from "@playwright/test";

test.describe("Component loader (loader-animated.gif)", () => {
  test("candidate page shows the animated gif loader while the profile loads, with no page-level wrapper", async ({ page }) => {
    test.setTimeout(120_000);

    const candidatesRoute = "**/api/candidates*";
    await page.route(candidatesRoute, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      await route.continue().catch(() => {});
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill("candidate@glowngrace.in");
    await page.getByLabel("Password", { exact: true }).fill("candidate123");
    await page.getByRole("button", { name: "Sign In" }).click();

    const loader = page.getByTestId("gg-loader");
    await expect(loader).toBeVisible({ timeout: 15_000 });
    await expect(loader.locator("img[src*='loader-animated']")).toBeVisible();
    await expect(loader).toContainText("Loading...");
    await expect(page.getByTestId("preloader")).toHaveCount(0);

    await page.unroute(candidatesRoute);
    await expect(loader).not.toBeVisible({ timeout: 30_000 });
  });

  test("recruiter jobs page shows the animated gif loader inside the card with its label", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/login");
    await page.getByLabel("Email").fill("recruiter@glowngrace.in");
    await page.getByLabel("Password", { exact: true }).fill("recruiter123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/recruiter/, { timeout: 30_000 });

    const jobsRoute = "**/api/admin/jobs";
    await page.route(jobsRoute, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      await route.continue().catch(() => {});
    });

    await page.goto("/recruiter/jobs");

    const loader = page.getByTestId("gg-loader");
    await expect(loader).toBeVisible({ timeout: 15_000 });
    await expect(loader.locator("img[src*='loader-animated']")).toBeVisible();
    await expect(loader).toContainText("Loading jobs...");
    await expect(page.getByTestId("preloader")).toHaveCount(0);

    await page.unroute(jobsRoute);
    await expect(loader).not.toBeVisible({ timeout: 30_000 });
  });
});