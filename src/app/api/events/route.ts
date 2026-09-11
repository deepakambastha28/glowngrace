import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { query, isDbConfigured } from "@/lib/db";
import type { EventItem } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toStorefrontEvent(row: Record<string, unknown>): EventItem {
  return {
    id: `admin-${String(row.id)}`,
    slug: String(row.slug),
    title: String(row.title),
    category: String(row.category ?? "Workshop"),
    emoji: String(row.emoji ?? "🎉"),
    gradient: String(row.gradient ?? "linear-gradient(135deg,#d6336c,#f4a6c0)"),
    date: String(row.date),
    time: String(row.time ?? "10:00 AM"),
    loc: String(row.loc ?? ""),
    venue: String(row.venue ?? ""),
    price: String(row.price ?? "Free"),
    capacity: Number(row.capacity ?? 50),
    spotsLeft: Number(row.spots_left ?? 50),
    description: String(row.description ?? ""),
    agenda: Array.isArray(row.agenda) ? (row.agenda as string[]) : [],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    gallery: [],
  };
}

/** GET /api/events — storefront events: admin-created events only. */
export async function GET() {
  noStore();
  let items: EventItem[] = [];
  if (isDbConfigured()) {
    const rows = await query(
      `SELECT id, slug, title, category, emoji, gradient, date, time, loc, venue,
              price, capacity, spots_left, description, agenda, tags
       FROM gg_admin_events WHERE hidden = false ORDER BY date ASC`
    );
    items = (rows ?? []).map(toStorefrontEvent);
  }

  return NextResponse.json({ items });
}
