"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, Briefcase, ArrowRight, Check } from "lucide-react";
import type { Job } from "@/lib/data";
import { fetchJobs } from "@/lib/api";
import { jobLocation } from "@/lib/utils";
import { useAuthStore, activeTier } from "@/lib/auth";

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const user = useAuthStore((s) => s.user);
  const tier = activeTier(user);

  useEffect(() => {
    let active = true;
    fetchJobs().then((res) => {
      if (!active) return;
      if (res.data?.items?.length) setJobs(res.data.items);
    });
    return () => { active = false; };
  }, []);

  const visibleJobs = tier === "free" ? jobs.filter((j) => !j.verified) : jobs;

  return (
    <div className="pb-16">
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">Home</Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">Careers</span>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-6 pt-14">
        <div className="section-head">
          <p className="eyebrow">Careers</p>
          <h1>Build Your Beauty Career With Us</h1>
          <p>
            {visibleJobs.length} open positions across Lucknow&apos;s premium salons — with
            training, growth and empowerment for every woman.
          </p>
        </div>

        {visibleJobs.length === 0 ? (
          <div className="card !rounded-[16px] p-10 text-center" data-testid="job-grid-empty">
            <p className="text-muted font-semibold">No open positions right now.</p>
            <p className="text-sm text-muted/70 mt-1">
              Join a paid membership to unlock Genuine Job Hunt Listings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="job-grid">
            {visibleJobs.map((job) => (
              <div key={job.id} className="card !rounded-[16px] p-[26px_28px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="job-type">{job.type}</span>
                    {job.verified && (
                      <span className="verified-badge" data-testid="verified-badge">
                        <Check className="h-3.5 w-3.5" /> Genuine Job Hunt Listing
                      </span>
                    )}
                    <h2 className="text-[1.2rem] mt-2 mb-1">
                      <Link href={`/careers/${job.slug}`} className="hover:text-rose transition-colors">
                        {job.title}
                      </Link>
                    </h2>
                    <p className="text-muted text-[0.85rem]">🏢 {job.salon}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-muted text-[0.83rem] mt-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {jobLocation(job.location)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" /> {job.experience}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {job.openings} opening{job.openings > 1 && "s"}
                  </span>
                </div>

                <div className="mt-4 mb-5 flex items-center justify-between">
                  <span className="text-[1.3rem] font-extrabold text-rose">{job.salary}</span>
                  <span className="text-[0.8rem] text-muted">{job.salaryUnit}</span>
                </div>

                <div className="flex gap-2.5">
                  <Link href={`/careers/${job.slug}`} className="btn btn-outline flex-1">
                    View Details
                  </Link>
                  <Link href={`/careers/${job.slug}/apply`} className="btn btn-primary flex-1">
                    Apply Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}