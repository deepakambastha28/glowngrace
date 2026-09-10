import { test, expect } from "@playwright/test";
import { deleteSeededProduct } from "./helpers";

test.describe("Admin → storefront product sync", () => {
  let cleanedSlug = "";
  test("an admin-created product appears on /api/products, the shop listing, its detail page and the home Bestsellers", async ({ request, page }) => {
    test.setTimeout(120_000);

    const name = `E2E Sync ${Date.now()}`;

    const create = await request.post("/api/admin/products", {
      data: {
        emoji: "🛡️",
        brand: "E2E Sync",
        name,
        category: "Skincare",
        price: 499,
        oldPrice: 0,
        stock: 25,
        description: "E2E test product for admin → storefront sync.",
        descriptionHtml: "",
        features: ["Verifies sync"],
        tags: ["e2e"],
        imageData: null,
        shade: "",
        size: "50ml",
        finish: "",
        ingredients: "",
        isNew: true,
      },
    });
    expect(create.ok()).toBe(true);

    const list = await request.get("/api/products");
    expect(list.ok()).toBe(true);
    const items = ((await list.json()).items ?? []) as Array<{
      name: string;
      slug: string;
      emoji: string;
      inStock: boolean;
    }>;
    const product = items.find((p) => p.name === name);
    expect(product).toBeTruthy();
    expect(product?.emoji).toBe("🛡️");
    expect(product?.inStock).toBe(true);

    await page.goto("/products");
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 20_000 });

    await page.goto(`/products/${product?.slug}`);
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to Cart" })).toBeVisible();

    await page.goto("/");
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 20_000 });

    cleanedSlug = product?.slug ?? "";
  });

  test.afterAll(async ({ request }) => {
    if (cleanedSlug) {
      await deleteSeededProduct(request, cleanedSlug);
    }
  });
});