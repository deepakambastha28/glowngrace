import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { partnerPayloadSchema } from "@/lib/schemas";

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