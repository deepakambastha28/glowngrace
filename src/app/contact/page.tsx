"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactReviewSchema, type ContactReviewFormData } from "@/lib/schemas";

const CONTACT_CARDS = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@glowngrace.in",
    href: "mailto:hello@glowngrace.in",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 89718 21213",
    href: "tel:+918971821213",
  },
  {
    icon: MapPin,
    label: "Visit",
    value: "Hazratganj, Lucknow, UP 226001",
    href: "#",
  },
];

export default function ContactPage() {
  const [products, setProducts] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactReviewFormData>({
    resolver: zodResolver(contactReviewSchema),
  });

  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const names = (Array.isArray(d.items) ? d.items : [])
          .map((p: { name?: string }) => (p?.name ?? "").trim())
          .filter(Boolean);
        setProducts(names);
      })
      .catch(() => {
        /* keep empty product list */
      });
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (data: ContactReviewFormData) => {
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((r) => r.json())
      .catch(() => null);
    setSubmitting(false);

    if (!res || res.error) {
      toast.error("Could not submit your review. Please try again.");
      return;
    }
    toast.success("Thanks! Your review will appear after admin approval.");
    reset();
  };

  return (
    <div className="pb-16">
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">Home</Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">Contact Us</span>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-6 pt-14">
        <div className="section-head">
          <p className="eyebrow">Contact Us</p>
          <h1>We&apos;d Love to Hear From You</h1>
          <p>
            Questions, feedback or just want to share your experience? Reach out
            or leave a review below — every voice matters.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-2">
          {CONTACT_CARDS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className="flex items-center gap-3 rounded-[14px] border border-line bg-cream/50 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gold/10">
                <c.icon className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted">{c.label}</p>
                <p className="text-sm font-medium">{c.value}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 grid lg:grid-cols-[1.6fr_0.9fr] gap-8 items-start">
          <div className="card !rounded-[20px] p-7">
            <h2 className="flex items-center gap-2 text-xl font-bold mb-1">
              <MessageSquare className="h-5 w-5 text-rose" /> Leave a Review
            </h2>
            <p className="text-sm text-muted mb-6">
              Loved something? Share your experience. Reviews appear on the site
              after admin approval.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label" htmlFor="contact-name">
                    Your Name <span className="text-rose">*</span>
                  </label>
                  <input
                    id="contact-name"
                    className="field-input mt-1.5"
                    placeholder="Priya Sharma"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-rose">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="field-label" htmlFor="contact-email">
                    Email <span className="text-rose">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="field-input mt-1.5"
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-rose">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="contact-product">
                  Product
                </label>
                <select
                  id="contact-product"
                  className="field-input mt-1.5"
                  {...register("product")}
                >
                  <option value="">General — not tied to a product</option>
                  {products.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="contact-comment">
                  Review <span className="text-rose">*</span>
                </label>
                <textarea
                  id="contact-comment"
                  className="field-input mt-1.5 min-h-[120px] resize-y"
                  placeholder="Tell us about your experience..."
                  {...register("comment")}
                />
                {errors.comment && (
                  <p className="mt-1 text-sm text-rose">{errors.comment.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          </div>

          <div className="card !rounded-[20px] p-7">
            <h3 className="text-lg font-semibold mb-3">What happens next?</h3>
            <ul className="space-y-3 text-sm text-charcoal/70">
              <li>
                <strong className="text-charcoal">1. Review submitted</strong>
                <p className="mt-0.5">Your review is saved.</p>
              </li>
              <li>
                <strong className="text-charcoal">2. Admin approval</strong>
                <p className="mt-0.5">
                  Our team reviews every entry before publishing.
                </p>
              </li>
              <li>
                <strong className="text-charcoal">3. Live on the site</strong>
                <p className="mt-0.5">
                  Approved reviews appear in our testimonials and product pages.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}