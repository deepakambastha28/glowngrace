import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { adminUserCreateSchema, adminUserPatchSchema } from "@/lib/schemas";
import { hashPassword, isProtectedAccount, toUserItem } from "@/lib/users";

async function ensureAdminSeed() {
  if (!isDbConfigured()) return;
  await query(
    `INSERT INTO gg_users (name, email, phone, role, status, password_hash, updated_at)
     VALUES ('Deepak (Admin)', 'admin@glowngrace.in', '', 'admin', 'active', $1, now())
     ON CONFLICT (email) DO NOTHING`,
    [hashPassword("admin123")]
  );
}

/** GET /api/admin/users — list user accounts, optionally filtered by role/status/search. */
export async function GET(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, items: [] });
  }
  await ensureAdminSeed();

  const role = request.nextUrl.searchParams.get("role");
  const status = request.nextUrl.searchParams.get("status");
  const q = request.nextUrl.searchParams.get("q")?.trim();

  const clauses: string[] = [];
  const params: unknown[] = [];
  if (role && role !== "all") {
    params.push(role);
    clauses.push(`role = $${params.length}`);
  }
  if (status && status !== "all") {
    params.push(status);
    clauses.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    clauses.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const rows = await query(
    `SELECT id, name, email, phone, role, status, created_at, updated_at
     FROM gg_users ${where} ORDER BY created_at DESC`
  );
  const items = (rows ?? []).map(toUserItem);
  return NextResponse.json({ persisted: true, items });
}

/** POST /api/admin/users — create a new account of any manageable role. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminUserCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { persisted: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({ persisted: false });
    }

    const d = parsed.data;
    const existing = await query(
      `SELECT id FROM gg_users WHERE email = $1 LIMIT 1`,
      [d.email.toLowerCase()]
    );
    if (existing?.length) {
      return NextResponse.json(
        { persisted: false, error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    const result = await query(
      `INSERT INTO gg_users (name, email, phone, role, status, password_hash, updated_at)
       VALUES ($1, $2, $3, $4, 'active', $5, now())
       RETURNING id`,
      [d.name, d.email.toLowerCase(), d.phone, d.role, hashPassword(d.password)]
    );

    return NextResponse.json(
      { persisted: true, id: result?.[0]?.id ?? null },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/users failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not create user" },
      { status: 500 }
    );
  }
}

/** PATCH /api/admin/users?id=... — activate/suspend, change role, or reset a password. */
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
    const parsed = adminUserPatchSchema.safeParse(body);
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

    const rows = await query(
      `SELECT id, email, role FROM gg_users WHERE id = $1 LIMIT 1`,
      [Number(id)]
    );
    const row = rows?.[0];
    if (!row) {
      return NextResponse.json(
        { persisted: false, error: "User not found" },
        { status: 404 }
      );
    }
    if (isProtectedAccount(row.email, row.role)) {
      return NextResponse.json(
        { persisted: false, error: "This account is protected." },
        { status: 403 }
      );
    }

    const set: string[] = [];
    const params: unknown[] = [];
    const push = (col: string, value: unknown) => {
      params.push(value);
      set.push(`${col}=$${params.length}`);
    };

    if (d.name !== undefined) push("name", d.name);
    if (d.phone !== undefined) push("phone", d.phone);
    if (d.role !== undefined) push("role", d.role);
    if (d.status !== undefined) push("status", d.status);
    if (d.password !== undefined) push("password_hash", hashPassword(d.password));

    if (set.length === 0) {
      return NextResponse.json(
        { persisted: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    set.push("updated_at=now()");
    params.push(Number(id));
    await query(
      `UPDATE gg_users SET ${set.join(", ")} WHERE id=$${params.length}`,
      params
    );

    return NextResponse.json({ persisted: true });
  } catch (error) {
    console.error("PATCH /api/admin/users failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not update user" },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/users?id=... — delete a user account. */
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

  const rows = await query(
    `SELECT id, email, role FROM gg_users WHERE id = $1 LIMIT 1`,
    [Number(id)]
  );
  const row = rows?.[0];
  if (row && isProtectedAccount(row.email, row.role)) {
    return NextResponse.json(
      { deleted: false, error: "This account is protected." },
      { status: 403 }
    );
  }

  await query(`DELETE FROM gg_users WHERE id = $1`, [Number(id)]);
  return NextResponse.json({ deleted: true });
}