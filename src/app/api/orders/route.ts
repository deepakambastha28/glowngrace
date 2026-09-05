import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { orderPayloadSchema } from "@/lib/schemas";

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