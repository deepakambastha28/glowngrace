import { test, expect, type APIRequestContext } from "@playwright/test";
import {
  seedProduct,
  deleteSeededProduct,
  deleteSeededReview,
  waitForAdminReview,
} from "./helpers";

async function findReviewId(
  request: APIRequestContext,
  author: string,
  comment: string
): Promise<string> {
  const row = await waitForAdminReview(
    request,
    (r) => r.author === author && r.comment === comment,
    `review by "${author}" should exist on /api/admin/reviews`
  );
  return row.id;
}

test.describe("Contact page reviews", () => {
  const stamp = Date.now();
  const productName = `E2E Contact Product ${stamp}`;
  const seededSlugs: string[] = [];
  const seededReviewIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    seededSlugs.push(await seedProduct(request, productName));
  });

  test.afterAll(async ({ request }) => {
    for (const id of seededReviewIds) await deleteSeededReview(request, id);
    for (const s of seededSlugs) await deleteSeededProduct(request, s);
  });

  test("navbar no longer exposes a Reviews link", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByTestId("navbar").getByRole("link", { name: "Reviews" })
    ).toHaveCount(0);
  });

  test("contact page takes a review comment (no rating) and stores it as pending", async ({
    page,
    request,
  }) => {
    const author = `Contact UI Reviewer ${stamp}`;
    const comment = `UI review comment ${stamp}`;

    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: /Contact Us/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Leave a Review/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /stars/ })).toHaveCount(0);

    await page.getByLabel(/Your Name/).fill(author);
    await page.getByLabel(/Email/).fill("e2e-contact@example.com");
    await page.getByLabel(/Product/).selectOption({ label: productName });
    await page.getByLabel(/Review/).fill(comment);
    await page.getByRole("button", { name: /Submit Review/ }).click();

    await expect(page.getByText(/moderation|approve/i)).toBeVisible();
    seededReviewIds.push(await findReviewId(request, author, comment));

    await page.goto("/");
    await expect(
      page.getByTestId("testimonials-section").getByText(author)
    ).toHaveCount(0);
  });

  test("admin approval shows the review on home and the product tab; denial keeps it hidden", async ({
    page,
    request,
  }) => {
    const author = `Moderated Reviewer ${stamp}`;
    const comment = `Loved the products ${stamp}`;
    const deniedAuthor = `Denied User ${stamp}`;
    const deniedComment = `Not a fan ${stamp}`;

    const create = await request.post("/api/reviews", {
      data: {
        name: author,
        email: "moderated@example.com",
        product: productName,
        comment,
      },
    });
    expect(create.ok()).toBe(true);
    seededReviewIds.push(await findReviewId(request, author, comment));

    const denied = await request.post("/api/reviews", {
      data: {
        name: deniedAuthor,
        email: "denied@example.com",
        product: productName,
        comment: deniedComment,
      },
    });
    expect(denied.ok()).toBe(true);
    seededReviewIds.push(await findReviewId(request, deniedAuthor, deniedComment));

    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@glowngrace.in");
    await page.getByLabel("Password", { exact: true }).fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
      timeout: 30_000,
    });

    await page.goto("/admin/reviews");
    await expect(page.getByRole("heading", { name: "Reviews" })).toBeVisible();

    const approveRow = page.getByRole("row", { name: new RegExp(author) });
    await approveRow.getByRole("button", { name: "Approve" }).click();
    await expect(approveRow).toContainText("Approved");

    const denyRow = page.getByRole("row", { name: new RegExp(deniedAuthor) });
    await denyRow.getByRole("button", { name: "Deny" }).click();
    await expect(denyRow).toContainText("Hidden");

    const productSlug = await (async () => {
      const list = await request.get("/api/products");
      const items = ((await list.json()).items ?? []) as Array<{
        name: string;
        slug: string;
      }>;
      return items.find((p) => p.name === productName)!.slug;
    })();

    await page.goto("/");
    const testimonials = page.getByTestId("testimonials-section");
    await expect(testimonials.getByText(author)).toBeVisible();
    await expect(testimonials.getByText(comment)).toBeVisible();
    await expect(testimonials.getByText(deniedAuthor)).toHaveCount(0);

    await page.goto(`/products/${productSlug}`);
    await page.getByRole("tab", { name: /Reviews/ }).click();
    await expect(page.getByText(author)).toBeVisible();
    await expect(page.getByText(comment)).toBeVisible();
    await expect(page.getByText(deniedComment)).toHaveCount(0);

    await page.goto("/");
    await expect(
      page.getByTestId("testimonials-section").getByText(deniedAuthor)
    ).toHaveCount(0);
  });
});