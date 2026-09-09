import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";

/** GET /api/admin/candidates — list all candidates. */
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, items: [] });
  }
  const rows = await query(
    `SELECT id, user_email, full_name, phone, email, city, experience,
       specialization, qualification, bio, skills, gallery, resume_name,
       status, created_at, updated_at
     FROM gg_candidates ORDER BY created_at DESC`
  );
  const items = (rows ?? []).map((r) => ({
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
  }));
  return NextResponse.json({ persisted: true, items });
}

/** DELETE /api/admin/candidates?id=... — delete a candidate. */
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

  await query(`DELETE FROM gg_candidates WHERE id = $1`, [Number(id)]);
  return NextResponse.json({ deleted: true });
}
