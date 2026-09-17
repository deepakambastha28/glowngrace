import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getShopConfig } from "@/lib/shop-config-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** GET /api/shop-config — the shop page configuration used by the storefront. */
export async function GET() {
  noStore();
  const config = await getShopConfig();
  return NextResponse.json({ config });
}