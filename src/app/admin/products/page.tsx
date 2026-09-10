"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";
import { fetchAdminProducts, updateAdminProduct, deleteAdminProduct, type AdminProductRecord } from "@/lib/api";
import { EyeOff, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  const router = useRouter();
  const [items, setItems] = useState<AdminProductRecord[]>([]);
  const [count, setCount] = useState(0);

  const load = () => {
    fetchAdminProducts().then((res) => {
      const list = Array.isArray(res.data?.items) ? res.data!.items : [];
      setItems(list);
      setCount(list.length);
    });
  };

  useEffect(() => { load(); }, []);

  const toggleHide = async (p: AdminProductRecord) => {
    const res = await updateAdminProduct(p.id, { hidden: !p.hidden });
    if (res.ok) {
      toast.success(p.hidden ? "Product is now visible on the store" : "Product hidden from the store");
      load();
    } else {
      toast.error("Could not update visibility");
    }
  };

  const handleDelete = async (p: AdminProductRecord) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const res = await deleteAdminProduct(p.id);
    if (res.ok) {
      toast.success("Product deleted");
      load();
    } else {
      toast.error("Could not delete product");
    }
  };

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
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
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
                    <td>
                      {statusPill(p.status)}
                      {p.hidden && <span className="p-pill grey ml-1">Hidden</span>}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/products/${p.id}/edit`)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f1fa] text-[#3b82c9] hover:bg-[#3b82c9] hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleHide(p)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#f1f1f4] text-muted hover:bg-muted hover:text-white transition-colors"
                          title={p.hidden ? "Unhide" : "Hide"}
                        >
                          {p.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#fdeaea] text-red hover:bg-red hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-10">
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