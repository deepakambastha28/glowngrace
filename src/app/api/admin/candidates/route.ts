import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { adminCandidatePatchSchema } from "@/lib/schemas";

function toItem(r: Record<string, unknown>) {
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

/** GET /api/admin/candidates — list all candidates, or a single candidate when ?id=... */
export async function GET(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, items: [] });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const rows = await query(
      `SELECT id, user_email, full_name, phone, email, city, experience,
         specialization, qualification, bio, skills, gallery, resume_name,
         status, created_at, updated_at
       FROM gg_candidates WHERE id = $1 LIMIT 1`,
      [Number(id)]
    );
    const item = rows?.length ? toItem(rows[0]) : null;
    return NextResponse.json({ persisted: true, item });
  }

  const rows = await query(
    `SELECT id, user_email, full_name, phone, email, city, experience,
       specialization, qualification, bio, skills, gallery, resume_name,
       status, created_at, updated_at
     FROM gg_candidates ORDER BY created_at DESC`
  );
  const items = (rows ?? []).map(toItem);
  return NextResponse.json({ persisted: true, items });
}

/** PATCH /api/admin/candidates?id=... — edit a candidate profile or status. */
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
    const parsed = adminCandidatePatchSchema.safeParse(body);
    if (!parsed.success || Object.keys(body).length === 0) {
      return NextResponse.json(
        { persisted: false, error: "Invalid payload" },
        { status: 400 }
      );
    }
    const d = parsed.data;

    if (!isDbConfigured()) {
      return NextResponse.json({ persisted: false });
    }

    const set: string[] = [];
    const params: unknown[] = [];
    const push = (col: string, value: unknown) => {
      params.push(value);
      set.push(`${col}=$${params.length}`);
    };

    if (d.fullName !== undefined) push("full_name", d.fullName);
    if (d.phone !== undefined) push("phone", d.phone);
    if (d.email !== undefined) push("email", d.email);
    if (d.city !== undefined) push("city", d.city);
    if (d.experience !== undefined) push("experience", d.experience);
    if (d.specialization !== undefined) push("specialization", d.specialization);
    if (d.qualification !== undefined) push("qualification", d.qualification);
    if (d.bio !== undefined) push("bio", d.bio);
    if (d.skills !== undefined) push("skills", JSON.stringify(d.skills));
    if (d.resumeName !== undefined) push("resume_name", d.resumeName);
    if (d.status !== undefined) push("status", d.status);

    if (set.length === 0) {
      return NextResponse.json(
        { persisted: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    set.push("updated_at=now()");
    params.push(Number(id));
    await query(
      `UPDATE gg_candidates SET ${set.join(", ")} WHERE id=$${params.length}`,
      params
    );

    return NextResponse.json({ persisted: true });
  } catch (error) {
    console.error("PATCH /api/admin/candidates failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not update candidate" },
      { status: 500 }
    );
  }
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