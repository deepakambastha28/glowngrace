"use client";

import { useParams } from "next/navigation";
import { RecruiterGuard } from "@/components/recruiter/recruiter-guard";
import { JobForm } from "@/components/admin/job-form";

export default function RecruiterEditJobPage() {
  const params = useParams();
  const id = String(params.id);
  return (
    <RecruiterGuard>
      <JobForm
        id={id}
        backPath="/recruiter/jobs"
        cancelPath="/recruiter/jobs"
        submitStatus="Pending"
        resetStatusOnUpdate="Pending"
      />
    </RecruiterGuard>
  );
}