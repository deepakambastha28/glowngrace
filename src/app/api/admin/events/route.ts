import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { adminEventSchema, adminEventPatchSchema } from "@/lib/schemas";

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
    title: r.title,
    category: r.category,
    emoji: r.emoji,
    gradient: r.gradient,
    date: r.date,
    time: r.time,
    loc: r.loc,
    venue: r.venue,
    price: r.price,
    capacity: r.capacity,
    spotsLeft: r.spots_left,
    description: r.description,
    agenda: r.agenda,
    tags: r.tags,
    hidden: Boolean(r.hidden),
    createdAt: r.created_at,
  };
}

/** GET /api/admin/events — list admin-created events, or a single event when ?id=... */
export async function GET(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, items: [] });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const rows = await query(
      `SELECT id, slug, title, category, emoji, gradient, date, time, loc, venue,
              price, capacity, spots_left, description, agenda, tags, hidden, created_at
       FROM gg_admin_events WHERE id = $1 LIMIT 1`,
      [Number(id)]
    );
    const item = rows?.length ? toItem(rows[0]) : null;
    return NextResponse.json({ persisted: true, item });
  }

  const rows = await query(
    `SELECT id, slug, title, category, emoji, gradient, date, time, loc, venue,
            price, capacity, spots_left, description, agenda, tags, hidden, created_at
     FROM gg_admin_events ORDER BY created_at DESC`
  );
  const items = (rows ?? []).map(toItem);
  return NextResponse.json({ persisted: true, items });
}

/** POST /api/admin/events — create an event. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { persisted: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({
        persisted: false,
        message: "Database not configured — event acknowledged without persistence.",
      });
    }

    const d = parsed.data;
    const slug = slugify(d.title) + "-" + Date.now().toString(36);

    const rows = await query(
      `INSERT INTO gg_admin_events
        (slug, title, category, emoji, gradient, date, time, loc, venue,
         price, capacity, spots_left, description, agenda, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15::jsonb)
       RETURNING id`,
      [
        slug,
        d.title,
        d.category,
        d.emoji,
        d.gradient,
        d.date,
        d.time,
        d.loc,
        d.venue,
        d.price,
        d.capacity,
        d.spotsLeft,
        d.description,
        JSON.stringify(d.agenda),
        JSON.stringify(d.tags),
      ]
    );

    const id = rows?.[0]?.id;
    return NextResponse.json({ persisted: true, id });
  } catch (error) {
    console.error("POST /api/admin/events failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not persist event" },
      { status: 500 }
    );
  }
}

/** PATCH /api/admin/events?id=... — edit an event, or toggle visibility with { hidden }. */
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
    const parsed = adminEventPatchSchema.safeParse(body);
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
    const onlyHidden = keys.length === 1 && keys[0] === "hidden";

    if (!isDbConfigured()) {
      return NextResponse.json({ persisted: false });
    }

    const sql = onlyHidden
      ? `UPDATE gg_admin_events SET hidden=$1 WHERE id=$2`
      : `UPDATE gg_admin_events
           SET title=$1, category=$2, emoji=$3, gradient=$4, date=$5, time=$6,
               loc=$7, venue=$8, price=$9, capacity=$10, spots_left=$11,
               description=$12, agenda=$13::jsonb, tags=$14::jsonb
         WHERE id=$15`;
    const params = onlyHidden
      ? [d.hidden, Number(id)]
      : [
          d.title,
          d.category,
          d.emoji,
          d.gradient,
          d.date,
          d.time,
          d.loc,
          d.venue,
          d.price,
          d.capacity,
          d.spotsLeft,
          d.description,
          JSON.stringify(d.agenda),
          JSON.stringify(d.tags),
          Number(id),
        ];

    await query(sql, params);

    return NextResponse.json({ persisted: true });
  } catch (error) {
    console.error("PATCH /api/admin/events failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not update event" },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/events?id=... — delete an admin-created event. */
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

  await query(`DELETE FROM gg_admin_events WHERE id = $1`, [Number(id)]);
  return NextResponse.json({ deleted: true });
}
