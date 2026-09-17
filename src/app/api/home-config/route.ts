import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getHomeConfig } from "@/lib/home-config-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** GET /api/home-config — the home page configuration used by the storefront. */
export async function GET() {
  noStore();
  const config = await getHomeConfig();
  return NextResponse.json({ config });
}
