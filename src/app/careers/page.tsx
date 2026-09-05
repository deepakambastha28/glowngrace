"use client";

import Link from "next/link";
import { MapPin, Clock, Briefcase, ArrowRight } from "lucide-react";
import { jobs } from "@/lib/data";

export default function CareersPage() {
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
            {jobs.length} open positions across Lucknow&apos;s premium salons — with
            training, growth and empowerment for every woman.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="job-grid">
          {jobs.map((job) => (
            <div key={job.id} className="card !rounded-[16px] p-[26px_28px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="job-type">{job.type}</span>
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
                  <MapPin className="h-4 w-4" /> {job.location}, Lucknow
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
                <span className="text-[0.8rem] text-muted">per month</span>
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
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-screen-xl px-6 mt-16">
        <div className="rounded-[28px] bg-dark-gradient px-8 py-[50px] text-center relative overflow-hidden">
          <span className="pointer-events-none absolute top-[-20px] left-8 text-[4.5rem] opacity-10">💼</span>
          <span className="pointer-events-none absolute bottom-[-20px] right-8 text-[4.5rem] opacity-10">💄</span>
          <h2 className="text-white text-[1.8rem] md:text-[2.1rem] mb-3">
            Representing Globally Recognised Beauty Brands
          </h2>
          <p className="text-[#d9cbd8] max-w-xl mx-auto mb-8">
            Become a verified partner salon and hire trained, passionate
            professionals through Glow &amp; Grace.
          </p>
          <Link href="/#services" className="btn-gold">
            Become a Partner Salon
          </Link>
        </div>
      </div>
    </div>
  );
}