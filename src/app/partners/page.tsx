"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Map, LayoutGrid } from "lucide-react";
import { localityPos } from "@/lib/data";
import type { Partner } from "@/lib/data";
import { fetchPartners } from "@/lib/api";
import { PartnerCard } from "@/components/partners/partner-card";

type SortKey = "rating" | "name" | "reviews";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "rating", label: "⭐ Top Rated" },
  { value: "name", label: "🔤 Name (A–Z)" },
  { value: "reviews", label: "💬 Most Reviewed" },
];

export default function PartnersPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [query, setQuery] = useState("");
  const [loc, setLoc] = useState("");
  const [service, setService] = useState("");
  const [sort, setSort] = useState<SortKey>("rating");
  const [view, setView] = useState<"grid" | "map">("grid");

  useEffect(() => {
    let active = true;
    fetchPartners().then((res) => {
      if (!active) return;
      const list = res.data?.items;
      if (list?.length) setItems(list);
    });
    return () => {
      active = false;
    };
  }, []);

  const allLocs = useMemo(
    () => Array.from(new Set(items.map((p) => p.loc))).sort(),
    [items]
  );

  const allServices = useMemo(
    () => Array.from(new Set(items.flatMap((p) => p.tags))).sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((p) => {
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.loc.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.menu.some((m) => m.name.toLowerCase().includes(q));
      const matchesLoc = !loc || p.loc === loc;
      const matchesServ = !service || p.tags.includes(service);
      return matchesQ && matchesLoc && matchesServ;
    });
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "reviews")
      list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [query, loc, service, sort, items]);

  const pins = useMemo(() => {
    const seen: Record<string, number> = {};
    return filtered.map((p) => {
      const base = localityPos[p.loc] ?? { x: 50, y: 50 };
      const n = seen[p.loc] ?? 0;
      seen[p.loc] = n + 1;
      const ox = (n % 2 === 0 ? 1 : -1) * n * 4;
      const oy = n > 0 ? n * 3 : 0;
      return { ...p, left: base.x + ox, top: base.y + oy };
    });
  }, [filtered]);

  const hasFilters = Boolean(query || loc || service);

  return (
    <div className="pb-16">
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">
            Home
          </Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">Partner Parlours</span>
        </div>
      </div>

      <section className="section pt-10">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="section-head">
            <p className="eyebrow">Our Network</p>
            <h2>Partner Beauty Parlours</h2>
            <p>
              Explore our network of premium beauty parlours &amp; salons across
              Lucknow. Browse their galleries, services and ratings.
            </p>
          </div>

          {/* Toolbar */}
          <div className="partner-toolbar">
            <div className="partner-search">
              <Search className="h-4 w-4 text-rose shrink-0" />
              <input
                placeholder="Search parlours, services or tags…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className="partner-select"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
            >
              <option value="">📍 All Localities</option>
              {allLocs.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              className="partner-select"
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              <option value="">💅 All Services</option>
              {allServices.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="partner-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className="view-toggle">
              <button
                className={view === "grid" ? "active" : ""}
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="h-4 w-4" /> Grid
              </button>
              <button
                className={view === "map" ? "active" : ""}
                onClick={() => setView("map")}
              >
                <Map className="h-4 w-4" /> Map
              </button>
            </div>
            {hasFilters && (
              <button
                className="partner-clear"
                onClick={() => {
                  setQuery("");
                  setLoc("");
                  setService("");
                  setSort("rating");
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Count + chips */}
          <div className="partner-count">
            <span>
              Showing <b>{filtered.length}</b> of {items.length} parlours
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
                {loc && (
                  <span className="fchip">
                    <span className="fk">📍</span> {loc}{" "}
                    <span className="fx" onClick={() => setLoc("")}>
                      ✕
                    </span>
                  </span>
                )}
                {service && (
                  <span className="fchip">
                    <span className="fk">💅</span> {service}{" "}
                    <span className="fx" onClick={() => setService("")}>
                      ✕
                    </span>
                  </span>
                )}
                <button
                  className="clear-all-chip"
                  onClick={() => {
                    setQuery("");
                    setLoc("");
                    setService("");
                  }}
                >
                  Clear all
                </button>
              </span>
            )}
          </div>

          {/* Grid view */}
          {view === "grid" && (
            <>
              {filtered.length === 0 ? (
                <div className="partner-empty">
                  <div className="ic">🔍</div>
                  <h3>No parlours found</h3>
                  <p style={{ marginTop: 8 }}>
                    Try a different search, locality or service.
                  </p>
                  <button
                    className="btn-outline mt-4"
                    onClick={() => {
                      setQuery("");
                      setLoc("");
                      setService("");
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="partner-grid">
                  {filtered.map((p) => (
                    <PartnerCard key={p.id} partner={p} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Map view */}
          {view === "map" && (
            <div className="map-wrap">
              <div className="map-canvas">
                <div className="road h" style={{ top: "22%", left: 0, right: 0 }} />
                <div className="road h" style={{ top: "58%", left: 0, right: 0 }} />
                <div className="road h" style={{ top: "82%", left: 0, right: 0 }} />
                <div className="road v" style={{ left: "28%", top: 0, bottom: 0 }} />
                <div className="road v" style={{ left: "62%", top: 0, bottom: 0 }} />
                <div className="road v" style={{ left: "85%", top: 0, bottom: 0 }} />
                <div
                  className="river"
                  style={{ width: "60%", height: 26, top: "40%", left: "20%" }}
                />
                <div className="map-label" style={{ top: "12%", left: "6%" }}>
                  North Lucknow
                </div>
                <div className="map-label" style={{ top: "44%", left: "44%" }}>
                  Gomti River
                </div>
                <div className="map-label" style={{ bottom: "6%", right: "8%" }}>
                  South Lucknow
                </div>
                {pins.map((p) => (
                  <Link
                    key={p.id}
                    href={`/partners/${p.slug}`}
                    className="map-pin"
                    style={{ left: `${p.left}%`, top: `${p.top}%` }}
                    title={p.name}
                  >
                    <div
                      className="bubble"
                      style={{ background: p.gradient }}
                    >
                      <span>{p.emoji}</span>
                      <span className="prate">⭐{p.rating}</span>
                    </div>
                    <div className="plabel">{p.name.split(" ")[0]}</div>
                  </Link>
                ))}
                <div className="map-legend">
                  📍 <b>{pins.length}</b> partner locations · tap a pin to view
                </div>
              </div>

              <div className="map-list">
                {filtered.length === 0 ? (
                  <div className="partner-empty">
                    <div className="ic">🗺️</div>
                    <p>No locations match your filters.</p>
                  </div>
                ) : (
                  filtered.map((p) => (
                    <Link
                      key={p.id}
                      href={`/partners/${p.slug}`}
                      className="map-item"
                    >
                      <div
                        className="mi-ph"
                        style={{ background: p.gradient }}
                      >
                        {p.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4>{p.name}</h4>
                        <div className="mi-loc">
                          📍 {p.loc}, Lucknow
                        </div>
                        <div className="mi-meta">
                          ⭐ {p.rating} · {p.reviews} reviews · {p.gallery.length} photos
                        </div>
                      </div>
                      <span style={{ color: "var(--rose)", fontSize: "1.2rem" }}>›</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}