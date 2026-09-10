"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";
import { adminFetchCandidates, adminDeleteCandidate, updateAdminCandidate, type CandidateRecord } from "@/lib/api";
import { Trash2, Eye, Pencil, Pause, Play, EyeOff } from "lucide-react";
import { toast } from "sonner";

const statusPill = (status: string) => {
  const key = (status || "").toLowerCase();
  const cls = key === "active" ? "green" : key === "on hold" ? "amber" : "grey";
  return <span className={`p-pill ${cls}`}>{status}</span>;
};

function CandidatesContent() {
  const router = useRouter();
  const [items, setItems] = useState<CandidateRecord[]>([]);
  const [viewing, setViewing] = useState<CandidateRecord | null>(null);

  const load = () => {
    adminFetchCandidates().then((res) => {
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
    });
  };

  useEffect(() => { load(); }, []);

  const patchStatus = async (c: CandidateRecord, status: string) => {
    const res = await updateAdminCandidate(c.id, { status });
    if (res.ok) {
      toast.success(`Candidate ${status === "On Hold" ? "put on hold" : status === "Hidden" ? "hidden" : "activated"}`);
      load();
    } else {
      toast.error("Could not update candidate");
    }
  };

  const handleDelete = async (c: CandidateRecord) => {
    if (!confirm("Delete this candidate profile?")) return;
    const res = await adminDeleteCandidate(Number(c.id));
    if (res.ok) {
      toast.success("Candidate deleted");
      load();
    } else {
      toast.error("Could not delete candidate");
    }
  };

  const status = (c: CandidateRecord) => c.status || "Active";
  const isOnHold = (c: CandidateRecord) => status(c) === "On Hold";
  const isHidden = (c: CandidateRecord) => status(c) === "Hidden";

  return (
    <div>
      <AdminPageHead
        title="Candidates"
        subtitle={`${items.length} candidate profiles.`}
        actionLabel=""
        actionHref=""
      />

      {viewing && (
        <div className="card !shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Candidate Details</h3>
            <button
              onClick={() => setViewing(null)}
              className="text-muted hover:text-rose text-sm font-semibold"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted">Name:</span> <b>{viewing.fullName}</b></div>
            <div><span className="text-muted">Email:</span> <b>{viewing.email}</b></div>
            <div><span className="text-muted">City:</span> <b>{viewing.city}</b></div>
            <div><span className="text-muted">Experience:</span> <b>{viewing.experience || "N/A"}</b></div>
            <div><span className="text-muted">Specialization:</span> <b>{viewing.specialization || "N/A"}</b></div>
            <div><span className="text-muted">Status:</span> {statusPill(viewing.status)}</div>
          </div>
          {viewing.gallery.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-muted mb-2">Gallery ({viewing.gallery.length} images)</div>
              <div className="flex gap-2 flex-wrap">
                {viewing.gallery.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" className="h-16 w-16 rounded-[8px] object-cover border border-line" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card !shadow-lg overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>City</th>
                <th>Experience</th>
                <th>Specialization</th>
                <th>Gallery</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-rose-soft to-rose text-white text-sm font-bold">
                          {c.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{c.fullName}</div>
                          <div className="text-xs text-muted">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.city}</td>
                    <td>{c.experience || "—"}</td>
                    <td>{c.specialization || "—"}</td>
                    <td>{c.gallery.length} img(s)</td>
                    <td>{statusPill(status(c))}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewing(c)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f1fa] text-[#3b82c9] hover:bg-[#3b82c9] hover:text-white transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!isHidden(c) && (
                          <button
                            onClick={() => patchStatus(c, isOnHold(c) ? "Active" : "On Hold")}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-[#fdf3e3] text-[#c98a3b] hover:bg-[#c98a3b] hover:text-white transition-colors"
                            title={isOnHold(c) ? "Activate" : "Hold"}
                          >
                            {isOnHold(c) ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => patchStatus(c, isHidden(c) ? "Active" : "Hidden")}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#f1f1f4] text-muted hover:bg-muted hover:text-white transition-colors"
                          title={isHidden(c) ? "Unhide" : "Hide"}
                        >
                          {isHidden(c) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => router.push(`/admin/candidates/${c.id}/edit`)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f1fa] text-[#3b82c9] hover:bg-[#3b82c9] hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
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
                    No candidate profiles yet.
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

export default function AdminCandidatesPage() {
  return (
    <AdminGuard>
      <CandidatesContent />
    </AdminGuard>
  );
}