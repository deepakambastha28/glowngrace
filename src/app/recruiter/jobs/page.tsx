"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, MapPin, Clock, Users } from "lucide-react";
import { fetchJobs } from "@/lib/api";
import type { Job } from "@/lib/data";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs().then((res) => {
      setJobs(Array.isArray(res.data?.items) ? res.data.items : []);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Jobs</h1>
        <p className="mt-1 text-muted">
          Live openings across partner salons on Glow &amp; Grace.
        </p>
      </div>

      {loading ? (
        <div className="card !shadow-lg p-8 text-center text-muted">Loading jobs…</div>
      ) : jobs.length ? (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="card !shadow-lg p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold leading-snug">{job.title}</h3>
                  <div className="text-sm text-muted mt-0.5">{job.salon}</div>
                </div>
                <span className="job-type shrink-0">{job.type}</span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-charcoal/75">
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#2e9e6b]" /> {job.location}
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4 text-[#2e9e6b]" /> {job.salary} {job.salaryUnit || ""}
                  </div>
                )}
                {job.experience && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#2e9e6b]" /> {job.experience}
                  </div>
                )}
                {job.openings != null && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#2e9e6b]" /> {job.openings} opening(s)
                  </div>
                )}
              </div>

              <Link
                href={`/careers/${job.slug}`}
                className="btn-outline !rounded-full mt-5 w-full text-sm"
              >
                View &amp; share opening
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="card !shadow-lg p-10 text-center">
          <BriefcaseBusiness className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-muted">No open jobs right now. Check back soon.</p>
          <Link href="/careers" className="btn-primary mt-5 inline-block">
            Browse careers board
          </Link>
        </div>
      )}
    </div>
  );
}