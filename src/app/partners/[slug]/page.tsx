"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { partners } from "@/lib/data";
import { RatingStars } from "@/components/ui/rating-stars";
import { cn } from "@/lib/utils";

interface PartnerDetailPageProps {
  params: { slug: string };
}

export default function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const partner = partners.find((p) => p.slug === params.slug);

  if (!partner) {
    notFound();
  }

  const [lbIndex, setLbIndex] = useState<number | null>(null);

  const openLightbox = useCallback((i: number) => setLbIndex(i), []);
  const closeLightbox = useCallback(() => setLbIndex(null), []);
  const lbStep = useCallback(
    (d: number) =>
      setLbIndex((prev) =>
        prev === null
          ? null
          : (prev + d + partner!.gallery.length) % partner!.gallery.length
      ),
    [partner]
  );

  useEffect(() => {
    if (lbIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") lbStep(1);
      if (e.key === "ArrowLeft") lbStep(-1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lbIndex, closeLightbox, lbStep]);

  if (!partner) {
    return null;
  }

  return (
    <div className="pb-16">
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">
            Home
          </Link>
          <span className="text-muted">/</span>
          <Link href="/partners" className="hover:text-rose transition-colors">
            Partners
          </Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">{partner.name}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="section pt-10">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="pd-hero">
            <div
              className="pd-hero-photo"
              style={{ background: partner.gradient }}
            >
              {partner.emoji}
            </div>
            <div className="pd-hero-info">
              <p className="eyebrow">{partner.type}</p>
              <h1>{partner.name}</h1>
              <div className="pd-hero-loc">📍 {partner.loc}, Lucknow</div>
              <div className="pd-hero-rating">
                <RatingStars rating={partner.rating} size={18} />
                <span>
                  {partner.rating} ({partner.reviews} reviews)
                </span>
              </div>
              <p className="pd-desc">{partner.description}</p>
              <div className="pd-meta-row">
                <div className="m">
                  <b>{partner.staff}</b>
                  <span>Expert Staff</span>
                </div>
                <div className="m">
                  <b>{partner.services}</b>
                  <span>Services</span>
                </div>
                <div className="m">
                  <b>{partner.estd}</b>
                  <span>Established</span>
                </div>
                <div className="m">
                  <b>{partner.gallery.length}</b>
                  <span>Photos</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    toast.success("Booking request sent 💅")
                  }
                  className="btn-primary"
                >
                  Book Appointment
                </button>
                <Link
                  href="/careers"
                  className="btn-outline"
                >
                  View Openings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section bg-rose-blush pt-12">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="section-head" style={{ marginBottom: 34 }}>
            <p className="eyebrow">Photo Gallery</p>
            <h2>Inside {partner.name}</h2>
            <p>Tap any photo to view it full-size.</p>
          </div>
          <div className="gallery-grid">
            {partner.gallery.map((photo, i) => (
              <div
                key={i}
                className={cn("g", i === 0 && "tall")}
                style={{ background: photo.gradient }}
                onClick={() => openLightbox(i)}
              >
                {photo.emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="section-head" style={{ marginBottom: 34 }}>
            <p className="eyebrow">Menu</p>
            <h2>Services &amp; Pricing</h2>
          </div>
          <div className="service-list">
            {partner.menu.map((item) => (
              <div key={item.name} className="sv">
                <span className="sn">{item.name}</span>
                <span className="sp">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lbIndex !== null && partner.gallery[lbIndex] && (
        <div
          className={cn("lightbox", lbIndex !== null && "show")}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <button className="lb-close" onClick={closeLightbox}>
            ✕
          </button>
          <button className="lb-nav lb-prev" onClick={() => lbStep(-1)}>
            ‹
          </button>
          <button className="lb-nav lb-next" onClick={() => lbStep(1)}>
            ›
          </button>
          <div
            className="lb-stage"
            style={{ background: partner.gallery[lbIndex].gradient }}
          >
            {partner.gallery[lbIndex].emoji}
          </div>
          <div className="lb-cap">
            {partner.gallery[lbIndex].caption} · {partner.name}
          </div>
          <div className="lb-dots">
            {partner.gallery.map((_, i) => (
              <span
                key={i}
                className={cn("d", i === lbIndex && "on")}
                onClick={() => setLbIndex(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}