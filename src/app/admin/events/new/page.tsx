"use client";

import { AdminGuard } from "@/components/admin/admin-guard";
import { EventForm } from "@/components/admin/event-form";

export default function AddEventPage() {
  return (
    <AdminGuard>
      <EventForm />
    </AdminGuard>
  );
}
