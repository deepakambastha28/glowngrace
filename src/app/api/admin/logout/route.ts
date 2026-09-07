import { NextResponse } from "next/server";

const SESSION_COOKIE = "glow-grace-admin";

/** POST /api/admin/logout — clears the admin session cookie. */
export async function POST() {
  const response = NextResponse.json({ authed: false });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
