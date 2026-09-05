import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";

/** GET /api/health — checks the Neon database connectivity. */
export async function GET() {
  const connected = isDbConfigured();

  let dbStatus: "connected" | "error" | "disabled" = "disabled";
  if (connected) {
    try {
      const rows = await query("SELECT 1 AS ok");
      dbStatus = rows ? "connected" : "error";
    } catch {
      dbStatus = "error";
    }
  }

  return NextResponse.json({
    status: "ok",
    database: dbStatus,
    message:
      dbStatus === "connected"
        ? "Neon Postgres connected."
        : dbStatus === "error"
          ? "DATABASE_URL is set but the query failed."
          : "DATABASE_URL not configured — running without a database.",
  });
}