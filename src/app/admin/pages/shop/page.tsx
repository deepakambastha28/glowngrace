"use client";

import { AdminGuard } from "@/components/admin/admin-guard";

export default function AdminPagesShopPage() {
  return (
    <AdminGuard>
      <div />
    </AdminGuard>
  );
}