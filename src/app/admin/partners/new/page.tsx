"use client";

import { AdminGuard } from "@/components/admin/admin-guard";
import { PartnerForm } from "@/components/admin/partner-form";

export default function AddPartnerPage() {
  return (
    <AdminGuard>
      <PartnerForm />
    </AdminGuard>
  );
}