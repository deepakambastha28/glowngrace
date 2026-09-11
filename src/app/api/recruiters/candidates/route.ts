import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { query, isDbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

/** GET /api/recruiters/candidates — list active candidate profiles for recruiters. */
export async function GET(request: NextRequest) {
  noStore();
  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, items: [] });
  }

  const rows = await query(
    `SELECT id, user_email, full_name, phone, email, city, experience,
       specialization, qualification, bio, skills, gallery, resume_name,
       status, created_at, updated_at
     FROM gg_candidates WHERE status <> 'Hidden' ORDER BY created_at DESC`
  );
  const items = (rows ?? []).map(toCandidate);
  return NextResponse.json({ persisted: true, items });
}