import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getPartnerConfig } from "@/lib/partner-config-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** GET /api/partner-config — the partners page configuration used by the storefront. */
export async function GET() {
  noStore();
  const config = await getPartnerConfig();
  return NextResponse.json({ config });
}