import { NextResponse } from "next/server";
import {
  getDb,
  isDbConfigured,
  isLocalMode,
  isNeonQuotaError,
} from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/health — checks the database connectivity and mode. */
export async function GET() {
  const connected = isDbConfigured();
  const mode: "local" | "cloud" | "none" = connected
    ? isLocalMode()
      ? "local"
      : "cloud"
    : "none";

  let dbStatus: "connected" | "error" | "disabled" | "suspended" = "disabled";
  if (connected) {
    const db = getDb();
    if (!db) {
      dbStatus = "error";
    } else {
      try {
        await db.query("SELECT 1 AS ok", []);
        dbStatus = "connected";
      } catch (error) {
        dbStatus = isNeonQuotaError(error) ? "suspended" : "error";
      }
    }
  }

  const message =
    dbStatus === "connected"
      ? mode === "local"
        ? "Local Docker Postgres connected."
        : "Neon Postgres connected."
      : dbStatus === "suspended"
        ? "Neon Postgres database is suspended (plan quota exceeded)."
        : dbStatus === "error"
          ? "Database is configured but the connection failed."
          : "No database configured — running without a database.";

  return NextResponse.json({
    status: "ok",
    database: dbStatus,
    mode,
    message,
  });
}