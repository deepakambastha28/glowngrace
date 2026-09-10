"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";
import { cn } from "@/lib/utils";
import { fetchAdminPartners, updateAdminPartner, deleteAdminPartner, type AdminPartnerRecord } from "@/lib/api";
import { Pause, Play, EyeOff, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const statusPill = (status: string) => {
  const key = (status || "").toLowerCase();
  const cls = key === "active" ? "green" : key === "on hold" ? "amber" : "grey";
  return <span className={cn("p-pill", cls)}>{status}</span>;
};

function PartnersContent() {
  const router = useRouter();
  const [items, setItems] = useState<AdminPartnerRecord[]>([]);
  const [count, setCount] = useState(0);

  const load = () => {
    fetchAdminPartners().then((res) => {
      const list = Array.isArray(res.data?.items) ? res.data!.items : [];
      setItems(list);
      setCount(list.length);
    });
  };

  useEffect(() => { load(); }, []);

  const patchStatus = async (p: AdminPartnerRecord, status: string) => {
    const res = await updateAdminPartner(p.id, { status });
    if (res.ok) {
      toast.success(`Partner ${status === "On Hold" ? "put on hold" : status === "Hidden" ? "hidden" : "activated"}`);
      load();
    } else {
      toast.error("Could not update partner");
    }
  };

  const handleDelete = async (p: AdminPartnerRecord) => {
    if (!confirm(`Delete partner "${p.name}"? This cannot be undone.`)) return;
    const res = await deleteAdminPartner(p.id);
    if (res.ok) {
      toast.success("Partner deleted");
      load();
    } else {
      toast.error("Could not delete partner");
    }
  };

  const status = (p: AdminPartnerRecord) => p.status || "Active";
  const isOnHold = (p: AdminPartnerRecord) => status(p) === "On Hold";
  const isHidden = (p: AdminPartnerRecord) => status(p) === "Hidden";

  return (
    <div>
      <AdminPageHead
        title="Partners"
        subtitle={`${count} partners in directory.`}
        actionLabel="Add Partner"
        actionHref="/admin/partners/new"
      />
      <div className="card !shadow-lg overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Type</th>
                <th>Location</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="!text-center !py-10 text-muted">
                    No partners added yet.
                  </td>
                </tr>
              )}
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{p.type}</td>
                  <td className="text-muted">{p.loc}</td>
                  <td>{p.rating.toFixed(1)}</td>
                  <td>{p.reviews}</td>
                  <td>{statusPill(status(p))}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/partners/${p.id}/edit`)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f1fa] text-[#3b82c9] hover:bg-[#3b82c9] hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {!isHidden(p) && (
                        <button
                          onClick={() => patchStatus(p, isOnHold(p) ? "Active" : "On Hold")}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#fdf3e3] text-[#c98a3b] hover:bg-[#c98a3b] hover:text-white transition-colors"
                          title={isOnHold(p) ? "Activate" : "Hold"}
                        >
                          {isOnHold(p) ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => patchStatus(p, isHidden(p) ? "Active" : "Hidden")}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-[#f1f1f4] text-muted hover:bg-muted hover:text-white transition-colors"
                        title={isHidden(p) ? "Unhide" : "Hide"}
                      >
                        {isHidden(p) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-[#fdeaea] text-red hover:bg-red hover:text-white transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminPartnersPage() {
  return (
    <AdminGuard>
      <PartnersContent />
    </AdminGuard>
  );
}