import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { adminJobSchema } from "@/lib/schemas";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** GET /api/admin/jobs — list admin-created jobs. */
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, items: [] });
  }
  const rows = await query(
    `SELECT id, slug, title, salon, location, type, salary_min, salary_max,
       salary_text, experience, openings, description, requirements, status, created_at
     FROM gg_admin_jobs ORDER BY created_at DESC`
  );
  const items = (rows ?? []).map((r) => ({
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
    createdAt: r.created_at,
  }));
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
