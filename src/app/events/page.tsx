"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, CalendarDays, MapPin } from "lucide-react";
import { events } from "@/lib/data";
import { EventCard } from "@/components/events/event-card";

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

  const allMonths = useMemo(
    () =>
      Array.from(
        new Set(events.map((e) => monthLabel(e.date)))
      ).sort(),
    []
  );

  const allLocs = useMemo(
    () => Array.from(new Set(events.map((e) => e.loc))).sort(),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = events.filter((e) => {
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
  }, [query, month, loc, sort]);

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

      <section className="section pt-10">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="section-head">
            <p className="eyebrow">Happenings in Lucknow</p>
            <h2>Events</h2>
            <p>
              Masterclasses, workshops, launches and meetups hosted by
              Glow &amp; Grace and our partner parlours across Lucknow.
            </p>
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
              Showing <b>{filtered.length}</b> of {events.length} events
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
    </div>
  );
}