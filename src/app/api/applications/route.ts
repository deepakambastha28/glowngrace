import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { applicationPayloadSchema } from "@/lib/schemas";

/** GET /api/applications?email=... — fetch applications by email (last 30 days). */
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
    `SELECT id, job_id, job_slug, job_title, full_name, phone, email, city,
       experience, specialization, qualification, cover_note, resume_name, created_at
     FROM gg_job_applications
     WHERE email = $1 AND created_at >= now() - interval '30 days'
     ORDER BY created_at DESC`,
    [email]
  );

  const items = (rows ?? []).map((r) => ({
    id: String(r.id),
    jobId: r.job_id,
    jobSlug: r.job_slug,
    jobTitle: r.job_title,
    fullName: r.full_name,
    phone: r.phone,
    email: r.email,
    city: r.city,
    experience: r.experience,
    specialization: r.specialization,
    qualification: r.qualification,
    coverNote: r.cover_note,
    resumeName: r.resume_name,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ persisted: true, items });
}

/** POST /api/applications — persists a job application. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = applicationPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { applied: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (!isDbConfigured()) {
      return NextResponse.json({
        applied: false,
        message: "Database not configured — application acknowledged.",
      });
    }

    await query(
      `INSERT INTO gg_job_applications
        (job_id, job_slug, job_title, full_name, phone, email, city,
         experience, specialization, qualification, cover_note, resume_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        data.jobId,
        data.jobSlug,
        data.jobTitle,
        data.name,
        data.phone,
        data.email,
        data.city,
        data.experience,
        data.specialization,
        data.qualification,
        data.coverNote,
        data.resumeName ?? null,
      ]
    );

    return NextResponse.json({ applied: true });
  } catch (error) {
    console.error("POST /api/applications failed", error);
    return NextResponse.json(
      { applied: false, error: "Could not persist application" },
      { status: 500 }
    );
  }
}
