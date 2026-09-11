"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Heart, Wallet, ShoppingBag, Users, Briefcase,
  TrendingUp, TrendingDown,
} from "lucide-react";

interface DashboardData {
  persisted: boolean;
  revenue: number;
  orders: number;
  customers: number;
  activeJobs: number;
  recentOrders: {
    id: string;
    customer: string;
    items: number;
    amount: number;
    status: string;
    date: string;
  }[];
}

const money = (n: number) => "₹" + (n || 0).toLocaleString("en-IN");

const statusPill = (status: string) => {
  const key = (status || "").toLowerCase();
  let cls = "grey";
  if (["active", "delivered", "approved", "open", "shipped", "processed", "completed"].includes(key)) cls = "green";
  else if (["pending", "processing", "low stock", "shipped"].includes(key)) cls = "amber";
  else if (["out of stock", "hidden", "cancelled"].includes(key)) cls = "red";
  else if (["shipped", "new"].includes(key)) cls = "blue";
  return <span className={`p-pill ${cls}`}>{status}</span>;
};

const chartData = [
  { m: "Feb", v: 62 }, { m: "Mar", v: 78 }, { m: "Apr", v: 55 },
  { m: "May", v: 88 }, { m: "Jun", v: 72 }, { m: "Jul", v: 95 }, { m: "Aug", v: 84 },
];

export default function AdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  const loadDashboard = useCallback(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {/* ignore */});
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = [
    { icon: Wallet, cls: "bg-blush text-rose", trend: "up", label: "Total Revenue", value: data ? money(data.revenue) : "₹0", trendText: "▲ 12.5%" },
    { icon: ShoppingBag, cls: "bg-[#fbf3e2] text-gold", trend: "up", label: "Total Orders", value: data ? String(data.orders) : "0", trendText: "▲ 8.2%" },
    { icon: Users, cls: "bg-[#eaf7f0] text-[#2e9e6b]", trend: "up", label: "Customers", value: data ? String(data.customers) : "0", trendText: "▲ 5.1%" },
    { icon: Briefcase, cls: "bg-[#e9f1fa] text-[#3b82c9]", trend: "down", label: "Active Jobs", value: data ? String(data.activeJobs) : "0", trendText: "▼ 2.3%" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted">Welcome back, Deepak — here&apos;s your store overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-rose" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card !shadow-lg p-6">
            <div className={`grid h-12 w-12 place-items-center rounded-[13px] text-xl ${s.cls}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <div className="font-heading text-3xl font-bold">{s.value}</div>
                <p className="text-muted text-sm">{s.label}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  s.trend === "up" ? "bg-emerald/15 text-emerald" : "bg-rose/10 text-red"
                }`}
              >
                {s.trend === "up" ? <TrendingUp className="mr-1 inline h-3 w-3" /> : <TrendingDown className="mr-1 inline h-3 w-3" />}
                {s.trendText.replace(/[▲▼]/g, "").trim()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="card !shadow-lg p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Revenue Overview</h3>
            <span className="text-sm text-rose font-semibold">Last 7 months</span>
          </div>
          <div className="flex h-52 items-end gap-4">
            {chartData.map((d) => (
              <div key={d.m} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full max-w-[38px] rounded-t-lg bg-gradient-to-t from-rose to-rose-soft"
                  style={{ height: `${d.v}%` }}
                />
                <span className="text-xs text-muted">{d.m}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card !shadow-lg p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sales by Category</h3>
          </div>
          <div className="flex items-center gap-5">
            <div
              className="h-36 w-36 shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(vaR(--rose) 0% 42%, var(--gold) 42% 70%, var(--rose-soft) 70% 88%, var(--green) 88% 100%)",
                mask: "radial-gradient(circle 26px at center, transparent 98%, #000 100%)",
                WebkitMask: "radial-gradient(circle 26px at center, transparent 98%, #000 100%)",
              }}
            />
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-rose" /> Makeup — 42%
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-gold" /> Skincare — 28%
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-rose-soft" /> Fragrances — 18%
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-[#2e9e6b]" /> Nail Care — 12%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card !shadow-lg mt-6 overflow-hidden !p-0">
        <div className="px-6 pt-6">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders?.length ? (
                data.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-semibold">#{o.id}</td>
                    <td>{o.customer}</td>
                    <td>{o.items} item(s)</td>
                    <td className="font-semibold">{money(o.amount)}</td>
                    <td>{statusPill(o.status)}</td>
                    <td className="text-muted">{o.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-muted text-center py-8">
                    No persisted orders yet. Orders will appear here once placed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}