import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { query, isDbConfigured } from "@/lib/db";
import type { Product } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toStorefrontProduct(row: Record<string, unknown>): Product | null {
  const category = String(row.category ?? "");
  const isNew = Boolean(row.is_new);
  const stock = Number(row.stock ?? 0);
  const gallery = Array.isArray(row.gallery)
    ? (row.gallery as string[])
    : [];
  return {
    id: `admin-${String(row.id)}`,
    slug: String(row.slug),
    emoji: String(row.emoji),
    brand: String(row.brand),
    name: String(row.name),
    category,
    price: Number(row.price),
    oldPrice: Number(row.old_price ?? 0),
    rating: 0,
    reviewsCount: 0,
    tag: isNew ? "NEW" : undefined,
    isNew,
    description: String(row.description ?? ""),
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    inStock: stock > 0,
    imageData: row.image_data ? String(row.image_data) : gallery[0] || null,
    gallery,
  };
}

/** GET /api/products — storefront catalogue: admin-created products only (newest first). */
export async function GET() {
  noStore();
  let items: Product[] = [];
  if (isDbConfigured()) {
    const rows = await query(
      `SELECT id, slug, emoji, brand, name, category, price, old_price,
              stock, description, features, is_new, image_data, gallery,
              created_at
       FROM gg_admin_products WHERE hidden = false ORDER BY created_at DESC`
    );
    const reviewRows = await query(
      `SELECT product, rating FROM gg_admin_reviews WHERE status = 'Approved'`
    );
    const reviewsByProduct = new Map<
      string,
      { ratingTotal: number; ratingCount: number; count: number }
    >();
    for (const r of reviewRows ?? []) {
      const name = String(r.product);
      const agg = reviewsByProduct.get(name) ?? { ratingTotal: 0, ratingCount: 0, count: 0 };
      agg.count += 1;
      const rating = Number(r.rating);
      if (rating > 0) {
        agg.ratingTotal += rating;
        agg.ratingCount += 1;
      }
      reviewsByProduct.set(name, agg);
    }
    items = (rows ?? [])
      .map((row) => {
        const p = toStorefrontProduct(row);
        if (!p) return null;
        const agg = reviewsByProduct.get(p.name);
        p.rating = agg && agg.ratingCount > 0 ? agg.ratingTotal / agg.ratingCount : 0;
        p.reviewsCount = agg?.count ?? 0;
        return p;
      })
      .filter((p): p is Product => p !== null);
  }

  return NextResponse.json({ items });
}