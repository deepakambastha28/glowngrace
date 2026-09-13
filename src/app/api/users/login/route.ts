import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { userLoginSchema } from "@/lib/schemas";
import { verifyPassword } from "@/lib/users";

/** POST /api/users/login — authorise storefront logins against gg_users. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = userLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ found: false }, { status: 400 });
    }

    if (!isDbConfigured()) {
      return NextResponse.json({ found: false });
    }

    const { email, password } = parsed.data;
    const rows = await query(
      `SELECT id, name, email, role, status, password_hash
       FROM gg_users WHERE email = $1 LIMIT 1`,
      [email.toLowerCase()]
    );
    const row = rows?.[0];
    if (!row) {
      return NextResponse.json({ found: false });
    }

    const user = {
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      role: String(row.role),
      status: String(row.status),
    };

    if (String(row.status) === "suspended") {
      return NextResponse.json({ found: true, suspended: true, user });
    }

    const valid = verifyPassword(password, String(row.password_hash));
    return NextResponse.json({ found: true, suspended: false, valid, user });
  } catch (error) {
    console.error("POST /api/users/login failed", error);
    return NextResponse.json({ found: false }, { status: 500 });
  }
}