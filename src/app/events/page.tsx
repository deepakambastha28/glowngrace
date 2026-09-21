"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Search, CalendarDays, MapPin } from "lucide-react";
import type { EventItem } from "@/lib/data";
import { fetchEventConfig } from "@/lib/api";
import { EventCard } from "@/components/events/event-card";
import { EventCarousel } from "@/components/events/event-carousel";
import {
  DEFAULT_EVENT_CONFIG,
  normalizeEventConfig,
  type EventConfig,
  type EventSectionKey,
} from "@/lib/event-config";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function monthLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("");
  const [loc, setLoc] = useState("");
  const [sort, setSort] = useState<"soonest" | "name">("soonest");
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [config, setConfig] = useState<EventConfig>(DEFAULT_EVENT_CONFIG);
  const [bannerIndex, setBannerIndex] = useState(0);

  const bannerImages = useMemo(
    () => (config.banner.images ?? []).filter((src) => src.length > 0),
    [config.banner.images]
  );

  useEffect(() => {
    if (bannerImages.length < 2) return;
    setBannerIndex(0);
    const id = setInterval(
      () => setBannerIndex((i) => (i + 1) % bannerImages.length),
      5000
    );
    return () => clearInterval(id);
  }, [bannerImages.length]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => {
        if (d.items) setAllEvents(d.items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    fetchEventConfig().then((res) => {
      if (!active) return;
      setConfig(normalizeEventConfig(res.data?.config ?? DEFAULT_EVENT_CONFIG));
    });
    return () => {
      active = false;
    };
  }, []);

  const isSectionVisible = (key: EventSectionKey): boolean => {
    const section = config.sections.find((s) => s.key === key);
    return section ? section.visible && !section.deleted : true;
  };

  const allMonths = useMemo(
    () =>
      Array.from(
        new Set(allEvents.map((e) => monthLabel(e.date)))
      ).sort(),
    [allEvents]
  );

  const allLocs = useMemo(
    () => Array.from(new Set(allEvents.map((e) => e.loc))).sort(),
    [allEvents]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = allEvents.filter((e) => {
      const matchesQ =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.loc.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q));
      const matchesMonth = !month || monthLabel(e.date) === month;
      const matchesLoc = !loc || e.loc === loc;
      return matchesQ && matchesMonth && matchesLoc;
    });
    if (sort === "soonest") {
      list.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [query, month, loc, sort, allEvents]);

  const hasFilters = Boolean(query || month || loc);

  const clearFilters = () => {
    setQuery("");
    setMonth("");
    setLoc("");
  };

  return (
    <div className="pb-16">
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">
            Home
          </Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">Events</span>
        </div>
      </div>

      {isSectionVisible("banner") && (
        <div data-testid="event-banner" className="relative overflow-hidden">
          {bannerImages.length > 0 && (
            <div className="absolute inset-0">
              {bannerImages.map((src, i) => (
                <div
                  key={i}
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
                  style={{
                    backgroundImage: `url(${src})`,
                    opacity: i === bannerIndex ? 1 : 0,
                  }}
                />
              ))}
            </div>
          )}
          <div
            className="absolute inset-0"
            style={
              bannerImages.length > 0
                ? { background: "linear-gradient(180deg, rgba(43,35,48,0.15) 0%, rgba(43,35,48,0.55) 100%)" }
                : { background: "linear-gradient(135deg, #d6336c, #b02a5b)" }
            }
          />
          <div className="relative mx-auto max-w-screen-xl px-6 py-16 sm:py-20 text-center">
            {config.banner.title && (
              <h2 className="text-2xl sm:text-4xl font-bold text-white">
                {config.banner.title}
              </h2>
            )}
            {config.banner.subtitle && (
              <p className="mt-3 text-white/85 max-w-xl mx-auto">{config.banner.subtitle}</p>
            )}
            {bannerImages.length > 1 && (
              <div className="mt-5 flex justify-center gap-2">
                {bannerImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBannerIndex(i)}
                    aria-label={`Go to event banner slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === bannerIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isSectionVisible("carousel") && <EventCarousel />}

      {isSectionVisible("heading") && (
        <section className="section pt-10" data-testid="event-heading">
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="section-head">
              <p className="eyebrow">{config.heading.eyebrow}</p>
              <h2>{config.heading.title}</h2>
              {config.heading.description && <p>{config.heading.description}</p>}
            </div>

            <div className="event-toolbar">
              <div className="event-search">
                <Search className="h-4 w-4 text-rose shrink-0" />
                <input
                  data-testid="event-search"
                  placeholder="Search workshops, categories or tags…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                data-testid="event-date-filter"
                className="event-select"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">🗓️ All Dates</option>
                {allMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                data-testid="event-loc-filter"
                className="event-select"
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
              >
                <option value="">📍 All Locations</option>
                {allLocs.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <select
                className="event-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as "soonest" | "name")}
              >
                <option value="soonest">⏰ Upcoming Soonest</option>
                <option value="name">🔤 Name (A–Z)</option>
              </select>
              {hasFilters && (
                <button
                  data-testid="event-clear"
                  className="event-clear"
                  onClick={clearFilters}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="event-count">
              <span data-testid="event-count">
                Showing <b>{filtered.length}</b> of {allEvents.length} events
              </span>
              {hasFilters && (
                <span className="active-chips">
                  {query && (
                    <span className="fchip">
                      <span className="fk">Search:</span> &ldquo;{query}&rdquo;{" "}
                      <span className="fx" onClick={() => setQuery("")}>
                        ✕
                      </span>
                    </span>
                  )}
                  {month && (
                    <span className="fchip">
                      <span className="fk">🗓️</span> {month}{" "}
                      <span className="fx" onClick={() => setMonth("")}>
                        ✕
                      </span>
                    </span>
                  )}
                  {loc && (
                    <span className="fchip">
                      <span className="fk">📍</span> {loc}{" "}
                      <span className="fx" onClick={() => setLoc("")}>
                        ✕
                      </span>
                    </span>
                  )}
                  <button
                    className="clear-all-chip"
                    onClick={clearFilters}
                  >
                    Clear all
                  </button>
                </span>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="event-empty">
                <div className="ic">📅</div>
                <h3>No events found</h3>
                <p style={{ marginTop: 8 }}>
                  Try a different month, location or search term.
                </p>
                <button
                  className="btn-outline mt-4"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="event-grid">
                {filtered.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}