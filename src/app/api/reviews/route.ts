import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { query, isDbConfigured } from "@/lib/db";
import { contactReviewSchema } from "@/lib/schemas";
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

/** GET /api/reviews?product=... — approved reviews for a product, or all approved reviews when no product is given. */
export async function GET(request: Request) {
  noStore();
  const { searchParams } = new URL(request.url);
  const product = (searchParams.get("product") ?? "").trim();

  let items: Review[] = [];
  if (isDbConfigured()) {
    const rows = product
      ? await query(
          `SELECT id, author, initial, rating, comment, created_at
           FROM gg_admin_reviews
           WHERE product = $1 AND status = 'Approved'
           ORDER BY created_at DESC`,
          [product]
        )
      : await query(
          `SELECT id, author, initial, rating, comment, created_at
           FROM gg_admin_reviews
           WHERE status = 'Approved'
           ORDER BY created_at DESC`
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

/** POST /api/reviews — public review (rating + comment) from the product detail star popup, or a comment-only review from the contact page; starts as Pending. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { persisted: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({
        persisted: false,
        message: "Database not configured — review acknowledged without persistence.",
      });
    }

    const d = parsed.data;
    const name = d.name.trim();
    const initial = (name.charAt(0) || "?").toUpperCase();
    const product = d.product.trim() || "General";
    const rating = d.rating ?? 0;

    const rows = await query(
      `INSERT INTO gg_admin_reviews
        (author, initial, product, rating, comment, location, status)
       VALUES ($1,$2,$3,$4,$5,'','Pending')
       RETURNING id`,
      [name, initial, product, rating, d.comment.trim()]
    );

    const id = rows?.[0]?.id;
    return NextResponse.json({ persisted: true, id });
  } catch (error) {
    console.error("POST /api/reviews failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not submit review" },
      { status: 500 }
    );
  }
}