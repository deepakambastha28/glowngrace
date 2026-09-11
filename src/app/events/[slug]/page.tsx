"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import type { EventItem } from "@/lib/data";
import { cn } from "@/lib/utils";

interface EventDetailPageProps {
  params: { slug: string };
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => {
        if (d.items) setAllEvents(d.items);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const event = allEvents.find((e) => e.slug === params.slug);

  if (loaded && !event) {
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
          : (prev + d + (event?.gallery.length ?? 0)) % (event?.gallery.length ?? 1)
      ),
    [event]
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

  if (!event) {
    return null;
  }

  const soldOut = event.spotsLeft === 0;

  return (
    <div className="pb-16">
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">
            Home
          </Link>
          <span className="text-muted">/</span>
          <Link href="/events" className="hover:text-rose transition-colors">
            Events
          </Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">{event.title}</span>
        </div>
      </div>

      <section className="section pt-10">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="ev-hero">
            <div
              className="ev-hero-photo"
              style={{ background: event.gradient }}
            >
              <span className="ev-cat">{event.category}</span>
              <span className="ev-price-tag">{event.price}</span>
              {event.emoji}
            </div>
            <div className="ev-hero-info">
              <p className="eyebrow">{event.category}</p>
              <h1>{event.title}</h1>
              <div className="ev-hero-meta">
                <div className="m">
                  <b>🗓️</b>
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="m">
                  <b>🕐</b>
                  <span>{event.time}</span>
                </div>
                <div className="m">
                  <b>📍</b>
                  <span>{event.loc}, Lucknow</span>
                </div>
                <div className="m">
                  <b>🏛️</b>
                  <span>{event.venue}</span>
                </div>
              </div>
              <p className="ev-desc">{event.description}</p>
              <div className="ev-stats">
                <div className="s">
                  <b>{event.capacity}</b>
                  <span>Seats</span>
                </div>
                <div className="s">
                  <b>{event.spotsLeft}</b>
                  <span>Seats left</span>
                </div>
                <div className="s">
                  <b>{event.gallery.length}</b>
                  <span>Photos</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    soldOut
                      ? toast.info("This event is sold out — join the waitlist 💌")
                      : toast.success("Seat reserved 🎉")
                  }
                  className="btn-primary"
                  disabled={soldOut}
                >
                  {soldOut ? "Sold Out" : `Book My Seat · ${event.price}`}
                </button>
                {event.price !== "Free" && (
                  <Link href="/products" className="btn-outline">
                    Shop the Look
                  </Link>
                )}
              </div>
              <div className="ev-tags">
                {event.tags.map((t) => (
                  <span key={t} className="tag">#{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="section-head" style={{ marginBottom: 34 }}>
            <p className="eyebrow">Session Flow</p>
            <h2>What&rsquo;s on the Agenda</h2>
          </div>
          <div className="agenda-list">
            {event.agenda.map((item, i) => (
              <div key={item} className="ag">
                <span className="an">{i + 1}</span>
                <span className="at">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-rose-blush pt-12">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="section-head" style={{ marginBottom: 34 }}>
            <p className="eyebrow">Event Gallery</p>
            <h2>Highlights</h2>
            <p>Moments captured on stage — tap any photo to view it full-size.</p>
          </div>
          <div className="gallery-grid" data-testid="event-gallery">
            {event.gallery.map((photo, i) => (
              <div
                key={i}
                className={cn("g", i === 0 && "tall")}
                style={{ background: photo.gradient }}
                data-testid="event-photo"
                onClick={() => openLightbox(i)}
              >
                {photo.emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      {lbIndex !== null && event.gallery[lbIndex] && (
        <div
          className={cn("lightbox", lbIndex !== null && "show")}
          data-testid="event-lightbox"
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
            style={{ background: event.gallery[lbIndex].gradient }}
          >
            {event.gallery[lbIndex].emoji}
          </div>
          <div className="lb-cap">
            {event.gallery[lbIndex].caption} · {event.title}
          </div>
          <div className="lb-dots">
            {event.gallery.map((_, i) => (
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