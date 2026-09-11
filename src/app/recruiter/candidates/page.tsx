"use client";

import { useCallback, useEffect, useState } from "react";
import { UserSearch, Phone, Mail, MapPin, Eye, EyeOff, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";
import {
  fetchRecruiterCandidates, fetchHiredCandidates, hireCandidate,
  type CandidateRecord,
} from "@/lib/api";

const statusPill = (status: string) => {
  const key = (status || "").toLowerCase();
  const cls = key === "hired" ? "green" : key === "on hold" ? "amber" : "grey";
  return <span className={`p-pill ${cls}`}>{status}</span>;
};

export default function RecruiterCandidatesPage() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<CandidateRecord[]>([]);
  const [hiredIds, setHiredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(() => {
    setLoading(true);
    fetchRecruiterCandidates().then((res) => {
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
      setLoading(false);
    });
    if (user) {
      fetchHiredCandidates(user.email).then((res) => {
        const h = Array.isArray(res.data?.items) ? res.data.items : [];
        setHiredIds(new Set(h.map((c) => c.id)));
      });
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.fullName.toLowerCase().includes(q) ||
      (c.specialization || "").toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (c.skills || []).some((s) => s.toLowerCase().includes(q))
    );
  });

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleHire = async (c: CandidateRecord) => {
    if (hiredIds.has(c.id)) return;
    if (!user) return;
    if (!confirm(`Hire ${c.fullName} for your team? They will be marked as hired.`)) return;
    const res = await hireCandidate({
      candidateId: c.id,
      recruiterEmail: user.email,
      candidateName: c.fullName,
      candidateEmail: c.email,
    });
    if (res.ok && res.data?.hired) {
      toast.success(`${c.fullName} hired! 🎉`);
      load();
    } else {
      toast.error(res.data?.error || "Could not hire candidate");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="mt-1 text-muted">Browse talent, view profiles, contact &amp; hire.</p>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-emerald/30 bg-emerald/10 px-4 py-2 text-sm text-emerald">
          <UserSearch className="h-4 w-4" />
          {items.length} active candidate(s)
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 max-w-md">
        <Search className="h-4 w-4 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, specialisation, city, or skill…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          aria-label="Search candidates"
        />
      </div>

      {loading ? (
        <div className="card !shadow-lg p-8 text-center text-muted">Loading candidates…</div>
      ) : filtered.length ? (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const open = expanded[c.id];
            const hired = hiredIds.has(c.id);
            return (
              <div key={c.id} className="card !shadow-lg overflow-hidden">
                <div className="relative bg-gradient-to-br from-rose-soft to-rose px-6 py-5 text-white">
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-white/20 text-2xl font-bold ring-2 ring-white/40">
                      {c.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-bold truncate">{c.fullName}</div>
                      <div className="text-sm text-white/85">{c.specialization || "General Beautician"}</div>
                      <div className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {c.city}
                      </div>
                    </div>
                    {hired ? statusPill("Hired") : statusPill(c.status || "Active")}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full bg-[#fdf3e3] px-3 py-1 font-semibold text-[#c98a3b]">
                      ⚡ {c.experience || "Fresher"}
                    </span>
                    {c.qualification && (
                      <span className="rounded-full bg-[#e9f1fa] px-3 py-1 font-semibold text-[#3b82c9]">
                        🎓 {c.qualification}
                      </span>
                    )}
                  </div>

                  {(c.skills || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.skills.slice(0, open ? undefined : 4).map((sk, i) => (
                        <span key={i} className="rounded-full bg-rose-blush px-2.5 py-0.5 text-xs text-rose">
                          {sk}
                        </span>
                      ))}
                      {!open && c.skills.length > 4 && (
                        <button
                          onClick={() => toggleExpand(c.id)}
                          className="text-xs text-muted hover:text-rose font-semibold"
                        >
                          +{c.skills.length - 4} more
                        </button>
                      )}
                    </div>
                  )}

                  {open && c.bio && (
                    <p className="mt-3 text-sm text-charcoal/75 leading-relaxed">{c.bio}</p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={`tel:${c.phone}`}
                      className="btn-outline !rounded-full px-4 py-2 text-sm"
                    >
                      <Phone className="h-4 w-4" /> {c.phone}
                    </a>
                    <a
                      href={`mailto:${c.email}`}
                      className="btn-outline !rounded-full px-4 py-2 text-sm"
                    >
                      <Mail className="h-4 w-4" /> Email
                    </a>
                    <button
                      onClick={() => toggleExpand(c.id)}
                      className="btn-outline !rounded-full px-4 py-2 text-sm"
                    >
                      {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {open ? "Less" : "Profile"}
                    </button>
                  </div>

                  {!hired && (c.status || "Active") !== "Active" ? (
                    <p className="mt-4 rounded-full bg-[#fdf3e3] px-4 py-2 text-center text-sm text-[#c98a3b]">
                      {c.status} — candidate unavailable for hire
                    </p>
                  ) : hired ? (
                    <p className="mt-4 rounded-full bg-emerald/15 px-4 py-2 text-center text-sm text-emerald font-semibold">
                      ✔ Hired by you
                    </p>
                  ) : (
                    <button
                      onClick={() => handleHire(c)}
                      className="btn-primary mt-4 w-full"
                    >
                      Hire {c.fullName.split(" ")[0]}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card !shadow-lg p-10 text-center">
          <UserSearch className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-muted">No candidates match your search.</p>
        </div>
      )}
    </div>
  );
}