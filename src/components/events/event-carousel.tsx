"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EventItem } from "@/lib/data";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function EventCarousel() {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => { if (d.items) setAllEvents(d.items); })
      .catch(() => {});
  }, []);

  const featured = useMemo(
    () =>
      [...allEvents]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 4),
    [allEvents]
  );

  const count = featured.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % count),
    [count]
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused || count === 0) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [paused, next, count]);

  if (count === 0) return null;

  return (
    <div
      className="event-carousel"
      data-testid="event-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="ec-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {featured.map((e, i) => (
          <Link
            key={e.id}
            href={`/events/${e.slug}`}
            className="ec-slide"
            data-testid="event-slide"
            data-active={i === index}
            style={{ background: e.gradient }}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
          >
            <div className="ec-inner">
              <span className="ec-emoji">{e.emoji}</span>
              <span className="ec-info">
                <span className="ec-cat">{e.category}</span>
                <span className="ec-title">{e.title}</span>
                <span className="ec-date">
                  🗓️ {formatDate(e.date)} · {e.time}
                </span>
                <span className="ec-cta">View Details →</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
      <button
        className="ec-arrow ec-prev"
        data-testid="event-carousel-prev"
        onClick={prev}
        aria-label="Previous event"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        className="ec-arrow ec-next"
        data-testid="event-carousel-next"
        onClick={next}
        aria-label="Next event"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="ec-dots">
        {featured.map((_, i) => (
          <button
            key={i}
            className={cn("ec-dot", i === index && "on")}
            data-testid="event-carousel-dot"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}