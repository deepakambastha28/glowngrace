import { expect, type APIRequestContext } from "@playwright/test";

const TEST_PATTERN = /e2e/i;

function isTestRecord(record: Record<string, unknown>): boolean {
  const fields = [record.name, record.title, record.slug, record.author, record.email, record.fullName];
  return fields.some((v) => typeof v === "string" && TEST_PATTERN.test(v));
}

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

/**
 * DELETE an admin row by id, retrying and asserting `res.ok()` so a silently
 * failed delete (Neon slow-write / proxy timeout) cannot strand an E2E record
 * in the live DB. Throws after exhausting retries.
 */
async function deleteAdminRowById(request: APIRequestContext, url: string, what: string): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await request.delete(url, { timeout: 60_000 });
      if (res.ok()) return;
      lastError = new Error(`DELETE ${url} returned ${res.status()}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Failed to delete ${what} after retries: ${String(lastError)}`);
}

export async function deleteSeededProduct(request: APIRequestContext, slug: string): Promise<void> {
  const list = await request.get("/api/admin/products");
  if (!list.ok()) return;
  const items = ((await list.json()).items ?? []) as Array<{ id: number; slug: string }>;
  const row = items.find((p) => p.slug === slug);
  if (!row) return;
  if (!isTestRecord(row)) {
    throw new Error(`Refused to delete non-test product "${row.slug}". Only E2E test records may be deleted.`);
  }
  await deleteAdminRowById(request, `/api/admin/products?id=${row.id}`, `product "${row.slug}"`);
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
  if (!isTestRecord(row)) {
    throw new Error(`Refused to delete non-test event "${row.slug}". Only E2E test records may be deleted.`);
  }
  await deleteAdminRowById(request, `/api/admin/events?id=${row.id}`, `event "${row.slug}"`);
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
  if (!isTestRecord(row)) {
    throw new Error(`Refused to delete non-test job "${row.slug}". Only E2E test records may be deleted.`);
  }
  await deleteAdminRowById(request, `/api/admin/jobs?id=${row.id}`, `job "${row.slug}"`);
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
  const list = await request.get("/api/admin/reviews");
  if (!list.ok()) return;
  const items = ((await list.json()).items ?? []) as Array<{ id: string | number; author: string }>;
  const row = items.find((r) => String(r.id) === id);
  if (!row) return;
  if (!isTestRecord(row)) {
    throw new Error(`Refused to delete non-test review id=${id} by "${row.author}". Only E2E test records may be deleted.`);
  }
  await deleteAdminRowById(request, `/api/admin/reviews?id=${id}`, `review id=${id} by "${row.author}"`);
}

/**
 * PUT an admin page config with a generous timeout, retrying on Neon
 * slow-write timeouts so a timed-out save never strands partial data.
 */
export async function saveAdminConfig(
  request: APIRequestContext,
  route: string,
  config: unknown,
  timeoutMs = 90_000
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await request.put(route, { data: config, timeout: timeoutMs });
      expect(res.ok()).toBeTruthy();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  throw lastError;
}

/**
 * Restore an admin page config to its exact original value and verify by
 * reading it back. Retries until the stored row matches, so prod data is
 * always synced back even when a write times out on the client side.
 */
export async function restoreAdminConfig(
  request: APIRequestContext,
  route: string,
  readRoute: string,
  original: unknown
): Promise<void> {
  const expected = JSON.stringify(original);
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    await saveAdminConfig(request, route, original);
    const res = await request.get(readRoute, { timeout: 60_000 });
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { config?: unknown };
    if (JSON.stringify(body.config) === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Failed to restore ${route} to the original configuration after retries.`);
}

export interface AdminReviewRow {
  id: string;
  author: string;
  product: string;
  rating: number;
  comment: string;
  status: string;
}

/**
 * Poll `/api/admin/reviews` until a matching row is visible. Neon can
 * momentarily miss a just-committed row (cold pool / IPv6 route), so a single
 * read is flaky; retry briefly before failing.
 */
export async function waitForAdminReview(
  request: APIRequestContext,
  match: (row: AdminReviewRow) => boolean,
  description: string,
  attempts = 8
): Promise<AdminReviewRow> {
  let row: AdminReviewRow | undefined;
  for (let i = 0; i < attempts; i++) {
    const list = await request.get("/api/admin/reviews");
    if (list.ok()) {
      const items = ((await list.json()).items ?? []) as AdminReviewRow[];
      row = items.find(match);
      if (row) return row;
    }
    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  expect(row, description).toBeTruthy();
  return row!;
}