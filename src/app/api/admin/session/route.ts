import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";

const SESSION_COOKIE = "glow-grace-admin";
const ADMIN_EMAIL = "admin@glowngrace.in";

/** GET /api/admin/session — returns whether a valid admin session exists. */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ authed: false });
  }

  let valid = true;
  if (isDbConfigured()) {
    const rows = await query(
      `SELECT 1 FROM gg_admin_sessions WHERE token = $1`,
      [token]
    );
    valid = rows !== null && rows.length === 1;
  }

  return NextResponse.json({ authed: valid, email: valid ? ADMIN_EMAIL : undefined });
}
