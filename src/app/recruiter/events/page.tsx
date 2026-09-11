"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Plus, Clock, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { RecruiterGuard } from "@/components/recruiter/recruiter-guard";
import { fetchAdminEvents, type AdminEventRecord } from "@/lib/api";

function RecruiterEventsContent() {
  const router = useRouter();
  const [items, setItems] = useState<AdminEventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminEvents().then((res) => {
      setItems(Array.isArray(res.data?.items) ? res.data!.items : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (iso: string) => {
    if (!iso) return "Date TBD";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="mt-1 text-muted">
            Plan and publish beauty workshops, masterclasses &amp; expos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-4 py-2 text-sm text-emerald">
            <CalendarDays className="h-4 w-4" />
            {items.length} event(s)
          </div>
          <button onClick={() => router.push("/recruiter/events/new")} className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> Create Event
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card !shadow-lg p-8 text-center text-muted">Loading events…</div>
      ) : items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((e) => (
            <div key={e.id} className="card !shadow-lg overflow-hidden">
              <div
                className="relative px-6 py-5 text-center text-white"
                style={{ background: e.gradient }}
              >
                <span className="text-[2.6rem] leading-none">{e.emoji}</span>
                <div className="mt-1 text-[0.65rem] tracking-widest font-bold uppercase opacity-80">
                  {e.category || "Event"}
                </div>
                <div className="font-heading text-lg font-semibold truncate">{e.title}</div>
                <div className="mt-0.5 text-xs text-white/85">
                  {formatDate(e.date)} · {e.time}
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-charcoal/80">
                    <MapPin className="h-4 w-4 shrink-0 text-muted" />
                    {e.loc || "Location TBD"} {e.venue ? `· ${e.venue}` : ""}
                  </div>
                  <div className="flex items-center gap-2 text-charcoal/80">
                    <Users className="h-4 w-4 shrink-0 text-muted" />
                    {e.spotsLeft}/{e.capacity} seats left
                  </div>
                  <div className="flex items-center gap-2 text-charcoal/80">
                    <Clock className="h-4 w-4 shrink-0 text-muted" />
                    <span className="font-semibold">{e.price || "Free"}</span>
                    {e.hidden && <span className="p-pill amber ml-auto">Hidden</span>}
                    {!e.hidden && <span className="p-pill green ml-auto">Live</span>}
                  </div>
                </div>
                {(e.tags || []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {e.tags.slice(0, 4).map((t) => (
                      <span key={t} className="rounded-full bg-rose-blush px-2.5 py-0.5 text-xs text-rose">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  href="/events"
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-emerald/40 bg-emerald/10 px-4 py-2 text-sm font-semibold text-emerald hover:bg-emerald/20 transition-colors"
                >
                  View on website <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card !shadow-lg p-10 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-muted">No events yet. Create your first event to reach job-seekers.</p>
          <button onClick={() => router.push("/recruiter/events/new")} className="btn-primary mt-5 text-sm">
            <Plus className="h-4 w-4" /> Create Event
          </button>
        </div>
      )}
    </div>
  );
}

export default function RecruiterEventsPage() {
  return (
    <RecruiterGuard>
      <RecruiterEventsContent />
    </RecruiterGuard>
  );
}