"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";

interface AdminReview {
  id: string;
  author: string;
  product: string;
  rating: number;
  comment: string;
  status: string;
}

const stars = (r: number) => "★".repeat(r) + "☆".repeat(5 - r);

const statusPill = (status: string) => {
  const key = (status || "").toLowerCase();
  let cls = "grey";
  if (key === "approved") cls = "green";
  else if (key === "pending") cls = "amber";
  else if (key === "hidden") cls = "red";
  return <span className={`p-pill ${cls}`}>{status}</span>;
};

function ReviewsContent() {
  const [items, setItems] = useState<AdminReview[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((d) => {
        setItems(Array.isArray(d.items) ? d.items : []);
        setCount(Array.isArray(d.items) ? d.items.length : 0);
      })
      .catch(() => {/* ignore */});
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/reviews?id=${id}&status=${status}`, {
      method: "PATCH",
    });
    if (!res.ok) return;
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div>
      <AdminPageHead
        title="Reviews"
        subtitle={`${count} customer reviews.`}
        actionLabel="Add Review"
        actionHref="/admin/reviews/new"
      />
      <div className="card !shadow-lg overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Customer</th><th>Product</th><th>Rating</th><th>Review</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((r) => (
                  <tr key={r.id}>
                    <td className="font-semibold">{r.author}</td>
                    <td>{r.product}</td>
                    <td className="star-gold">{stars(r.rating)}</td>
                    <td className="max-w-[260px] text-sm text-muted">{r.comment}</td>
                    <td>{statusPill(r.status)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(r.id, "Approved")}
                          disabled={r.status === "Approved"}
                          className="rounded-full border border-emerald/40 px-3 py-1 text-xs font-semibold text-emerald hover:bg-emerald/10 disabled:opacity-40"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, "Hidden")}
                          disabled={r.status === "Hidden"}
                          className="rounded-full border border-red/40 px-3 py-1 text-xs font-semibold text-red hover:bg-red/10 disabled:opacity-40"
                        >
                          Deny
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-10">
                    No reviews added yet.
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

export default function AdminReviewsPage() {
  return (
    <AdminGuard>
      <ReviewsContent />
    </AdminGuard>
  );
}
