"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";
import {
  fetchAdminRecruiters, updateAdminRecruiter, deleteAdminRecruiter,
  type RecruiterRecord,
} from "@/lib/api";
import { Trash2, Eye, Pause, Play, EyeOff } from "lucide-react";
import { toast } from "sonner";

const statusPill = (status: string) => {
  const key = (status || "").toLowerCase();
  const cls = key === "active" ? "green" : key === "on hold" ? "amber" : "grey";
  return <span className={`p-pill ${cls}`}>{status}</span>;
};

function RecruitersContent() {
  const [items, setItems] = useState<RecruiterRecord[]>([]);
  const [viewing, setViewing] = useState<RecruiterRecord | null>(null);

  const load = () => {
    fetchAdminRecruiters().then((res) => {
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
    });
  };

  useEffect(() => { load(); }, []);

  const patchStatus = async (r: RecruiterRecord, status: string) => {
    const res = await updateAdminRecruiter(r.id, { status });
    if (res.ok) {
      toast.success(`Recruiter ${status === "On Hold" ? "put on hold" : status === "Hidden" ? "hidden" : "activated"}`);
      load();
    } else {
      toast.error("Could not update recruiter");
    }
  };

  const handleDelete = async (r: RecruiterRecord) => {
    if (!confirm("Delete this recruiter?")) return;
    const res = await deleteAdminRecruiter(r.id);
    if (res.ok) {
      toast.success("Recruiter deleted");
      load();
    } else {
      toast.error("Could not delete recruiter");
    }
  };

  const status = (r: RecruiterRecord) => r.status || "Active";
  const isOnHold = (r: RecruiterRecord) => status(r) === "On Hold";
  const isHidden = (r: RecruiterRecord) => status(r) === "Hidden";

  return (
    <div>
      <AdminPageHead
        title="Recruiters"
        subtitle={`${items.length} recruiter accounts.`}
        actionLabel=""
        actionHref=""
      />

      {viewing && (
        <div className="card !shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Recruiter Details</h3>
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
            <div><span className="text-muted">Phone:</span> <b>{viewing.phone}</b></div>
            <div><span className="text-muted">Company:</span> <b>{viewing.company || "N/A"}</b></div>
            <div><span className="text-muted">Designation:</span> <b>{viewing.designation || "N/A"}</b></div>
            <div><span className="text-muted">City:</span> <b>{viewing.city || "N/A"}</b></div>
            <div><span className="text-muted">Status:</span> {statusPill(status(viewing))}</div>
          </div>
          {viewing.bio && (
            <p className="mt-4 text-sm text-charcoal/75 leading-relaxed">{viewing.bio}</p>
          )}
        </div>
      )}

      <div className="card !shadow-lg overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Recruiter</th>
                <th>Company</th>
                <th>City</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#2e9e6b] to-emerald text-white text-sm font-bold">
                          {r.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{r.fullName}</div>
                          <div className="text-xs text-muted">{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{r.company || "—"}</td>
                    <td>{r.city || "—"}</td>
                    <td>{r.designation || "—"}</td>
                    <td>{statusPill(status(r))}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewing(r)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f1fa] text-[#3b82c9] hover:bg-[#3b82c9] hover:text-white transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!isHidden(r) && (
                          <button
                            onClick={() => patchStatus(r, isOnHold(r) ? "Active" : "On Hold")}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-[#fdf3e3] text-[#c98a3b] hover:bg-[#c98a3b] hover:text-white transition-colors"
                            title={isOnHold(r) ? "Activate" : "Hold"}
                          >
                            {isOnHold(r) ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => patchStatus(r, isHidden(r) ? "Active" : "Hidden")}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#f1f1f4] text-muted hover:bg-muted hover:text-white transition-colors"
                          title={isHidden(r) ? "Unhide" : "Hide"}
                        >
                          {isHidden(r) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
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
                  <td colSpan={6} className="text-center text-muted py-10">
                    No recruiter accounts yet. Recruiters who create profiles will appear here.
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

export default function AdminRecruitersPage() {
  return (
    <AdminGuard>
      <RecruitersContent />
    </AdminGuard>
  );
}