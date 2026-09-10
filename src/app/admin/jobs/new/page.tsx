"use client";

import { AdminGuard } from "@/components/admin/admin-guard";
import { JobForm } from "@/components/admin/job-form";

export default function AddJobPage() {
  return (
    <AdminGuard>
      <JobForm />
    </AdminGuard>
  );
}