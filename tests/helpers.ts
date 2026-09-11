import { expect, type APIRequestContext } from "@playwright/test";

interface StorefrontProduct {
  name: string;
  slug: string;
  id: string;
}

export async function seedProduct(
  request: APIRequestContext,
  name: string,
  description = "Test product for the storefront catalog."
): Promise<string> {
  const res = await request.post("/api/admin/products", {
    data: {
      emoji: "🧴",
      brand: "E2E Catalog",
      name,
      category: "Skincare",
      price: 499,
      oldPrice: 0,
      stock: 25,
      description,
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

async function resolveSlug(
  request: APIRequestContext,
  adminPath: string,
  storefrontPath: string,
  matchKey: string,
  matchValue: string
): Promise<string> {
  const list = await request.get(storefrontPath);
  expect(list.ok()).toBe(true);
  const items = ((await list.json()).items ?? []) as Array<Record<string, unknown>>;
  const row = items.find((r) => r[matchKey] === matchValue);
  expect(row, `seeded ${adminPath} record "${matchValue}" should appear on ${storefrontPath}`).toBeTruthy();
  return String(row!.slug);
}

export async function seedEvent(
  request: APIRequestContext,
  event: Record<string, unknown>
): Promise<string> {
  const res = await request.post("/api/admin/events", { data: event });
  expect(res.ok()).toBe(true);
  return resolveSlug(request, "/api/admin/events", "/api/events", "title", String(event.title));
}

export async function deleteSeededEvent(request: APIRequestContext, slug: string): Promise<void> {
  const list = await request.get("/api/admin/events");
  if (!list.ok()) return;
  const items = ((await list.json()).items ?? []) as Array<{ id: number; slug: string }>;
  const row = items.find((e) => e.slug === slug);
  if (!row) return;
  await request.delete(`/api/admin/events?id=${row.id}`);
}

export async function seedJob(
  request: APIRequestContext,
  job: Record<string, unknown>
): Promise<string> {
  const res = await request.post("/api/admin/jobs", { data: job });
  expect(res.ok()).toBe(true);
  return resolveSlug(request, "/api/admin/jobs", "/api/jobs", "title", String(job.title));
}

export async function deleteSeededJob(request: APIRequestContext, slug: string): Promise<void> {
  const list = await request.get("/api/admin/jobs");
  if (!list.ok()) return;
  const items = ((await list.json()).items ?? []) as Array<{ id: number; slug: string }>;
  const row = items.find((j) => j.slug === slug);
  if (!row) return;
  await request.delete(`/api/admin/jobs?id=${row.id}`);
}

export async function seedReview(
  request: APIRequestContext,
  review: {
    author: string;
    product: string;
    rating: number;
    comment: string;
    status?: string;
    location?: string;
  }
): Promise<string> {
  const res = await request.post("/api/admin/reviews", {
    data: {
      author: review.author,
      initial: review.author.trim().charAt(0).toUpperCase(),
      product: review.product,
      rating: review.rating,
      comment: review.comment,
      location: review.location ?? "",
      status: review.status ?? "Approved",
    },
  });
  expect(res.ok()).toBe(true);
  const body = (await res.json()) as { id?: number };
  expect(body.id, `seeded review should return an id`).toBeTruthy();
  return String(body.id);
}

export async function deleteSeededReview(
  request: APIRequestContext,
  id: string
): Promise<void> {
  await request.delete(`/api/admin/reviews?id=${id}`);
}