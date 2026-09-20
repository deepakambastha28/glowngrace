import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured, isLocalMode } from "@/lib/db";
import { isNeonSourceAvailable, syncFromNeon } from "@/lib/sync";

const SESSION_COOKIE = "glow-grace-admin";

async function isAuthed(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  if (!isDbConfigured()) return true;
  const rows = await query(
    `SELECT 1 FROM gg_admin_sessions
     WHERE token = $1 AND created_at > now() - interval '15 minutes'`,
    [token]
  );
  return rows !== null && rows.length === 1;
}

/**
 * GET /api/admin/sync — preflight. Tells the admin UI whether the "Sync from
 * Neon" button belongs on the dashboard (only in local mode) and whether the
 * Neon source is configured.
 */
export async function GET() {
  const sourceConfigured = Boolean(process.env.DATABASE_URL);
  return NextResponse.json({
    local: isLocalMode(),
    sourceConfigured,
    sourceAvailable:
      isLocalMode() && sourceConfigured ? await isNeonSourceAvailable() : false,
  });
}

/**
 * POST /api/admin/sync — pull the Neon database down into the local Docker
 * database. This is the ONLY Neon access the app performs in local mode, and
 * it is always manual. Neon is read-only here; local data is replaced inside
 * a single transaction.
 */
export async function POST(request: NextRequest) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isLocalMode()) {
    return NextResponse.json(
      { error: "Sync is only available in local mode (USE_LOCAL_DB=true)." },
      { status: 400 }
    );
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL (the Neon source) is not set." },
      { status: 400 }
    );
  }

  try {
    const result = await syncFromNeon();
    return NextResponse.json({ synced: true, ...result });
  } catch (error) {
    console.error("POST /api/admin/sync failed", error);
    return NextResponse.json(
      { synced: false, error: "Neon → local sync failed. The local database was left unchanged." },
      { status: 500 }
    );
  }
}