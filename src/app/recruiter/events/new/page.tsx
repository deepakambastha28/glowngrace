"use client";

import { RecruiterGuard } from "@/components/recruiter/recruiter-guard";
import { EventForm } from "@/components/admin/event-form";

export default function RecruiterAddEventPage() {
  return (
    <RecruiterGuard>
      <EventForm backPath="/recruiter/events" cancelPath="/recruiter/events" />
    </RecruiterGuard>
  );
}