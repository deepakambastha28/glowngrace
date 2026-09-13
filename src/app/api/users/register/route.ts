import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { userRegisterSchema } from "@/lib/schemas";
import { hashPassword } from "@/lib/users";

/** POST /api/users/register — create a storefront account in gg_users. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = userRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { registered: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const d = parsed.data;

    if (!isDbConfigured()) {
      return NextResponse.json({ registered: false, persisted: false });
    }

    const existing = await query(
      `SELECT id FROM gg_users WHERE email = $1 LIMIT 1`,
      [d.email.toLowerCase()]
    );
    if (existing?.length) {
      return NextResponse.json(
        { registered: false, persisted: true, error: "exists" },
        { status: 409 }
      );
    }

    const result = await query(
      `INSERT INTO gg_users (name, email, phone, role, status, password_hash, updated_at)
       VALUES ($1, $2, $3, $4, 'active', $5, now())
       RETURNING id`,
      [d.name, d.email.toLowerCase(), d.phone, d.role, hashPassword(d.password)]
    );

    return NextResponse.json({
      registered: true,
      persisted: true,
      id: result?.[0]?.id ?? null,
    });
  } catch (error) {
    console.error("POST /api/users/register failed", error);
    return NextResponse.json(
      { registered: false, error: "Could not register account" },
      { status: 500 }
    );
  }
}