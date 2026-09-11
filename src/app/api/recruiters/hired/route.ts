import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";

function toCandidate(r: Record<string, unknown>) {
  return {
    id: String(r.id),
    userEmail: r.user_email,
    fullName: r.full_name,
    phone: r.phone,
    email: r.email,
    city: r.city,
    experience: r.experience,
    specialization: r.specialization,
    qualification: r.qualification,
    bio: r.bio,
    skills: r.skills,
    gallery: r.gallery,
    resumeName: r.resume_name,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** GET /api/recruiters/hired?email=... — list candidates hired by a recruiter. */
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
    `SELECT c.id, c.user_email, c.full_name, c.phone, c.email, c.city,
       c.experience, c.specialization, c.qualification, c.bio, c.skills,
       c.gallery, c.resume_name, c.status, c.created_at, c.updated_at
     FROM gg_recruiter_hires h
     JOIN gg_candidates c ON c.id = h.candidate_id
     WHERE h.recruiter_email = $1
     ORDER BY h.created_at DESC`,
    [email]
  );
  const items = (rows ?? []).map(toCandidate);
  return NextResponse.json({ persisted: true, items });
}