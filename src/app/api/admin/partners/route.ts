import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { adminPartnerSchema, adminPartnerPatchSchema } from "@/lib/schemas";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function toItem(r: Record<string, unknown>) {
  return {
    id: String(r.id),
    slug: r.slug,
    name: r.name,
    type: r.type,
    loc: r.loc,
    emoji: r.emoji,
    gradient: r.gradient,
    rating: Number(r.rating),
    reviews: Number(r.reviews),
    estd: Number(r.estd),
    staff: Number(r.staff),
    services: Number(r.services),
    description: r.description,
    tags: r.tags,
    status: r.status,
    createdAt: r.created_at,
  };
}

/** GET /api/admin/partners — list admin-created partners (newest first), or a single partner when ?id=... */
export async function GET(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, items: [] });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const rows = await query(
      `SELECT id, slug, name, type, loc, emoji, gradient, rating,
              reviews, estd, staff, services, description, tags, status, created_at
       FROM gg_admin_partners WHERE id = $1 LIMIT 1`,
      [Number(id)]
    );
    const item = rows?.length ? toItem(rows[0]) : null;
    return NextResponse.json({ persisted: true, item });
  }

  const rows = await query(
    `SELECT id, slug, name, type, loc, emoji, gradient, rating,
            reviews, estd, staff, services, description, tags, status, created_at
     FROM gg_admin_partners ORDER BY created_at DESC`
  );
  const items = (rows ?? []).map(toItem);
  return NextResponse.json({ persisted: true, items });
}

/** POST /api/admin/partners — create a partner. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminPartnerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { persisted: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({
        persisted: false,
        message: "Database not configured — partner acknowledged without persistence.",
      });
    }

    const d = parsed.data;
    const slug = slugify(d.name || "partner") + "-" + Date.now().toString(36);

    const rows = await query(
      `INSERT INTO gg_admin_partners
        (slug, name, type, loc, emoji, gradient, rating, reviews,
         estd, staff, services, description, tags, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14)
       RETURNING id`,
      [
        slug,
        d.name,
        d.type,
        d.loc,
        d.emoji,
        d.gradient,
        d.rating,
        d.reviews,
        d.estd,
        d.staff,
        d.services,
        d.description,
        JSON.stringify(d.tags),
        d.status,
      ]
    );

    const id = rows?.[0]?.id;
    return NextResponse.json({ persisted: true, id, slug });
  } catch (error) {
    console.error("POST /api/admin/partners failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not persist partner" },
      { status: 500 }
    );
  }
}

/** PATCH /api/admin/partners?id=... — edit a partner, or update status. */
export async function PATCH(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { persisted: false, error: "ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const parsed = adminPartnerPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { persisted: false, error: "Invalid payload" },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const keys = Object.keys(body);
    if (keys.length === 0) {
      return NextResponse.json(
        { persisted: false, error: "No fields to update" },
        { status: 400 }
      );
    }
    const onlyStatus = keys.length === 1 && keys[0] === "status";

    if (!isDbConfigured()) {
      return NextResponse.json({ persisted: false });
    }

    const sql = onlyStatus
      ? `UPDATE gg_admin_partners SET status=$1 WHERE id=$2`
      : `UPDATE gg_admin_partners
           SET name=$1, type=$2, loc=$3, emoji=$4, gradient=$5, rating=$6,
               reviews=$7, estd=$8, staff=$9, services=$10, description=$11,
               tags=$12::jsonb, status=$13
         WHERE id=$14`;
    const params = onlyStatus
      ? [d.status, Number(id)]
      : [
          d.name,
          d.type,
          d.loc,
          d.emoji,
          d.gradient,
          d.rating,
          d.reviews,
          d.estd,
          d.staff,
          d.services,
          d.description,
          JSON.stringify(d.tags),
          d.status ?? "Active",
          Number(id),
        ];

    await query(sql, params);

    return NextResponse.json({ persisted: true });
  } catch (error) {
    console.error("PATCH /api/admin/partners failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not update partner" },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/partners?id=... — delete an admin-created partner. */
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { deleted: false, error: "ID is required" },
      { status: 400 }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ deleted: false });
  }

  await query(`DELETE FROM gg_admin_partners WHERE id = $1`, [Number(id)]);
  return NextResponse.json({ deleted: true });
}