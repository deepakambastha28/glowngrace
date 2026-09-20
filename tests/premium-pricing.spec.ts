import { test, expect } from "@playwright/test";
import { seedJob, deleteSeededJob } from "./helpers";

async function loginAsCandidate(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("candidate@glowngrace.in");
  await page.getByLabel("Password").fill("candidate123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/candidate/);
}

async function openPreviewTab(page: import("@playwright/test").Page) {
  await page.goto("/candidate");
  await page.getByRole("button", { name: "Preview Profile" }).click();
}

test.describe("Candidate premium membership", () => {
  test("pricing section in preview profile shows three tiers with Pro Max emphasized", async ({ page }) => {
    await loginAsCandidate(page);
    await openPreviewTab(page);

    const section = page.getByTestId("premium-pricing");
    await expect(section).toBeVisible();
    await expect(section.getByRole("heading", { name: /Choose Your Career Advantage/i })).toBeVisible();

    await expect(page.getByTestId("plan-free")).toBeVisible();
    await expect(page.getByTestId("plan-pro")).toBeVisible();
    await expect(page.getByTestId("plan-pro-max")).toBeVisible();

    await expect(page.getByTestId("plan-pro").getByText(/1,000/)).toBeVisible();
    await expect(page.getByTestId("plan-pro-max").getByText(/3,000/)).toBeVisible();

    await expect(page.getByTestId("pro-max-emphasis")).toBeVisible();
  });

  test("free candidate sees upgrade CTAs and upgrading to Pro shows Current Plan", async ({ page }) => {
    await loginAsCandidate(page);
    await openPreviewTab(page);

    const proCard = page.getByTestId("plan-pro");
    await expect(proCard.getByTestId("upgrade-pro")).toHaveText(/Upgrade to Pro/);
    await expect(page.getByTestId("plan-pro-max").getByTestId("upgrade-pro-max")).toHaveText(/Upgrade to Pro Max/);

    await proCard.getByTestId("upgrade-pro").click();

    await expect(page.getByTestId("plan-pro").getByTestId("current-plan")).toHaveText(/Current Plan/);
    await expect(page.getByTestId("plan-pro").getByTestId("upgrade-pro")).toHaveCount(0);
    await expect(page.getByTestId("plan-pro-max").getByTestId("upgrade-pro-max")).toHaveText(/Upgrade to Pro Max/);
  });

  test("tier persists across reload and Pro Max disables all upgrades", async ({ page }) => {
    await loginAsCandidate(page);
    await openPreviewTab(page);
    await page.getByTestId("plan-pro-max").getByTestId("upgrade-pro-max").click();

    await expect(page.getByTestId("plan-pro-max").getByTestId("current-plan")).toHaveText(/Current Plan/);
    await page.reload();
    await page.getByRole("button", { name: "Preview Profile" }).click();
    await expect(page.getByTestId("plan-pro-max").getByTestId("current-plan")).toHaveText(/Current Plan/);
    await expect(page.getByTestId("plan-pro-max").getByTestId("upgrade-pro-max")).toHaveCount(0);
    await expect(page.getByTestId("upgrade-pro")).toHaveCount(0);
  });

  test("verified jobs are hidden from Free tier but visible to premium with a badge", async ({ page, request }) => {
    const plainSlug = await seedJob(request, {
      title: "E2E Premium Standard Beautician",
      salon: "E2E Premium Salon",
      location: "Lucknow",
      type: "Full Time",
      salaryMin: 25000,
      status: "Open",
    });
    const verifiedSlug = await seedJob(request, {
      title: "E2E Premium Verified Makeup Artist",
      salon: "E2E Premium Salon",
      location: "Lucknow",
      type: "Full Time",
      salaryMin: 30000,
      status: "Open",
    });

    try {
      const list = await request.get("/api/admin/jobs");
      const rows = ((await list.json()).items ?? []) as Array<{ id: number; slug: string }>;
      const vrow = rows.find((j) => j.slug === verifiedSlug);
      expect(vrow).toBeTruthy();
      const patch = await request.patch(`/api/admin/jobs?id=${vrow!.id}`, { data: { verified: true } });
      expect(patch.ok()).toBe(true);

      // Logged out = free tier: standard listed, verified hidden
      await page.goto("/careers");
      await expect(page.getByText("E2E Premium Standard Beautician")).toBeVisible();
      await expect(page.getByText("E2E Premium Verified Makeup Artist")).toHaveCount(0);

      // Free candidate: still hidden
      await loginAsCandidate(page);
      await page.goto("/careers");
      await expect(page.getByText("E2E Premium Standard Beautician")).toBeVisible();
      await expect(page.getByText("E2E Premium Verified Makeup Artist")).toHaveCount(0);

      // Upgrade to Pro from the candidate preview profile, then see the verified job with a badge
      await openPreviewTab(page);
      await page.getByTestId("plan-pro").getByTestId("upgrade-pro").click();
      await page.goto("/careers");
      await expect(page.getByText("E2E Premium Verified Makeup Artist")).toBeVisible();
      await expect(page.getByTestId("verified-badge").first()).toBeVisible();
    } finally {
      await deleteSeededJob(request, plainSlug);
      await deleteSeededJob(request, verifiedSlug);
    }
  });

  test("candidate profile shows membership tier badge", async ({ page }) => {
    await loginAsCandidate(page);

    await expect(page.getByTestId("tier-badge")).toHaveText(/Free/);
    await openPreviewTab(page);
    await page.getByTestId("plan-pro").getByTestId("upgrade-pro").click();
    await page.goto("/candidate");
    await expect(page.getByTestId("tier-badge")).toHaveText(/Pro/);
  });
});