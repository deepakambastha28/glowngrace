import { test, expect } from "@playwright/test";
import { seedProduct, deleteSeededProduct } from "./helpers";

test.describe("Storefront syncs with the admin DB only (no static catalog)", () => {
  const seededSlugs: string[] = [];

  test.afterAll(async ({ request }) => {
    for (const slug of seededSlugs) {
      await deleteSeededProduct(request, slug);
    }
  });

  const track = (slug: string) => {
    seededSlugs.push(slug);
  };
  test("products/partners come only from the admin database", async ({ request }) => {
    const name = `E2E DB Catalog ${Date.now()}`;
    track(await seedProduct(request, name));

    const list = await request.get("/api/products");
    expect(list.ok()).toBe(true);
    const items = (((await list.json()).items ?? []) as Array<{
      id: string;
      name: string;
      slug: string;
    }>) ?? [];
    expect(items.some((p) => p.name === name)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    for (const p of items) {
      expect(p.id.startsWith("admin-")).toBe(true);
    }
    expect(items.some((p) => p.slug === "luxe-liquid-lipstick")).toBe(false);
    expect(items.some((p) => p.slug === "vitamin-c-face-serum")).toBe(false);
    expect(items.some((p) => p.slug === "gel-nail-polish-set")).toBe(false);

    const plist = await request.get("/api/partners");
    expect(plist.ok()).toBe(true);
    const partners = (((await plist.json()).items ?? []) as Array<{ id: string; name: string }>) ?? [];
    for (const p of partners) {
      expect(p.id.startsWith("admin-")).toBe(true);
    }
    expect(partners.some((p) => p.name === "Blush Beauty Lounge")).toBe(false);
  });

  test("home page shows DB products and hides the static catalog", async ({ page, request }) => {
    const name = `E2E Home Only ${Date.now()}`;
    track(await seedProduct(request, name));

    await page.goto("/");
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Luxe Liquid Lipstick")).toHaveCount(0);
    await expect(page.getByText("Vitamin C Face Serum")).toHaveCount(0);
    await expect(page.getByTestId("partners-preview-section")).toHaveCount(0);
  });

  test("shop page lists only DB products", async ({ page, request }) => {
    const name = `E2E Shop Only ${Date.now()}`;
    track(await seedProduct(request, name));

    await page.goto("/products");
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Luxe Liquid Lipstick")).toHaveCount(0);
  });

  test("a static-only product slug now 404s", async ({ page }) => {
    await page.goto("/products/luxe-liquid-lipstick");
    await expect(page.getByRole("heading", { name: /404/ })).toBeVisible({ timeout: 30_000 });
  });
});