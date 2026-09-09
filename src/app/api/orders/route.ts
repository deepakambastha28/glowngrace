import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { orderPayloadSchema } from "@/lib/schemas";

/** GET /api/orders?email= — fetch orders for a given email (last 30 days). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { persisted: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({ persisted: false, orders: [] });
    }

    const rows = await query(
      `SELECT order_id AS "id", customer_name AS "customerName", email, phone,
              address, items, subtotal, gst, shipping, total,
              delivery_option AS "deliveryOption", payment_method AS "paymentMethod",
              created_at AS "createdAt"
       FROM gg_orders
       WHERE LOWER(email) = LOWER($1)
         AND created_at >= NOW() - INTERVAL '30 days'
       ORDER BY created_at DESC`,
      [email]
    );

    return NextResponse.json({ persisted: true, orders: rows || [] });
  } catch (error) {
    console.error("GET /api/orders failed", error);
    return NextResponse.json(
      { persisted: false, orders: [] },
      { status: 500 }
    );
  }
}

/** POST /api/orders — persists a completed checkout order. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = orderPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { persisted: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const { orderId, customer, address, items, totals, deliveryOption, paymentMethod } =
      parsed.data;

    if (!isDbConfigured()) {
      return NextResponse.json({
        persisted: false,
        message: "Database not configured — order acknowledged without persistence.",
      });
    }

    await query(
      `INSERT INTO gg_orders
        (order_id, customer_name, email, phone, address, items,
         subtotal, gst, shipping, total, delivery_option, payment_method)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11, $12)`,
      [
        orderId,
        `${customer.firstName} ${customer.lastName}`,
        customer.email,
        customer.phone,
        JSON.stringify(address),
        JSON.stringify(items),
        totals.subtotal,
        totals.gst,
        totals.shipping,
        totals.total,
        deliveryOption,
        paymentMethod,
      ]
    );

    return NextResponse.json({ persisted: true, orderId });
  } catch (error) {
    console.error("POST /api/orders failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not persist order" },
      { status: 500 }
    );
  }
}