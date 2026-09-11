import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";

/** GET /api/recruiters?email=... — fetch a recruiter profile by email. */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { persisted: false, recruiter: null, error: "Email is required" },
      { status: 400 }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, recruiter: null });
  }

  const rows = await query(
    `SELECT id, user_email, full_name, phone, email, company, designation,
       city, bio, status, created_at, updated_at
     FROM gg_recruiters WHERE user_email = $1 LIMIT 1`,
    [email]
  );

  if (!rows || rows.length === 0) {
    return NextResponse.json({ persisted: true, recruiter: null });
  }

  const r = rows[0];
  const recruiter = {
    id: String(r.id),
    userEmail: r.user_email,
    fullName: r.full_name,
    phone: r.phone,
    email: r.email,
    company: r.company,
    designation: r.designation,
    city: r.city,
    bio: r.bio,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };

  return NextResponse.json({ persisted: true, recruiter });
}

/** POST /api/recruiters — upsert a recruiter profile. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userEmail,
      fullName,
      phone,
      email,
      company,
      designation,
      city,
      bio,
    } = body;

    if (!userEmail || !fullName || !phone || !email || !company || !city) {
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
      `SELECT id FROM gg_recruiters WHERE user_email = $1 LIMIT 1`,
      [userEmail]
    );

    if (existing && existing.length > 0) {
      const id = existing[0].id;
      await query(
        `UPDATE gg_recruiters
         SET full_name=$1, phone=$2, email=$3, company=$4, designation=$5,
             city=$6, bio=$7, updated_at=now()
         WHERE id=$8`,
        [
          fullName, phone, email, company || "", designation || "",
          city, bio || "", id,
        ]
      );
      return NextResponse.json({ persisted: true, id: Number(id) });
    }

    const rows = await query(
      `INSERT INTO gg_recruiters
        (user_email, full_name, phone, email, company, designation, city, bio)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id`,
      [
        userEmail, fullName, phone, email, company || "",
        designation || "", city, bio || "",
      ]
    );

    const id = rows?.[0]?.id;
    return NextResponse.json({ persisted: true, id });
  } catch (error) {
    console.error("POST /api/recruiters failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not save profile" },
      { status: 500 }
    );
  }
}