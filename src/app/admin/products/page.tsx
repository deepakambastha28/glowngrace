"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";

interface AdminProduct {
  id: string;
  emoji: string;
  brand: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  tags?: string[];
}

const money = (n: number) => "₹" + (n || 0).toLocaleString("en-IN");

const statusPill = (status: string) => {
  const key = (status || "").toLowerCase();
  let cls = "grey";
  if (key === "active") cls = "green";
  else if (key === "low stock") cls = "amber";
  else if (key === "out of stock") cls = "red";
  return <span className={`p-pill ${cls}`}>{status}</span>;
};

function ProductsContent() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => {
        setItems(Array.isArray(d.items) ? d.items : []);
        setCount(Array.isArray(d.items) ? d.items.length : 0);
      })
      .catch(() => {/* ignore */});
  }, []);

  return (
    <div>
      <AdminPageHead
        title="Products"
        subtitle={`${count} products in catalogue.`}
        actionLabel="Add Product"
        actionHref="/admin/products/new"
      />
      <div className="card !shadow-lg overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-blush text-xl">
                          {p.emoji}
                        </span>
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-xs text-muted">
                            {p.brand}
                            {p.tags?.length ? ` · ${p.tags.slice(0, 2).join(", ")}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td className="font-semibold">{money(p.price)}</td>
                    <td>{p.stock}</td>
                    <td>{statusPill(p.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-10">
                    No products added yet.
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

export default function AdminProductsPage() {
  return (
    <AdminGuard>
      <ProductsContent />
    </AdminGuard>
  );
}
