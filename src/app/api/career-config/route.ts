import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getCareerConfig } from "@/lib/career-config-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** GET /api/career-config — the career page configuration used by the storefront. */
export async function GET() {
  noStore();
  const config = await getCareerConfig();
  return NextResponse.json({ config });
}