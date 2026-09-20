import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "admin@glowngrace.in";
const DEMO_PASS = "admin123";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASS);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
}

test.describe("local database sync", () => {
  test.setTimeout(180_000);

  test.beforeAll(async ({ request }) => {
    const health = await request.get("/api/health");
    const body = (await health.json()) as { mode?: string };
    test.skip(body.mode !== "local", "Not running in local mode (USE_LOCAL_DB=true) — skipping.");
  });

  test("admin dashboard shows the local-mode sync card and button", async ({ page }) => {
    await signIn(page);

    const card = page.getByTestId("local-sync-card");
    await expect(card).toBeVisible();
    await expect(card.getByText("Local database mode")).toBeVisible();

    const button = page.getByTestId("sync-from-neon");
    await expect(button).toBeVisible();
  });

  test("Sync from Neon succeeds when the source is reachable, else shows the source-unavailable note", async ({ page, request }) => {
    const preflight = await request.get("/api/admin/sync");
    expect(preflight.ok()).toBe(true);
    const preflightBody = (await preflight.json()) as {
      local: boolean;
      sourceConfigured: boolean;
      sourceAvailable: boolean;
    };
    expect(preflightBody.local).toBe(true);
    expect(preflightBody.sourceConfigured).toBe(true);
    expect(typeof preflightBody.sourceAvailable).toBe("boolean");

    await signIn(page);
    const button = page.getByTestId("sync-from-neon");
    const note = page.getByTestId("sync-source-unavailable");
    const result = page.getByTestId("sync-result");

    if (preflightBody.sourceAvailable === false) {
      // Neon is unreachable (e.g. plan quota exceeded) — the graceful path.
      await expect(button).toBeDisabled();
      await expect(note).toBeVisible();
      return;
    }

    await expect(button).toBeEnabled();
    await button.click();
    await expect(result).toBeVisible({ timeout: 120_000 });
    await expect(result).toHaveText(/Synced \d+ rows across \d+ tables/);

    // The local Docker database now serves the storefront catalog.
    const products = await request.get("/api/products");
    expect(products.ok()).toBe(true);
    const body = (await products.json()) as { items?: unknown[] };
    expect(Array.isArray(body.items)).toBe(true);
  });
});