"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/admin-guard";
import { createAdminReview } from "@/lib/api";

const products = [
  "Luxe Liquid Lipstick",
  "Vitamin C Face Serum",
  "Radiance Highlighter",
  "Rose Eau De Parfum",
  "Gel Nail Polish Set",
  "Volumizing Mascara",
];
const statuses = ["Approved", "Pending", "Hidden"];
const starLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

function ReviewForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [product, setProduct] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("Approved");

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, boolean> = {
      name: !name.trim(),
      product: !product,
      comment: !comment.trim(),
      rating: rating === 0,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      if (rating === 0) toast.error("Please select a star rating");
      else toast.error("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    const res = await createAdminReview({
      author: name.trim(),
      initial: name.trim().charAt(0).toUpperCase(),
      product,
      rating,
      comment: comment.trim(),
      location,
      status,
    });
    setSaving(false);

    if (res.ok) {
      toast.success(res.data?.persisted
        ? "Review saved successfully ✓"
        : "Review saved (database not configured — demo only)");
      router.push("/admin/reviews");
    } else {
      toast.error("Could not save review");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="text-sm text-muted mb-1">
          Dashboard / Reviews / <span className="text-rose font-semibold">Add Review</span>
        </div>
        <h1 className="text-3xl font-bold">Add a Review</h1>
        <p className="mt-1 text-muted">Create or record a customer product review.</p>
      </div>

      <form onSubmit={submit} className="grid lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
        <div className="space-y-6">
          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">👤 Reviewer &amp; Product</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">
                  Customer Name <span className="text-rose">*</span>
                </label>
                <input
                  className={`field-input ${errors.name ? "!border-red" : ""}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                />
                {errors.name && <p className="mt-1 text-sm text-red">Please enter a name.</p>}
              </div>
              <div>
                <label className="field-label">Location</label>
                <input
                  className="field-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Gomti Nagar"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="field-label">
                Product <span className="text-rose">*</span>
              </label>
              <select
                className={`field-input ${errors.product ? "!border-red" : ""}`}
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                <option value="">Select a product</option>
                {products.map((p) => <option key={p}>{p}</option>)}
              </select>
              {errors.product && <p className="mt-1 text-sm text-red">Please select a product.</p>}
            </div>
          </div>

          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">⭐ Rating &amp; Feedback</h3>
            <div className="space-y-4">
              <div>
                <label className="field-label">
                  Rating <span className="text-rose">*</span>
                </label>
                <div className="flex gap-1.5 text-3xl cursor-pointer">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${n} stars`}
                      onClick={() => setRating(n)}
                      className={`transition ${rating >= n ? "text-gold" : "text-[#e0d3db]"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {errors.rating && <p className="mt-1 text-sm text-red">Please select a star rating.</p>}
                <p className="mt-1 text-xs text-muted">{starLabels[rating] || "Click to rate"}</p>
              </div>
              <div>
                <label className="field-label">
                  Review <span className="text-rose">*</span>
                </label>
                <textarea
                  className={`field-textarea min-h-[90px] ${errors.comment ? "!border-red" : ""}`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write the customer's review here..."
                />
                {errors.comment && <p className="mt-1 text-sm text-red">Please enter the review text.</p>}
              </div>
              <div>
                <label className="field-label">Moderation Status</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        status === s
                          ? "border-transparent bg-gradient-to-br from-rose to-rose-dark text-white"
                          : "border-line text-muted hover:border-rose-soft"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Review Preview</h3>
            <div className="rounded-[14px] bg-gradient-to-br from-blush to-[#fbe0ea] p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-rose-soft to-rose font-heading font-bold text-white">
                  {(name.trim() || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">{name.trim() || "Customer Name"}</div>
                  <div className="star-gold text-sm">{starLabelRow(rating)}</div>
                </div>
              </div>
              <div className="mt-3 text-[0.72rem] font-bold uppercase tracking-widest text-gold">
                {product || "Product"}
              </div>
              <div className="mt-2 text-sm italic text-charcoal">
                “{comment.trim() || "Review text will appear here..."}”
              </div>
            </div>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <b>{status}</b>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => router.push("/admin")} className="btn-outline flex-1 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
                {saving ? "Saving…" : "Save Review"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function starLabelRow(r: number) {
  return "★".repeat(r) + "☆".repeat(5 - r);
}

export default function AddReviewPage() {
  return (
    <AdminGuard>
      <ReviewForm />
    </AdminGuard>
  );
}
