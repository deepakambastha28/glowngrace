import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";

/** GET /api/admin/dashboard — aggregate stats for the admin dashboard. */
export async function GET() {
  const fallback = {
    persisted: false,
    revenue: 384000,
    orders: 1248,
    customers: 5024,
    activeJobs: 32,
    recentOrders: [],
  };

  if (!isDbConfigured()) {
    return NextResponse.json(fallback);
  }

  try {
    const [revRows, orderRows, jobRows, recentRows] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders FROM gg_orders`
      ),
      query(`SELECT COALESCE(COUNT(DISTINCT customer_name), 0) AS customers FROM gg_orders`),
      query(
        `SELECT COALESCE(COUNT(*), 0) AS active_jobs FROM gg_admin_jobs WHERE status = 'Open'`
      ),
      query(
        `SELECT order_id, customer_name, items, total, delivery_option, created_at
         FROM gg_orders ORDER BY created_at DESC LIMIT 6`
      ),
    ]);

    const revenue = Number(revRows?.[0]?.revenue ?? 0);
    const orders = Number(revRows?.[0]?.orders ?? 0);
    const customers = Number(orderRows?.[0]?.customers ?? 0);
    const activeJobs = Number(jobRows?.[0]?.active_jobs ?? 0);

    const recentOrders = (recentRows ?? []).map((r) => ({
      id: String(r.order_id),
      customer: String(r.customer_name),
      items: Array.isArray(r.items) ? r.items.length : 0,
      amount: Number(r.total ?? 0),
      status: "Processed",
      date: r.created_at ? new Date(String(r.created_at)).toLocaleDateString("en-IN") : "",
    }));

    return NextResponse.json({
      persisted: true,
      revenue,
      orders,
      customers,
      activeJobs,
      recentOrders,
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard failed", error);
    return NextResponse.json({
      persisted: false,
      revenue: 0,
      orders: 0,
      customers: 0,
      activeJobs: 0,
      recentOrders: [],
    });
  }
}
