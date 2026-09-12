import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { adminReviewSchema } from "@/lib/schemas";

function initialFor(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

/** GET /api/admin/reviews — list admin-created reviews. */
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, items: [] });
  }
  const rows = await query(
    `SELECT id, author, initial, product, rating, comment, location, status, created_at
     FROM gg_admin_reviews ORDER BY created_at DESC`
  );
  const items = (rows ?? []).map((r) => ({
    id: String(r.id),
    author: r.author,
    initial: r.initial,
    product: r.product,
    rating: r.rating,
    comment: r.comment,
    location: r.location,
    status: r.status,
    createdAt: r.created_at,
  }));
  return NextResponse.json({ persisted: true, items });
}

/** POST /api/admin/reviews — create a review. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminReviewSchema.safeParse(body);
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
    const initial = d.initial || initialFor(d.author);

    const rows = await query(
      `INSERT INTO gg_admin_reviews
        (author, initial, product, rating, comment, location, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id`,
      [d.author, initial, d.product, d.rating, d.comment, d.location, d.status]
    );

    const id = rows?.[0]?.id;
    return NextResponse.json({ persisted: true, id });
  } catch (error) {
    console.error("POST /api/admin/reviews failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not persist review" },
      { status: 500 }
    );
  }
}

/** PATCH /api/admin/reviews?id=...&status=Approved|Pending|Hidden — approve or deny a review. */
export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  if (!id || !["Approved", "Pending", "Hidden"].includes(status ?? "")) {
    return NextResponse.json(
      { updated: false, error: "id and a valid status are required" },
      { status: 400 }
    );
  }
  if (isDbConfigured()) {
    await query(`UPDATE gg_admin_reviews SET status = $1 WHERE id = $2`, [
      status,
      Number(id),
    ]);
  }
  return NextResponse.json({ updated: true });
}

/** DELETE /api/admin/reviews?id=... — delete a review. */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { deleted: false, error: "ID is required" },
      { status: 400 }
    );
  }
  if (isDbConfigured()) {
    await query(`DELETE FROM gg_admin_reviews WHERE id = $1`, [Number(id)]);
  }
  return NextResponse.json({ deleted: true });
}
