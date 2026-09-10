"use client";

import { useParams } from "next/navigation";
import { AdminGuard } from "@/components/admin/admin-guard";
import { JobForm } from "@/components/admin/job-form";

export default function EditJobPage() {
  const params = useParams();
  const id = String(params.id);
  return (
    <AdminGuard>
      <JobForm id={id} />
    </AdminGuard>
  );
}