"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, Briefcase, ArrowRight, Check } from "lucide-react";
import type { Job } from "@/lib/data";
import { fetchJobs, fetchCareerConfig } from "@/lib/api";
import { jobLocation } from "@/lib/utils";
import { useAuthStore, activeTier } from "@/lib/auth";
import {
  DEFAULT_CAREER_CONFIG,
  normalizeCareerConfig,
  type CareerConfig,
  type CareerSectionKey,
} from "@/lib/career-config";
import { CtaBanner } from "@/components/home/cta-banner";

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [config, setConfig] = useState<CareerConfig>(DEFAULT_CAREER_CONFIG);
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

  useEffect(() => {
    let active = true;
    fetchCareerConfig().then((res) => {
      if (!active) return;
      setConfig(normalizeCareerConfig(res.data?.config ?? DEFAULT_CAREER_CONFIG));
    });
    return () => {
      active = false;
    };
  }, []);

  const visibleJobs = tier === "free" ? jobs.filter((j) => !j.verified) : jobs;

  const isSectionVisible = (key: CareerSectionKey): boolean => {
    const section = config.sections.find((s) => s.key === key);
    return section ? section.visible && !section.deleted : true;
  };

  const headingDescription = config.heading.description.replace(
    "{{count}}",
    String(visibleJobs.length)
  );

  return (
    <div className="pb-16">
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">Home</Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">Careers</span>
        </div>
      </div>

      {isSectionVisible("heading") && (
        <div className="mx-auto max-w-screen-xl px-6 pt-14">
          <div className="section-head" data-testid="career-heading">
            <p className="eyebrow">{config.heading.eyebrow}</p>
            <h1>{config.heading.title}</h1>
            <p>{headingDescription}</p>
          </div>
        </div>
      )}

      {isSectionVisible("services") && (
        <section className="section bg-rose-blush" data-testid="career-services">
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="section-head">
              <p className="eyebrow">{config.services.eyebrow}</p>
              <h2>{config.services.title}</h2>
              <p>{config.services.description}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.services.items.map((service, index) => (
                <div key={index} className="card !rounded-[18px] p-[28px_24px] text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-gradient text-3xl">
                    {service.emoji}
                  </div>
                  {service.title && (
                    <h3 className="mt-5 text-[1.1rem] mb-2">{service.title}</h3>
                  )}
                  {service.description && (
                    <p className="text-[0.88rem] text-muted leading-relaxed">
                      {service.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {isSectionVisible("steps") && (
        <section className="section" data-testid="career-steps">
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="section-head">
              <p className="eyebrow">{config.steps.eyebrow}</p>
              <h2>{config.steps.title}</h2>
              <p>{config.steps.description}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {config.steps.items.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-gradient text-[1.5rem] font-bold text-white shadow-gold">
                    {index + 1}
                  </div>
                  {step.title && <h3 className="text-[1.1rem] mb-1.5">{step.title}</h3>}
                  {step.description && (
                    <p className="text-[0.85rem] text-muted">{step.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {isSectionVisible("jobs") && (
        <section className="section bg-rose-blush" data-testid="career-jobs">
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="section-head">
              <p className="eyebrow">{config.jobs.eyebrow}</p>
              <h2>{config.jobs.title}</h2>
              <p>{config.jobs.description}</p>
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
                        <h3 className="text-[1.2rem] mt-2 mb-1">
                          <Link href={`/careers/${job.slug}`} className="hover:text-rose transition-colors">
                            {job.title}
                          </Link>
                        </h3>
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
        </section>
      )}

      {isSectionVisible("cta") && (
        <div data-testid="career-cta">
          <CtaBanner content={config.cta} />
        </div>
      )}
    </div>
  );
}