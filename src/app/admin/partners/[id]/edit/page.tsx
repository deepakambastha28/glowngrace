"use client";

import { useParams } from "next/navigation";
import { AdminGuard } from "@/components/admin/admin-guard";
import { PartnerForm } from "@/components/admin/partner-form";

export default function EditPartnerPage() {
  const params = useParams();
  const id = String(params.id);
  return (
    <AdminGuard>
      <PartnerForm id={id} />
    </AdminGuard>
  );
}