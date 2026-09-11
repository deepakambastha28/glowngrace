import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query, isDbConfigured } from "@/lib/db";
import { adminLoginSchema } from "@/lib/schemas";

const ADMIN_EMAIL = "admin@glowngrace.in";
const ADMIN_PASSWORD = "admin123";
const SESSION_COOKIE = "glow-grace-admin";

/** POST /api/admin/login — verifies creds and issues a session cookie. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { authed: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    if (
      email.toLowerCase() !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { authed: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = randomUUID();

    if (isDbConfigured()) {
      await query(
        `INSERT INTO gg_admin_sessions (token, email) VALUES ($1, $2)
         ON CONFLICT (token) DO NOTHING`,
        [token, ADMIN_EMAIL]
      );
    }

    const response = NextResponse.json({ authed: true, email: ADMIN_EMAIL });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    return response;
  } catch (error) {
    console.error("POST /api/admin/login failed", error);
    return NextResponse.json(
      { authed: false, error: "Could not sign in." },
      { status: 500 }
    );
  }
}
