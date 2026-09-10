import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { adminJobSchema, adminJobPatchSchema } from "@/lib/schemas";

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
    salon: r.salon,
    location: r.location,
    type: r.type,
    salaryMin: r.salary_min,
    salaryMax: r.salary_max,
    salaryText: r.salary_text,
    experience: r.experience,
    openings: r.openings,
    description: r.description,
    requirements: r.requirements,
    status: r.status,
    hidden: Boolean(r.hidden),
    createdAt: r.created_at,
  };
}

/** GET /api/admin/jobs — list admin-created jobs, or a single job when ?id=... */
export async function GET(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, items: [] });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const rows = await query(
      `SELECT id, slug, title, salon, location, type, salary_min, salary_max,
         salary_text, experience, openings, description, requirements,
         status, hidden, created_at
       FROM gg_admin_jobs WHERE id = $1 LIMIT 1`,
      [Number(id)]
    );
    const item = rows?.length ? toItem(rows[0]) : null;
    return NextResponse.json({ persisted: true, item });
  }

  const rows = await query(
    `SELECT id, slug, title, salon, location, type, salary_min, salary_max,
       salary_text, experience, openings, description, requirements,
       status, hidden, created_at
     FROM gg_admin_jobs ORDER BY created_at DESC`
  );
  const items = (rows ?? []).map(toItem);
  return NextResponse.json({ persisted: true, items });
}

/** POST /api/admin/jobs — create a job. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { persisted: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({
        persisted: false,
        message: "Database not configured — job acknowledged without persistence.",
      });
    }

    const d = parsed.data;
    const slug = slugify(d.title) + "-" + Date.now().toString(36);
    const salaryMax = d.salaryMax || d.salaryMin;
    const salaryText =
      d.salaryText ||
      `₹${(d.salaryMin / 1000).toFixed(0)}k–${(salaryMax / 1000).toFixed(0)}k`;

    const rows = await query(
      `INSERT INTO gg_admin_jobs
        (slug, title, salon, location, type, salary_min, salary_max, salary_text,
         experience, openings, description, requirements, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13)
       RETURNING id`,
      [
        slug,
        d.title,
        d.salon,
        d.location,
        d.type,
        d.salaryMin,
        salaryMax,
        salaryText,
        d.experience,
        d.openings,
        d.description,
        JSON.stringify(d.requirements),
        "Open",
      ]
    );

    const id = rows?.[0]?.id;
    return NextResponse.json({ persisted: true, id });
  } catch (error) {
    console.error("POST /api/admin/jobs failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not persist job" },
      { status: 500 }
    );
  }
}

/** PATCH /api/admin/jobs?id=... — edit a job, or toggle visibility with { hidden }. */
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
    const parsed = adminJobPatchSchema.safeParse(body);
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

    const salaryMin = d.salaryMin ?? 0;
    const salaryMax = d.salaryMax || salaryMin;
    const sql = onlyHidden
      ? `UPDATE gg_admin_jobs SET hidden=$1 WHERE id=$2`
      : `UPDATE gg_admin_jobs
           SET title=$1, salon=$2, location=$3, type=$4, salary_min=$5,
               salary_max=$6, salary_text=$7, experience=$8, openings=$9,
               description=$10, requirements=$11::jsonb
         WHERE id=$12`;
    const params = onlyHidden
      ? [d.hidden, Number(id)]
      : [
          d.title,
          d.salon,
          d.location,
          d.type,
          d.salaryMin,
          salaryMax,
          d.salaryText ||
            `₹${(salaryMin / 1000).toFixed(0)}k–${(salaryMax / 1000).toFixed(0)}k`,
          d.experience,
          d.openings,
          d.description,
          JSON.stringify(d.requirements),
          Number(id),
        ];

    await query(sql, params);

    return NextResponse.json({ persisted: true });
  } catch (error) {
    console.error("PATCH /api/admin/jobs failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not update job" },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/jobs?id=... — delete an admin-created job. */
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

  await query(`DELETE FROM gg_admin_jobs WHERE id = $1`, [Number(id)]);
  return NextResponse.json({ deleted: true });
}