import { test, expect } from "@playwright/test";

test.describe("Storefront survives a suspended Neon database (graceful no-op)", () => {
  test("catalogue and health stay up when DATABASE_URL is set but Neon is quota-blocked", async ({
    request,
  }) => {
    const health = await request.get("/api/health");
    expect(health.ok()).toBe(true);
    const healthBody = (await health.json()) as { database?: string; message?: string };
    expect(["connected", "disabled", "error", "suspended"]).toContain(healthBody.database);
    if (healthBody.database === "suspended") {
      expect(healthBody.message).toBe(
        "Neon Postgres database is suspended (plan quota exceeded)."
      );
    }

    const res = await request.get("/api/products");
    expect(res.ok()).toBe(true);
    const body = (await res.json()) as { items?: unknown[] };
    expect(Array.isArray(body.items)).toBe(true);
  });
});