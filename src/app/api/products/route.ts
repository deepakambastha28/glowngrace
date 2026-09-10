import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { query, isDbConfigured } from "@/lib/db";
import type { Product } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRODUCT_CATEGORIES = ["Makeup", "Skincare", "Nail Care", "Fragrances"];

function toStorefrontProduct(row: Record<string, unknown>): Product | null {
  const category = String(row.category ?? "");
  if (!PRODUCT_CATEGORIES.includes(category)) return null;
  const isNew = Boolean(row.is_new);
  const stock = Number(row.stock ?? 0);
  return {
    id: `admin-${String(row.id)}`,
    slug: String(row.slug),
    emoji: String(row.emoji),
    brand: String(row.brand),
    name: String(row.name),
    category: category as Product["category"],
    price: Number(row.price),
    oldPrice: Number(row.old_price ?? 0),
    rating: 0,
    reviewsCount: 0,
    tag: isNew ? "NEW" : undefined,
    isNew,
    description: String(row.description ?? ""),
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    inStock: stock > 0,
  };
}

/** GET /api/products — storefront catalogue: admin-created products only (newest first). */
export async function GET() {
  noStore();
  let items: Product[] = [];
  if (isDbConfigured()) {
    const rows = await query(
      `SELECT id, slug, emoji, brand, name, category, price, old_price,
              stock, description, features, is_new, created_at
       FROM gg_admin_products WHERE hidden = false ORDER BY created_at DESC`
    );
    items = (rows ?? [])
      .map(toStorefrontProduct)
      .filter((p): p is Product => p !== null);
  }

  return NextResponse.json({ items });
}