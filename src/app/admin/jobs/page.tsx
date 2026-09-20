"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";
import { fetchAdminJobs, updateAdminJob, deleteAdminJob, type AdminJobRecord } from "@/lib/api";
import { Eye, X, CheckCircle2, Pause, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusPill = (status: string) => {
  const key = (status || "").toLowerCase();
  const cls =
    key === "open" ? "green"
: key === "closed" || key === "rejected" ? "red"
          : key.includes("pending") || key === "on hold" ? "amber"
            : "grey";
  return <span className={`p-pill ${cls}`}>{status}</span>;
};

const formatDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

function JobsContent() {
  const router = useRouter();
  const [items, setItems] = useState<AdminJobRecord[]>([]);
  const [count, setCount] = useState(0);
  const [viewing, setViewing] = useState<AdminJobRecord | null>(null);

  const load = () => {
    fetchAdminJobs().then((res) => {
      const list = Array.isArray(res.data?.items) ? res.data!.items : [];
      setItems(list);
      setCount(list.length);
    });
  };

  useEffect(() => { load(); }, []);

  const patchStatus = async (j: AdminJobRecord, status: "Open" | "On Hold" | "Rejected") => {
    const res = await updateAdminJob(j.id, { status });
    if (res.ok) {
      toast.success(
        status === "Open" ? "Job accepted and published"
          : status === "Rejected" ? "Job rejected"
            : "Job put on hold"
      );
      setViewing(null);
      load();
    } else {
      toast.error("Could not update job status");
    }
  };

  const toggleVerified = async (j: AdminJobRecord) => {
    const res = await updateAdminJob(j.id, { verified: !j.verified });
    if (res.ok) {
      toast.success(j.verified ? "Listing marked as Standard" : "Listing verified as a Genuine Job Hunt");
      load();
    } else {
      toast.error("Could not update verified flag");
    }
  };

  const handleDelete = async (j: AdminJobRecord) => {
    if (!confirm(`Delete the job "${j.title}"? This cannot be undone.`)) return;
    const res = await deleteAdminJob(j.id);
    if (res.ok) {
      toast.success("Job deleted");
      load();
    } else {
      toast.error("Could not delete job");
    }
  };

  return (
    <div>
      <AdminPageHead
        title="Jobs"
        subtitle={`${count} vacancies from recruiters. Accept to publish, or put on hold.`}
      />

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          data-testid="job-detail-modal"
        >
          <button
            type="button"
            aria-label="Close job details"
            onClick={() => setViewing(null)}
            className="fixed inset-0 z-0 cursor-default bg-charcoal/40 backdrop-blur-sm"
          />
          <div className="card relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto !rounded-[20px] p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="job-type shrink-0">{viewing.type}</span>
                  {statusPill(viewing.status)}
                </div>
                <h3 className="mt-2 text-xl font-bold text-charcoal leading-snug">{viewing.title}</h3>
                <p className="mt-0.5 text-sm text-muted">🏢 {viewing.salon}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="text-muted transition-colors hover:text-rose cursor-pointer"
                aria-label="Close job details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-muted">Location</span>
                <b>{viewing.location}</b>
              </div>
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-muted">Salary</span>
                <b className="text-rose">{viewing.salaryText}/mo</b>
              </div>
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-muted">Experience</span>
                <b>{viewing.experience}</b>
              </div>
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-muted">Openings</span>
                <b>{viewing.openings} position(s)</b>
              </div>
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-muted">Posted</span>
                <b>{formatDate(viewing.createdAt)}</b>
              </div>
              {viewing.hidden && (
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-muted">Visibility</span>
                  <b>Hidden</b>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-muted">Listing type</span>
                <b>
                  {viewing.verified ? (
                    <span className="verified-badge ml-0">✓ Genuine Job Hunt</span>
                  ) : (
                    "Standard"
                  )}
                </b>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleVerified(viewing)}
              className="mt-4 flex w-full items-center justify-between rounded-xl border border-line bg-cream/40 px-4 py-3 text-left text-sm"
              data-testid="toggle-verified-listing"
            >
              <span>
                <b className="text-charcoal">Verified listing</b>
                <span className="block text-xs text-muted">
                  Flag this job as a Genuine Job Hunt Listing — visible only to Pro / Pro Max members.
                </span>
              </span>
              <span
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-bold",
                  viewing.verified ? "bg-gold text-white" : "bg-white text-muted shadow-sm"
                )}
              >
                {viewing.verified ? "Verified" : "Not verified"}
              </span>
            </button>

            {viewing.description && (
              <div className="mt-5">
                <p className="text-[0.85rem] font-semibold text-charcoal">Job Description</p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-charcoal/75">
                  {viewing.description}
                </p>
              </div>
            )}

            {Array.isArray(viewing.responsibilities) && viewing.responsibilities.length > 0 && (
              <div className="mt-5">
                <p className="text-[0.85rem] font-semibold text-charcoal">Responsibilities</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-charcoal/75">
                  {viewing.responsibilities.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(viewing.requirements) && viewing.requirements.length > 0 && (
              <div className="mt-5">
                <p className="text-[0.85rem] font-semibold text-charcoal">Key Requirements</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-charcoal/75">
                  {viewing.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(viewing.perks) && viewing.perks.length > 0 && (
              <div className="mt-5">
                <p className="text-[0.85rem] font-semibold text-charcoal">Perks &amp; Benefits</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {viewing.perks.map((perk, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose-blush px-3 py-1.5 text-sm text-charcoal/80"
                    >
                      <span className="text-rose">✦</span> {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {viewing.status === "Pending Hold" && (
              <div className="mt-5 rounded-xl bg-amber/10 px-4 py-3 text-sm text-amber">
                Recruiter requested to put this job on hold. Approve to take it off
                the website, or reject to keep it live.
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => patchStatus(viewing, viewing.status === "Pending Hold" ? "Open" : "Rejected")}
                disabled={viewing.status === (viewing.status === "Pending Hold" ? "Open" : "Rejected")}
                className="btn-outline flex flex-1 items-center justify-center gap-1.5 border-red text-red text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                {viewing.status === "Pending Hold" ? "Reject Hold" : "Reject"}
              </button>
              <button
                onClick={() => patchStatus(viewing, viewing.status === "Pending Hold" ? "On Hold" : "Open")}
                disabled={viewing.status === (viewing.status === "Pending Hold" ? "On Hold" : "Open")}
                className="btn-primary flex flex-1 items-center justify-center gap-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {viewing.status === "Pending Hold" ? "Approve Hold" : "Accept"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card !shadow-lg overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Position</th><th>Salon</th><th>Location</th><th>Salary</th><th>Type</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((j) => (
                  <tr key={j.id}>
                    <td className="font-semibold">{j.title}</td>
                    <td>{j.salon}</td>
                    <td>{j.location}</td>
                    <td className="font-semibold">{j.salaryText}/mo</td>
                    <td><span className="p-pill grey">{j.type}</span></td>
                    <td>
                      {statusPill(j.status)}
                      {j.hidden && <span className="p-pill grey ml-1">Hidden</span>}
                      {j.verified && <span className="p-pill ml-1" style={{ background: "var(--gold)", color: "#fff" }}>Verified</span>}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewing(j)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f1fa] text-[#3b82c9] hover:bg-[#3b82c9] hover:text-white transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/jobs/${j.id}/edit`)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f1fa] text-[#3b82c9] hover:bg-[#3b82c9] hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {j.status !== "Open" && (
                          <button
                            onClick={() => patchStatus(j, j.status === "Pending Hold" ? "On Hold" : "Open")}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-[#eaf7f0] text-[#2e9e6b] hover:bg-[#2e9e6b] hover:text-white transition-colors"
                            title={j.status === "Pending Hold" ? "Approve hold request" : "Accept"}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {j.status !== "On Hold" && j.status !== "Pending Hold" && (
                          <button
                            onClick={() => patchStatus(j, "On Hold")}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-[#fdf3e3] text-[#c98a3b] hover:bg-[#c98a3b] hover:text-white transition-colors"
                            title="Hold"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(j)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#fdeaea] text-red hover:bg-red hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-10">
                    No jobs posted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminJobsPage() {
  return (
    <AdminGuard>
      <JobsContent />
    </AdminGuard>
  );
}