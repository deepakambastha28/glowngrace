import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { partnerConfigSchema } from "@/lib/schemas";
import { getPartnerConfig } from "@/lib/partner-config-server";

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

/** GET /api/admin/partner-config — current partners page configuration. */
export async function GET(request: NextRequest) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = await getPartnerConfig();
  return NextResponse.json({ persisted: isDbConfigured(), config });
}

/** PUT /api/admin/partner-config — save the partners page configuration. */
export async function PUT(request: NextRequest) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = partnerConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { persisted: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({
        persisted: false,
        message: "Database not configured — configuration not persisted.",
      });
    }

    await query(
      `INSERT INTO gg_admin_partner_config (id, config, updated_at)
       VALUES (1, $1::jsonb, now())
       ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config, updated_at = now()`,
      [JSON.stringify(parsed.data)]
    );

    return NextResponse.json({ persisted: true });
  } catch (error) {
    console.error("PUT /api/admin/partner-config failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not save configuration" },
      { status: 500 }
    );
  }
}