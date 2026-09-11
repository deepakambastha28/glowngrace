"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { UserSearch, BriefcaseBusiness, Users, CheckCircle2, ArrowRight, type LucideIcon } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { fetchRecruiter, fetchRecruiterCandidates, fetchHiredCandidates } from "@/lib/api";
import type { RecruiterRecord, CandidateRecord } from "@/lib/api";

export default function RecruiterDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<RecruiterRecord | null>(null);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [hired, setHired] = useState<CandidateRecord[]>([]);

  const load = useCallback(() => {
    if (!user) return;
    fetchRecruiter(user.email).then((res) => {
      setProfile(res.data?.recruiter ?? null);
    });
    fetchRecruiterCandidates().then((res) => {
      setCandidates(Array.isArray(res.data?.items) ? res.data.items : []);
    });
    fetchHiredCandidates(user.email).then((res) => {
      setHired(Array.isArray(res.data?.items) ? res.data.items : []);
    });
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const spl = (arr: CandidateRecord[]) => {
    const counts: Record<string, number> = {};
    arr.forEach((c) => {
      const key = c.specialization || "General";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  };

  const stats: Array<{ icon: LucideIcon; cls: string; label: string; value: string; href?: string }> = [
    {
      icon: UserSearch,
      cls: "bg-[#eaf7f0] text-[#2e9e6b]",
      label: "Active Candidates",
      value: String(candidates.length),
    },
    {
      icon: BriefcaseBusiness,
      cls: "bg-[#c9e9d8] text-[#1c7146]",
      label: "My Company",
      value: profile?.company || "Not set",
    },
    {
      icon: Users,
      cls: "bg-[#e9f1fa] text-[#3b82c9]",
      label: "Candidates Hired",
      value: String(hired.length),
    },
    {
      icon: CheckCircle2,
      cls: "bg-[#fdf3e3] text-[#c98a3b]",
      label: "Open Positions",
      value: "View Jobs",
      href: "/recruiter/jobs",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted">
            Welcome back, {profile?.fullName || user?.name || "Recruiter"} — browse talent and grow your team.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card !shadow-lg p-6">
            <div className={`grid h-12 w-12 place-items-center rounded-[13px] text-xl ${s.cls}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div className="mt-4">
              <div className="font-heading text-2xl font-bold truncate">
                {s.href ? (
                  <Link href={s.href} className="text-[#2e9e6b] hover:underline">
                    {s.value}
                  </Link>
                ) : (
                  s.value
                )}
              </div>
              <p className="text-muted text-sm">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="card !shadow-lg p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Top Specialisations</h3>
            <Link href="/recruiter/candidates" className="text-sm text-[#2e9e6b] font-semibold hover:underline">
              View all candidates →
            </Link>
          </div>
          {spl(candidates).length ? (
            <div className="space-y-4">
              {spl(candidates).map(([spec, count], i) => (
                <div key={spec}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{spec}</span>
                    <span className="text-muted">{count} candidate(s)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-line-soft overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2e9e6b] to-[#7edaa8]"
                      style={{ width: `${Math.min(100, (count / Math.max(1, candidates.length)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {Array.from({ length: 3 - spl(candidates).length }).map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted">—</span>
                    <span className="text-muted">0</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-line-soft overflow-hidden">
                    <div className="h-full rounded-full bg-line-soft w-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted py-8 text-center">
              No candidate profiles available yet.
            </p>
          )}
        </div>

        <div className="card !shadow-lg p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">My Hiring</h3>
            <Link href="/recruiter/candidates" className="text-sm text-[#2e9e6b] font-semibold hover:underline">
              Browse talent →
            </Link>
          </div>
          {hired.length ? (
            <ul className="space-y-3">
              {hired.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[#2e9e6b] text-white text-sm font-bold">
                    {c.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{c.fullName}</div>
                    <div className="text-xs text-muted truncate">{c.specialization || "General"}</div>
                  </div>
                  <span className="p-pill green">Hired</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted py-8 text-center">
              No hires yet. Start exploring candidate profiles below.
            </p>
          )}
        </div>
      </div>

      <div className="card !shadow-lg mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Candidates</h3>
          <Link href="/recruiter/candidates" className="flex items-center gap-1 text-sm text-[#2e9e6b] font-semibold hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.slice(0, 6).map((c) => (
            <div key={c.id} className="rounded-xl border border-line p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-rose-soft to-rose text-white text-sm font-bold">
                  {c.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{c.fullName}</div>
                  <div className="text-xs text-muted truncate">{c.specialization || "General"} · {c.city}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(c.skills || []).slice(0, 3).map((sk, i) => (
                  <span key={i} className="rounded-full bg-rose-blush px-2 py-0.5 text-xs text-rose">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {candidates.length === 0 && (
            <p className="text-sm text-muted py-6 col-span-full text-center">
              No candidates yet. Check back soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}