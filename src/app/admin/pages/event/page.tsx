"use client";

import { AdminGuard } from "@/components/admin/admin-guard";

export default function AdminPagesEventPage() {
  return (
    <AdminGuard>
      <div />
    </AdminGuard>
  );
}