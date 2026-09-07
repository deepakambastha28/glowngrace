"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";

interface AdminJob {
  id: string;
  title: string;
  salon: string;
  location: string;
  salaryText: string;
  type: string;
  status: string;
}

const statusPill = (status: string) => {
  const key = (status || "").toLowerCase();
  const cls = key === "open" ? "green" : key === "closed" ? "red" : "grey";
  return <span className={`p-pill ${cls}`}>{status}</span>;
};

function JobsContent() {
  const [items, setItems] = useState<AdminJob[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/jobs")
      .then((r) => r.json())
      .then((d) => {
        setItems(Array.isArray(d.items) ? d.items : []);
        setCount(Array.isArray(d.items) ? d.items.length : 0);
      })
      .catch(() => {/* ignore */});
  }, []);

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
                <th>Position</th><th>Salon</th><th>Location</th><th>Salary</th><th>Type</th><th>Status</th>
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
                    <td>{statusPill(j.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-10">
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
