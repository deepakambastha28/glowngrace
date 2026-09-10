import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { query, isDbConfigured } from "@/lib/db";
import { partnerPayloadSchema } from "@/lib/schemas";
import type { Partner } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toStorefrontPartner(row: Record<string, unknown>): Partner {
  const tags = Array.isArray(row.tags) ? (row.tags as string[]) : [];
  return {
    id: `admin-${String(row.id)}`,
    slug: String(row.slug),
    name: String(row.name),
    type: String(row.type ?? "Beauty Parlour"),
    loc: String(row.loc ?? ""),
    emoji: String(row.emoji ?? "💄"),
    gradient: String(row.gradient ?? ""),
    rating: Number(row.rating ?? 4.5),
    reviews: Number(row.reviews ?? 0),
    estd: Number(row.estd ?? 2024),
    staff: Number(row.staff ?? 1),
    services: Number(row.services ?? 1),
    description: String(row.description ?? ""),
    tags,
    gallery: [],
    menu: [],
  };
}

/** GET /api/partners — storefront partner directory: admin-created partners only. */
export async function GET() {
  noStore();
  let items: Partner[] = [];
  if (isDbConfigured()) {
    const rows = await query(
      `SELECT id, slug, name, type, loc, emoji, gradient, rating,
              reviews, estd, staff, services, description, tags
       FROM gg_admin_partners WHERE status = 'Active' ORDER BY created_at DESC`
    );
    items = (rows ?? []).map(toStorefrontPartner);
  }

  return NextResponse.json({ items });
}

/** POST /api/partners — registers a partner salon. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = partnerPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { registered: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (!isDbConfigured()) {
      return NextResponse.json({
        registered: false,
        message: "Database not configured — partner request acknowledged.",
      });
    }

    await query(
      `INSERT INTO gg_partners
        (owner_name, salon_name, email, phone, city, services, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        data.ownerName,
        data.salonName,
        data.email.toLowerCase(),
        data.phone,
        data.city,
        data.services,
        data.message,
      ]
    );

    return NextResponse.json({ registered: true });
  } catch (error) {
    console.error("POST /api/partners failed", error);
    return NextResponse.json(
      { registered: false, error: "Could not persist partner request" },
      { status: 500 }
    );
  }
}