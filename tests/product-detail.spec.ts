import { test, expect } from "@playwright/test";
import {
  seedProduct,
  deleteSeededProduct,
  seedReview,
  deleteSeededReview,
} from "./helpers";

const LONG_DESCRIPTION = [
  "Luxury repair serum powered by vitamin E and twelve nutri-functional oils.",
  "Restores softness, reduces frizz, and shields strands from environmental stress.",
  "Lightweight, non-greasy formula that absorbs instantly without any residue.",
  "Suitable for dry, frizzy, curly, straight, wavy, colored and treated hair.",
  "Developed under ISO-certified production processes for consistent quality.",
  "Free from parabens and sulfates. Cruelty-free and dermatologically tested.",
  "Use a few drops on damp or dry lengths every morning for best results.",
].join(" ");

test.describe("Product detail", () => {
  const seededSlugs: string[] = [];

  test.afterEach(async ({ request }) => {
    for (const slug of seededSlugs.splice(0)) {
      await deleteSeededProduct(request, slug);
    }
  });

  test("adds to cart and updates the nav badge", async ({ page, request }) => {
    const name = `E2E Detail Cart ${Date.now()}`;
    const slug = await seedProduct(request, name);
    seededSlugs.push(slug);

    await page.goto(`/products/${slug}`);

    const addToCart = page.getByRole("button", { name: "Add to Cart" });
    await expect(addToCart).toBeVisible();

    await addToCart.click();

    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await page.getByTestId("cart-link").click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByTestId("cart-item")).toHaveCount(1);
  });

  test("quantity stepper increases the checked-out count", async ({ page, request }) => {
    const name = `E2E Detail Qty ${Date.now()}`;
    const slug = await seedProduct(request, name);
    seededSlugs.push(slug);

    await page.goto(`/products/${slug}`);

    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.getByTestId("quantity-display")).toHaveText("2");
  });

  test("wishlist button toggles state", async ({ page }) => {
    await page.goto("/products");

    const wish = page.getByTestId("product-card").first().getByTestId("wishlist-button");
    await wish.click();
    await expect(wish).toHaveClass(/bg-rose/);
    await wish.click();
    await expect(wish).not.toHaveClass(/bg-rose/);
  });

  test("detail page gallery hero is strictly 440×460", async ({ page, request }) => {
    const name = `E2E Detail Hero ${Date.now()}`;
    const slug = await seedProduct(request, name);
    seededSlugs.push(slug);

    await page.goto(`/products/${slug}`);
    const hero = page.getByTestId("product-gallery");
    await expect(hero).toBeVisible();

    const box = await hero.boundingBox();
    expect(box!.width).toBe(440);
    expect(box!.height).toBe(460);
  });

  test("main description is clamped to 5 lines and the full text lives in the description tab", async ({ page, request }) => {
    const name = `E2E Detail Clamp ${Date.now()}`;
    const slug = await seedProduct(request, name, LONG_DESCRIPTION);
    seededSlugs.push(slug);

    await page.goto(`/products/${slug}`);
    await page.waitForSelector("[data-testid=main-description]");

    const mainDesc = page.getByTestId("main-description");
    await expect(mainDesc).toBeVisible();

    const clamp = await mainDesc.evaluate(
      (el) => getComputedStyle(el).getPropertyValue("-webkit-line-clamp")
    );
    expect(clamp).toBe("5");

    const box = await mainDesc.boundingBox();
    expect(box!.height).toBeLessThanOrEqual(200);

    await page.getByTestId("read-more").click();
    await expect(page.getByTestId("description-tab")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Description" })).toHaveAttribute(
      "data-state",
      "active"
    );
    await expect(page.getByTestId("description-tab")).toContainText(LONG_DESCRIPTION);
  });

  test("admin-approved reviews appear on the detail page and pending ones stay hidden", async ({ page, request }) => {
    const name = `E2E Review Product ${Date.now()}`;
    const slug = await seedProduct(request, name);

    const approvedId = await seedReview(request, {
      author: "Aisha Verma",
      product: name,
      rating: 5,
      comment: "Absolutely love this product, my hair feels amazing!",
    });
    const pendingId = await seedReview(request, {
      author: "Hidden User",
      product: name,
      rating: 1,
      comment: "This pending review must never appear.",
      status: "Pending",
    });
    seededSlugs.push(slug);

    const catalog = await request.get("/api/products");
    const catalogItems = (catalog.ok()
      ? ((await catalog.json()).items ?? [])
      : []) as Array<{ name: string; reviewsCount: number; rating: number }>;
    const catalogProduct = catalogItems.find((p) => p.name === name);
    expect(catalogProduct, `catalog should include seeded product "${name}"`).toBeTruthy();
    expect(catalogProduct!.reviewsCount).toBe(1);
    expect(catalogProduct!.rating).toBe(5);

    await page.goto(`/products/${slug}`);

    const reviewsTab = page.getByRole("tab", { name: /Reviews/ });
    await expect(reviewsTab).toContainText("Reviews (1)");

    await reviewsTab.click();
    await expect(page.getByText("Aisha Verma")).toBeVisible();
    await expect(page.getByText("Absolutely love this product, my hair feels amazing!")).toBeVisible();
    await expect(page.getByText("This pending review must never appear.")).toHaveCount(0);
    await expect(page.getByText("Hidden User")).toHaveCount(0);

    await deleteSeededReview(request, approvedId);
    await deleteSeededReview(request, pendingId);
  });

  test("trust badges pin to the bottom of the image tile with a wider info column", async ({ page, request }) => {
    const name = `E2E Detail Badges ${Date.now()}`;
    const slug = await seedProduct(request, name);
    seededSlugs.push(slug);

    await page.goto(`/products/${slug}`);

    const gallery = page.getByTestId("product-gallery");
    await expect(gallery).toBeVisible();

    const galleryCol = page.getByTestId("gallery-column");
    const infoCol = page.getByTestId("info-column");
    const badges = page.getByTestId("trust-badges");
    await expect(badges).toBeVisible();

    await expect(galleryCol.getByTestId("trust-badges")).toBeVisible();
    await expect(
      badges.getByText("Free shipping across Lucknow on orders above ₹999")
    ).toBeVisible();
    await expect(badges.getByText("7-day easy returns & exchange")).toBeVisible();
    await expect(badges.getByText("100% authentic, quality assured")).toBeVisible();

    const gColBox = (await galleryCol.boundingBox())!;
    const iColBox = (await infoCol.boundingBox())!;
    const bBox = (await badges.boundingBox())!;
    expect(Math.abs(gColBox.height - iColBox.height)).toBeLessThanOrEqual(2);
    expect(bBox.y + bBox.height).toBeGreaterThanOrEqual(gColBox.y + gColBox.height - 8);

    const gBox = (await gallery.boundingBox())!;
    const h1Box = (await page.locator("h1").boundingBox())!;
    const gap = h1Box.x - (gBox.x + gBox.width);
    expect(gap).toBeGreaterThanOrEqual(16);
    expect(gap).toBeLessThan(48);
    expect(h1Box.width).toBeGreaterThan(620);
  });
});