import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";

/** GET /api/candidates?email=... — fetch a candidate profile by email. */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { persisted: false, candidate: null, error: "Email is required" },
      { status: 400 }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, candidate: null });
  }

  const rows = await query(
    `SELECT id, user_email, full_name, phone, email, city, experience,
       specialization, qualification, bio, skills, gallery, resume_name,
       status, created_at, updated_at
     FROM gg_candidates WHERE user_email = $1 LIMIT 1`,
    [email]
  );

  if (!rows || rows.length === 0) {
    return NextResponse.json({ persisted: true, candidate: null });
  }

  const r = rows[0];
  const candidate = {
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

  return NextResponse.json({ persisted: true, candidate });
}

/** POST /api/candidates — upsert a candidate profile. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userEmail,
      fullName,
      phone,
      email,
      city,
      experience,
      specialization,
      qualification,
      bio,
      skills,
      gallery,
      resumeName,
    } = body;

    if (!userEmail || !fullName || !phone || !email || !city) {
      return NextResponse.json(
        { persisted: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({
        persisted: false,
        message: "Database not configured — profile acknowledged without persistence.",
      });
    }

    const existing = await query(
      `SELECT id FROM gg_candidates WHERE user_email = $1 LIMIT 1`,
      [userEmail]
    );

    if (existing && existing.length > 0) {
      const id = existing[0].id;
      await query(
        `UPDATE gg_candidates
         SET full_name=$1, phone=$2, email=$3, city=$4, experience=$5,
             specialization=$6, qualification=$7, bio=$8, skills=$9::jsonb,
             gallery=$10::jsonb, resume_name=$11, updated_at=now()
         WHERE id=$12`,
        [
          fullName, phone, email, city, experience || "",
          specialization || "", qualification || "", bio || "",
          JSON.stringify(skills || []), JSON.stringify(gallery || []),
          resumeName || null, id,
        ]
      );
      return NextResponse.json({ persisted: true, id: Number(id) });
    }

    const rows = await query(
      `INSERT INTO gg_candidates
        (user_email, full_name, phone, email, city, experience,
         specialization, qualification, bio, skills, gallery, resume_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12)
       RETURNING id`,
      [
        userEmail, fullName, phone, email, city, experience || "",
        specialization || "", qualification || "", bio || "",
        JSON.stringify(skills || []), JSON.stringify(gallery || []),
        resumeName || null,
      ]
    );

    const id = rows?.[0]?.id;
    return NextResponse.json({ persisted: true, id });
  } catch (error) {
    console.error("POST /api/candidates failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not save profile" },
      { status: 500 }
    );
  }
}

/** DELETE /api/candidates?id=... — delete a candidate profile. */
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
