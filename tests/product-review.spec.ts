import { test, expect, type APIRequestContext } from "@playwright/test";
import {
  seedProduct,
  deleteSeededProduct,
  deleteSeededReview,
  waitForAdminReview,
} from "./helpers";

test.describe("Product page star review", () => {
  const stamp = Date.now();
  const productName = `E2E Product Review ${stamp}`;
  const author = `Product Star Reviewer ${stamp}`;
  const comment = `Star rating review ${stamp}`;
  const seededSlugs: string[] = [];
  const seededReviewIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    seededSlugs.push(await seedProduct(request, productName));
  });

  test.afterAll(async ({ request }) => {
    for (const id of seededReviewIds) await deleteSeededReview(request, id);
    for (const s of seededSlugs) await deleteSeededProduct(request, s);
  });

  test("star click opens popup, submits a pending rating, and admin approval surfaces it", async ({
    page,
    request,
  }) => {
    const catalog = await request.get("/api/products");
    const items = ((await catalog.json()).items ?? []) as Array<{
      name: string;
      slug: string;
    }>;
    const slug = items.find((p) => p.name === productName)!.slug;

    await page.goto(`/products/${slug}`);
    await expect(page.getByRole("heading", { name: productName })).toBeVisible();

    await page.getByRole("button", { name: "Rate 5 stars" }).click();
    const modal = page.getByTestId("review-modal");
    await expect(modal).toBeVisible();

    await page.getByLabel(/Your Name/).fill(author);
    await page.getByLabel(/Email/).fill("product-review@example.com");
    await modal.getByLabel("Your Review").fill(comment);
    await modal.getByRole("button", { name: /Submit Review/ }).click();

    await expect(page.getByText(/after admin approval/i)).toBeVisible();
    await expect(modal).toHaveCount(0);

    const mine = await waitForAdminReview(
      request,
      (r) => r.author === author,
      `review by "${author}" should exist in admin`
    );
    seededReviewIds.push(mine.id);
    expect(mine.product).toBe(productName);
    expect(mine.rating).toBe(5);
    expect(mine.status).toBe("Pending");

    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@glowngrace.in");
    await page.getByLabel("Password", { exact: true }).fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
      timeout: 30_000,
    });

    await page.goto("/admin/reviews");
    const approveRow = page.getByRole("row", { name: new RegExp(author) });
    await approveRow.getByRole("button", { name: "Approve" }).click();
    await expect(approveRow).toContainText("Approved");

    await page.goto(`/products/${slug}`);
    await page.getByRole("tab", { name: /Reviews/ }).click();
    await expect(page.getByText(author)).toBeVisible();
    await expect(page.getByText(comment)).toBeVisible();
  });
});