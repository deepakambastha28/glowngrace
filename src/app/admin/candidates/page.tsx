"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";
import { adminFetchCandidates, adminDeleteCandidate } from "@/lib/api";
import { Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Candidate {
  id: string;
  fullName: string;
  email: string;
  city: string;
  experience: string;
  specialization: string;
  status: string;
  gallery: string[];
  createdAt: string;
}

function CandidatesContent() {
  const [items, setItems] = useState<Candidate[]>([]);
  const [viewing, setViewing] = useState<Candidate | null>(null);

  const load = () => {
    adminFetchCandidates().then((res) => {
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
    });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this candidate profile?")) return;
    const res = await adminDeleteCandidate(Number(id));
    if (res.ok) {
      toast.success("Candidate deleted");
      load();
    }
  };

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
            <div><span className="text-muted">Status:</span> <span className="p-pill green">{viewing.status}</span></div>
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
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewing(c)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f1fa] text-[#3b82c9] hover:bg-[#3b82c9] hover:text-white transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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
