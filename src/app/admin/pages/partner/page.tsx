"use client";

import { AdminGuard } from "@/components/admin/admin-guard";

export default function AdminPagesPartnerPage() {
  return (
    <AdminGuard>
      <div />
    </AdminGuard>
  );
}