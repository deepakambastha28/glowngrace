import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { newsletterPayloadSchema } from "@/lib/schemas";

/** POST /api/newsletter — subscribes an email address. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = newsletterPayloadSchema.safeParse(body);

    if (!parsed.success || !parsed.data.email) {
      return NextResponse.json(
        { subscribed: false, error: "Invalid email" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({
        subscribed: false,
        message: "Database not configured — subscription acknowledged.",
      });
    }

    try {
      await query(
        `INSERT INTO gg_newsletter_subscribers (email) VALUES ($1)`,
        [parsed.data.email.toLowerCase()]
      );
    } catch {
      // Unique violation — already subscribed. Treat as success.
    }

    return NextResponse.json({ subscribed: true });
  } catch {
    return NextResponse.json(
      { subscribed: false, error: "Could not subscribe" },
      { status: 500 }
    );
  }
}