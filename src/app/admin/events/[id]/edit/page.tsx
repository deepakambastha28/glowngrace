"use client";

import { AdminGuard } from "@/components/admin/admin-guard";
import { EventForm } from "@/components/admin/event-form";

export default function EditEventPage({ params }: { params: { id: string } }) {
  return (
    <AdminGuard>
      <EventForm id={params.id} />
    </AdminGuard>
  );
}
