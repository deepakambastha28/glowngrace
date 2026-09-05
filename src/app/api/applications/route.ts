import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { applicationPayloadSchema } from "@/lib/schemas";

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