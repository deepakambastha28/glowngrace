"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";
import { fetchAdminJobs, updateAdminJob, deleteAdminJob, type AdminJobRecord } from "@/lib/api";
import { EyeOff, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const statusPill = (status: string) => {
  const key = (status || "").toLowerCase();
  const cls = key === "open" ? "green" : key === "closed" ? "red" : "grey";
  return <span className={`p-pill ${cls}`}>{status}</span>;
};

function JobsContent() {
  const router = useRouter();
  const [items, setItems] = useState<AdminJobRecord[]>([]);
  const [count, setCount] = useState(0);

  const load = () => {
    fetchAdminJobs().then((res) => {
      const list = Array.isArray(res.data?.items) ? res.data!.items : [];
      setItems(list);
      setCount(list.length);
    });
  };

  useEffect(() => { load(); }, []);

  const toggleHide = async (j: AdminJobRecord) => {
    const res = await updateAdminJob(j.id, { hidden: !j.hidden });
    if (res.ok) {
      toast.success(j.hidden ? "Job is now visible" : "Job hidden");
      load();
    } else {
      toast.error("Could not update visibility");
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
        subtitle={`${count} active vacancies.`}
        actionLabel="Add Job"
        actionHref="/admin/jobs/new"
      />
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
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/jobs/${j.id}/edit`)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f1fa] text-[#3b82c9] hover:bg-[#3b82c9] hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleHide(j)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#f1f1f4] text-muted hover:bg-muted hover:text-white transition-colors"
                          title={j.hidden ? "Unhide" : "Hide"}
                        >
                          {j.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
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