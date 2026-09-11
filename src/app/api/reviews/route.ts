import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { query, isDbConfigured } from "@/lib/db";
import type { Review } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: unknown): string {
  const d = new Date(String(value ?? ""));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** GET /api/reviews?product=... — approved customer reviews for a product (by name). */
export async function GET(request: Request) {
  noStore();
  const { searchParams } = new URL(request.url);
  const product = (searchParams.get("product") ?? "").trim();

  let items: Review[] = [];
  if (isDbConfigured() && product) {
    const rows = await query(
      `SELECT id, author, initial, rating, comment, created_at
       FROM gg_admin_reviews
       WHERE product = $1 AND status = 'Approved'
       ORDER BY created_at DESC`,
      [product]
    );
    items = (rows ?? []).map((r) => ({
      id: String(r.id),
      author: String(r.author),
      initial: String(r.initial ?? ""),
      rating: Number(r.rating),
      date: formatDate(r.created_at),
      comment: String(r.comment),
    }));
  }

  return NextResponse.json({ items });
}