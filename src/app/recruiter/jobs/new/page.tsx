"use client";

import { RecruiterGuard } from "@/components/recruiter/recruiter-guard";
import { JobForm } from "@/components/admin/job-form";

export default function RecruiterAddJobPage() {
  return (
    <RecruiterGuard>
      <JobForm
        backPath="/recruiter/jobs"
        cancelPath="/recruiter/jobs"
        submitStatus="Pending"
      />
    </RecruiterGuard>
  );
}