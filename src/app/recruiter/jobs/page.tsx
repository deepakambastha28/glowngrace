"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BriefcaseBusiness, MapPin, Clock, Users, Plus, ArrowUpRight, Pencil, Pause } from "lucide-react";
import { RecruiterGuard } from "@/components/recruiter/recruiter-guard";
import { fetchAdminJobs, updateAdminJob, type AdminJobRecord } from "@/lib/api";
import { toast } from "sonner";
import { Preloader } from "@/components/preloader";

function statusPill(status: string) {
  const key = (status || "").toLowerCase();
  const cls =
    key === "open" ? "green"
: key === "closed" || key === "rejected" ? "red"
        : key.includes("pending") || key === "on hold" ? "amber"
          : "grey";
  return <span className={`p-pill ${cls}`}>{status}</span>;
}

function RecruiterJobsContent() {
  const router = useRouter();
  const [items, setItems] = useState<AdminJobRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminJobs().then((res) => {
      setItems(Array.isArray(res.data?.items) ? res.data!.items : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const holdJob = async (j: AdminJobRecord) => {
    if (!confirm(`Request to put "${j.title}" on hold? This needs admin approval.`)) return;
    const res = await updateAdminJob(j.id, { status: "Pending Hold" });
    if (res.ok) {
      toast.success("Hold request submitted for admin approval");
      load();
    } else {
      toast.error("Could not request hold");
    }
  };

  const statusNote = (j: AdminJobRecord) =>
    j.status === "Pending"
      ? "Awaiting admin approval to go live."
      : j.status === "Pending Hold"
        ? "Hold request awaiting admin approval."
        : j.status === "On Hold"
          ? "Currently on hold."
          : j.status === "Open"
            ? "Live on the careers board."
            : j.status === "Rejected"
              ? "Rejected by admin — edit to resubmit."
              : "This listing is closed.";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="mt-1 text-muted">
            Post vacancies for job-seekers and track review status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-4 py-2 text-sm text-emerald">
            <BriefcaseBusiness className="h-4 w-4" />
            {items.length} job(s)
          </div>
          <button onClick={() => router.push("/recruiter/jobs/new")} className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> Create Job
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card !shadow-lg p-8">
          <Preloader fullscreen={false} label="Loading jobs..." />
        </div>
      ) : items.length ? (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((job) => (
            <div key={job.id} className="card !shadow-lg p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold leading-snug">{job.title}</h3>
                  <div className="text-sm text-muted mt-0.5">{job.salon}</div>
                </div>
                <span className="job-type shrink-0">{job.type}</span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-charcoal/75">
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#2e9e6b]" /> {job.location}
                  </div>
                )}
                {job.salaryText && (
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4 text-[#2e9e6b]" /> {job.salaryText}/mo
                  </div>
                )}
                {job.experience && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#2e9e6b]" /> {job.experience}
                  </div>
                )}
                {job.openings != null && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#2e9e6b]" /> {job.openings} opening(s)
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {statusPill(job.status)}
                <span className="text-xs text-muted">{statusNote(job)}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => router.push(`/recruiter/jobs/${job.id}/edit`)}
                  className={`btn-outline !rounded-full w-full text-sm ${job.status === "Open" ? "!w-[calc(50%-0.25rem)]" : ""}`}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                {job.status === "Open" && (
                  <button
                    onClick={() => holdJob(job)}
                    className="w-[calc(50%-0.25rem)] inline-flex items-center justify-center gap-2 rounded-full border-[1.6px] border-amber px-8 py-3 font-body text-sm font-semibold tracking-wide text-amber transition-all duration-300 hover:bg-amber hover:text-white"
                  >
                    <Pause className="h-4 w-4" /> Hold
                  </button>
                )}
              </div>

              {job.status === "Open" && (
                <Link
                  href={`/careers/${job.slug}`}
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-full border border-emerald/40 bg-emerald/10 px-4 py-2 text-sm font-semibold text-emerald hover:bg-emerald/20 transition-colors"
                >
                  View on website <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card !shadow-lg p-10 text-center">
          <BriefcaseBusiness className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-muted">No jobs yet. Create your first vacancy to attract job-seekers.</p>
          <button onClick={() => router.push("/recruiter/jobs/new")} className="btn-primary mt-5 text-sm">
            <Plus className="h-4 w-4" /> Create Job
          </button>
        </div>
      )}
    </div>
  );
}

export default function RecruiterJobsPage() {
  return (
    <RecruiterGuard>
      <RecruiterJobsContent />
    </RecruiterGuard>
  );
}