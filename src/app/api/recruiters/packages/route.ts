import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";

/** GET /api/recruiters/packages?email=... — list a recruiter's service packages. */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { persisted: false, items: [], error: "Email is required" },
      { status: 400 }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, items: [] });
  }

  const rows = await query(
    `SELECT id, recruiter_email, name, price, duration, description,
       services, status, created_at
     FROM gg_recruiter_packages
     WHERE recruiter_email = $1 ORDER BY created_at DESC`,
    [email]
  );

  const items = (rows ?? []).map((r) => ({
    id: String(r.id),
    recruiterEmail: r.recruiter_email,
    name: r.name,
    price: Number(r.price),
    duration: r.duration,
    description: r.description,
    services: Array.isArray(r.services) ? (r.services as string[]) : [],
    status: r.status,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ persisted: true, items });
}

/** POST /api/recruiters/packages — create packages (single or bulk via `items`). */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ persisted: false, error: "Invalid body" }, { status: 400 });
    }

    const recruiterEmail = String(body.recruiterEmail ?? "").trim();
    if (!recruiterEmail) {
      return NextResponse.json({ persisted: false, error: "Email is required" }, { status: 400 });
    }

    const items = Array.isArray(body.items) && body.items.length > 0
      ? body.items
      : [body];

    const packages = items.map((it: Record<string, unknown>) => ({
      name: String(it.name ?? "").trim(),
      price: Number(it.price ?? 0),
      duration: String(it.duration ?? "").trim(),
      description: String(it.description ?? "").trim(),
      services: Array.isArray(it.services) ? (it.services as string[]) : [],
    }));

    if (packages.length === 0 || packages.some((p: { name: string }) => !p.name)) {
      return NextResponse.json(
        { persisted: false, error: "Each package needs a name" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({
        persisted: false,
        message: "Database not configured — packages acknowledged without persistence.",
        created: packages.length,
      });
    }

    let created = 0;
    for (const p of packages) {
      const rows = await query(
        `INSERT INTO gg_recruiter_packages
          (recruiter_email, name, price, duration, description, services)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb)
         RETURNING id`,
        [
          recruiterEmail, p.name, p.price, p.duration,
          p.description, JSON.stringify(p.services),
        ]
      );
      if (rows?.[0]?.id) created += 1;
    }

    return NextResponse.json({ persisted: true, created });
  } catch (error) {
    console.error("POST /api/recruiters/packages failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not create packages" },
      { status: 500 }
    );
  }
}

/** DELETE /api/recruiters/packages?id=...&email=... — delete a recruiter package. */
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const email = request.nextUrl.searchParams.get("email");
  if (!id || !email) {
    return NextResponse.json(
      { persisted: false, deleted: false, error: "id and email are required" },
      { status: 400 }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, deleted: true });
  }

  const rows = await query(
    `DELETE FROM gg_recruiter_packages
     WHERE id = $1 AND recruiter_email = $2
     RETURNING id`,
    [Number(id), email]
  );

  return NextResponse.json({
    persisted: true,
    deleted: Boolean(rows && rows.length > 0),
  });
}