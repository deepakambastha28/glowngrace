import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getEventConfig } from "@/lib/event-config-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** GET /api/event-config — the events page configuration used by the storefront. */
export async function GET() {
  noStore();
  const config = await getEventConfig();
  return NextResponse.json({ config });
}