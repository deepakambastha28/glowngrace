import { expect, type APIRequestContext } from "@playwright/test";

interface StorefrontProduct {
  name: string;
  slug: string;
  id: string;
}

export async function seedProduct(request: APIRequestContext, name: string): Promise<string> {
  const res = await request.post("/api/admin/products", {
    data: {
      emoji: "🧴",
      brand: "E2E Catalog",
      name,
      category: "Skincare",
      price: 499,
      oldPrice: 0,
      stock: 25,
      description: "Test product for the storefront catalog.",
      descriptionHtml: "",
      features: ["Catalog sync"],
      tags: ["e2e"],
      imageData: null,
      shade: "",
      size: "50ml",
      finish: "",
      ingredients: "",
      isNew: false,
    },
  });
  expect(res.ok()).toBe(true);

  const list = await request.get("/api/products");
  expect(list.ok()).toBe(true);
  const items = ((await list.json()).items ?? []) as StorefrontProduct[];
  const product = items.find((p) => p.name === name);
  expect(product, `seeded product "${name}" should appear on /api/products`).toBeTruthy();
  return product!.slug;
}

export async function deleteSeededProduct(request: APIRequestContext, slug: string): Promise<void> {
  const list = await request.get("/api/admin/products");
  if (!list.ok()) return;
  const items = ((await list.json()).items ?? []) as Array<{ id: number; slug: string }>;
  const row = items.find((p) => p.slug === slug);
  if (!row) return;
  await request.delete(`/api/admin/products?id=${row.id}`);
}