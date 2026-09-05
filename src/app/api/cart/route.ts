import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";

/** GET /api/cart — reads the persisted snapshot for a device id. */
export async function GET(request: Request) {
  const deviceId = request.headers.get("x-device-id");
  if (!deviceId) {
    return NextResponse.json({ items: [], wishlist: [] });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ items: [], wishlist: [] });
  }

  try {
    const rows = await query(
      `SELECT items, wishlist FROM gg_cart_snapshots WHERE device_id = $1`,
      [deviceId]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ items: [], wishlist: [] });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET /api/cart failed", error);
    return NextResponse.json({ items: [], wishlist: [] }, { status: 500 });
  }
}

/** PUT /api/cart — upserts the cart/wishlist snapshot for a device id. */
export async function PUT(request: Request) {
  const deviceId = request.headers.get("x-device-id");
  if (!deviceId) {
    return NextResponse.json({ synced: false }, { status: 400 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({
      synced: false,
      message: "Database not configured — snapshot acknowledged.",
    });
  }

  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? JSON.stringify(body.items) : "[]";
    const wishlist = Array.isArray(body.wishlist)
      ? JSON.stringify(body.wishlist)
      : "[]";

    await query(
      `INSERT INTO gg_cart_snapshots (device_id, items, wishlist)
       VALUES ($1, $2::jsonb, $3::jsonb)
       ON CONFLICT (device_id)
       DO UPDATE SET items = EXCLUDED.items, wishlist = EXCLUDED.wishlist, updated_at = now()`,
      [deviceId, items, wishlist]
    );

    return NextResponse.json({ synced: true });
  } catch (error) {
    console.error("PUT /api/cart failed", error);
    return NextResponse.json({ synced: false }, { status: 500 });
  }
}