"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { MapPin, Camera } from "lucide-react";
import type { Partner } from "@/lib/data";
import { fetchPartners } from "@/lib/api";
import { RatingStars } from "@/components/ui/rating-stars";
import { cn } from "@/lib/utils";

interface PartnerDetailPageProps {
  params: { slug: string };
}

export default function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [partner, setPartner] = useState<Partner | undefined>(undefined);
  const [lbIndex, setLbIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    let active = true;
    fetchPartners().then((res) => {
      if (!active) return;
      const items = res.data?.items;
      if (items?.length) {
        setPartner(items.find((p) => p.slug === params.slug));
      }
      setStatus("ready");
    });
    return () => {
      active = false;
    };
  }, [params.slug]);

  const openLightbox = useCallback((i: number) => setLbIndex(i), []);
  const closeLightbox = useCallback(() => setLbIndex(null), []);
  const lbStep = useCallback(
    (d: number) =>
      setLbIndex((prev) =>
        prev === null
          ? null
          : (prev +
              d +
              (partner?.images?.length ?? partner?.gallery.length ?? 1)) %
            (partner?.images?.length ?? partner?.gallery.length ?? 1)
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

  if (status === "ready" && !partner) {
    notFound();
  }

  if (!partner) {
    return <div className="py-32 text-center text-muted">Loading partner…</div>;
  }

  const images = partner.images && partner.images.length > 0 ? partner.images : undefined;
  const photoCount = images?.length ?? partner.gallery.length;

  const bannerSlides = partner.bannerImage ? [partner.bannerImage] : [];
  const slides = images
    ? images.slice(0, Math.min(6, images.length))
    : partner.gallery.slice(0, Math.min(6, partner.gallery.length)).map((g) => g.emoji);

  const totalSlides = bannerSlides.length || slides.length;
  const currentSlide =
    totalSlides > 0 ? slideIndex % totalSlides : 0;

  const bannerStep = (d: number) => {
    setSlideIndex((prev) => (prev + d + totalSlides) % totalSlides);
  };

  return (
    <div>
      {/* Banner Slider */}
      <div className="banner-slider">
        {bannerSlides.length > 0
          ? bannerSlides.map((slide, i) => (
              <div
                key={i}
                className={cn("bslide", i === currentSlide && "active")}
                style={{ backgroundImage: `url(${slide})` }}
              />
            ))
          : slides.map((slide, i) => {
              const isActive = i === currentSlide;
              const isImage =
                typeof slide === "string" &&
                (slide.startsWith("http") || slide.startsWith("data:image"));
              return (
                <div
                  key={i}
                  className={cn("bslide", isActive && "active")}
                  style={
                    isImage
                      ? { backgroundImage: `url(${slide})` }
                      : partner.gallery[i]
                        ? { background: partner.gallery[i].gradient }
                        : { background: partner.gradient }
                  }
                >
                  {!isImage && (
                    <span className="text-8rem relative z-[1] grid place-items-center h-full w-full opacity-90">
                      {typeof slide === "string" ? slide : partner.emoji}
                    </span>
                  )}
                </div>
              );
            })}

        <button className="pb-back" onClick={() => window.history.back()}>
          ← Back to Partners
        </button>

        <div className="pb-badges">
          <span className="bdg gold">⭐ {partner.rating}</span>
          <span className="bdg">Since {partner.estd}</span>
        </div>

        {totalSlides > 1 && (
          <>
            <button className="b-arrow left" onClick={() => bannerStep(-1)}>
              ‹
            </button>
            <button className="b-arrow right" onClick={() => bannerStep(1)}>
              ›
            </button>
          </>
        )}

        <div className="b-caption">
          <Camera className="h-4 w-4" /> Photo {currentSlide + 1} / {totalSlides}
        </div>

        {totalSlides > 1 && (
          <div className="b-dots">
            {Array.from({ length: totalSlides }, (_, i) => (
              <span
                key={i}
                className={cn("bd", i === currentSlide && "on")}
                onClick={() => setSlideIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-screen-xl px-6">
        {/* Profile Card */}
        <div className="profile-card">
          <div
            className="profile-avatar"
            style={
              images
                ? { backgroundImage: `url(${images[0]})` }
                : { background: partner.gradient }
            }
          >
            {!images && <span className="av-emoji">{partner.emoji}</span>}
          </div>

          <div className="profile-main">
            <p className="ptype">{partner.type}</p>
            <h1>{partner.name}</h1>
            <div className="ploc">
              <MapPin className="h-4 w-4 text-rose" /> {partner.loc}, Lucknow
            </div>
            <div className="prate">
              <RatingStars rating={partner.rating} size={18} />
              <span>
                {partner.rating} ({partner.reviews} reviews)
              </span>
            </div>
          </div>

          <div className="profile-actions">
            <button
              onClick={() => toast.success("Booking request sent 💅")}
              className="btn-primary"
            >
              Book Appointment
            </button>
            <button
              onClick={() => toast.success("Added to favourites ♥")}
              className="btn-outline"
            >
              ♥ Save
            </button>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="profile-stats">
          <div className="pstat">
            <b>{partner.staff}</b>
            <span>Expert Staff</span>
          </div>
          <div className="pstat">
            <b>{partner.services}</b>
            <span>Services</span>
          </div>
          <div className="pstat">
            <b>{partner.estd}</b>
            <span>Established</span>
          </div>
          <div className="pstat">
            <b>{photoCount}</b>
            <span>Photos</span>
          </div>
        </div>

        {/* Two-column body */}
        <div className="profile-body">
          <div>
            {/* About */}
            <div className="profile-section">
              <h3>📖 About</h3>
              <p>{partner.description}</p>
              <div className="about-tags">
                {partner.tags.map((t) => (
                  <span key={t} className="at">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="profile-section">
              <h3>📷 Photo Gallery</h3>
              <div className="gallery-grid">
                {photoCount === 0 ? (
                  <div className="g g-empty">
                    <span className="g-emoji">📸</span>
                    <span className="g-cap">Photos coming soon</span>
                  </div>
                ) : images ? (
                  images.map((src, i) => (
                    <figure
                      key={i}
                      className={cn("g", i === 0 && "tall")}
                      onClick={() => openLightbox(i)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`${partner.name} photo ${i + 1}`} className="h-full w-full object-cover" />
                      <figcaption className="g-cap">{partner.name}</figcaption>
                    </figure>
                  ))
                ) : (
                  partner.gallery.map((photo, i) => (
                    <figure
                      key={i}
                      className={cn("g", i === 0 && "tall")}
                      style={{ background: photo.gradient }}
                      onClick={() => openLightbox(i)}
                    >
                      <span className="g-emoji">{photo.emoji}</span>
                      <figcaption className="g-cap">{photo.caption}</figcaption>
                    </figure>
                  ))
                )}
              </div>
            </div>

            {/* Services & Pricing */}
            <div className="profile-section">
              <h3>💇 Services &amp; Pricing</h3>
              <div className="service-list">
                {partner.menu.length === 0 ? (
                  <div className="sv sv-empty">
                    <span className="sn">{partner.name} full menu is coming soon.</span>
                    <span className="sp">Call to book</span>
                  </div>
                ) : (
                  partner.menu.map((item, i) => (
                    <div key={`${item.name}-${i}`} className="sv">
                      <span className="sv-idx">{String(i + 1).padStart(2, "0")}</span>
                      <span className="sn">
                        {item.name}
                        {item.duration && (
                          <span className="block text-xs font-normal text-muted">⏱ {item.duration}</span>
                        )}
                        {item.description && (
                          <span className="mt-0.5 block text-xs font-normal text-charcoal/60 line-clamp-2">
                            {item.description}
                          </span>
                        )}
                      </span>
                      <span className="sp">{item.price}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            {/* Information Card */}
            <div className="side-card">
              <h3>📋 Information</h3>
              <div className="info-row">
                <div className="ir-ic">📍</div>
                <div className="ir-txt">
                  <b>{partner.loc}</b>
                  <span>Lucknow, UP</span>
                </div>
              </div>
              <div className="info-row">
                <div className="ir-ic">📞</div>
                <div className="ir-txt">
                  <b>+91 98765 43210</b>
                  <span>Call to book</span>
                </div>
              </div>
              <div className="info-row">
                <div className="ir-ic">👥</div>
                <div className="ir-txt">
                  <b>{partner.staff} Experts</b>
                  <span>Certified professionals</span>
                </div>
              </div>
              <div className="info-row">
                <div className="ir-ic">✅</div>
                <div className="ir-txt">
                  <b>Verified Partner</b>
                  <span>Background-checked salon</span>
                </div>
              </div>
            </div>

            {/* Opening Hours Card */}
            <div className="side-card" style={{ top: "auto" }}>
              <h3>🕐 Opening Hours</h3>
              <div className="hours-row today">
                <span>Today</span>
                <span>10:00 AM – 8:00 PM</span>
              </div>
              <div className="hours-row">
                <span>Mon – Fri</span>
                <span>10:00 AM – 8:00 PM</span>
              </div>
              <div className="hours-row">
                <span>Saturday</span>
                <span>9:00 AM – 9:00 PM</span>
              </div>
              <div className="hours-row">
                <span>Sunday</span>
                <span>11:00 AM – 6:00 PM</span>
              </div>
              <button
                className="btn-primary w-full mt-4"
                onClick={() => toast.success("Booking request sent 💅")}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lbIndex !== null && (images ? images[lbIndex] : partner.gallery[lbIndex]) && (
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
            style={images ? undefined : { background: partner.gallery[lbIndex].gradient }}
          >
            {images ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[lbIndex]} alt={`Photo ${lbIndex + 1}`} />
            ) : (
              partner.gallery[lbIndex].emoji
            )}
          </div>
          <div className="lb-cap">
            {images
              ? `${partner.name} · Photo ${lbIndex + 1}`
              : partner.gallery[lbIndex].caption} · {partner.name}
          </div>
          <div className="lb-dots">
            {Array.from({ length: photoCount }, (_, i) => (
              <span
                key={i}
                className={cn("d", i === lbIndex && "on")}
                onClick={() => setLbIndex(i)}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 60 }} />
    </div>
  );
}
