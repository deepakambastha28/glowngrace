import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";

const SESSION_COOKIE = "glow-grace-admin";

/** POST /api/admin/logout — clears the admin session cookie and deletes the DB row. */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (token && isDbConfigured()) {
    await query(`DELETE FROM gg_admin_sessions WHERE token = $1`, [token]).catch(() => {});
  }

  const response = NextResponse.json({ authed: false });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}