"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Briefcase, Users, Check, Heart } from "lucide-react";
import { toast } from "sonner";
import type { Job } from "@/lib/data";
import { fetchJobs } from "@/lib/api";
import { money, jobLocation } from "@/lib/utils";

interface JobDetailPageProps {
  params: { slug: string };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchJobs().then((res) => {
      if (!active) return;
      const items = res.data?.items || [];
      setJob(items.find((j: Job) => j.slug === params.slug));
      setLoaded(true);
    }).catch(() => setLoaded(true));
    return () => { active = false; };
  }, [params.slug]);

  if (loaded && !job) {
    notFound();
  }

  if (!job) {
    return <div className="py-32 text-center text-muted">Loading job…</div>;
  }

  const infoPills = [
    { icon: MapPin, value: job.location },
    { icon: Clock, value: job.type },
    { icon: Briefcase, value: job.experience },
    { icon: Users, value: `${job.openings} opening${job.openings > 1 ? "s" : ""}` },
  ];

  return (
    <div className="pb-16">
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">Home</Link>
          <span className="text-muted">/</span>
          <Link href="/careers" className="hover:text-rose transition-colors">Careers</Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">{job.title}</span>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-6 pt-12 grid lg:grid-cols-[1.6fr_0.7fr] gap-8 items-start">
        <div>
          <span className="job-type">{job.type}</span>
          <h1 className="mt-3 text-[2.4rem] font-bold leading-tight">{job.title}</h1>
          <p className="mt-2 text-muted">🏢 {job.salon} · {jobLocation(job.location)}</p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {infoPills.map(({ icon: Icon, value }) => (
              <span
                key={value}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-blush px-4 py-1.5 text-[0.82rem] font-semibold text-rose"
              >
                <Icon className="h-3.5 w-3.5" /> {value}
              </span>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            <section className="rounded-[16px] border border-line bg-white p-7">
              <h2 className="text-[1.3rem] font-bold mb-4">About the Role</h2>
              <p className="text-charcoal/70 leading-relaxed">{job.description}</p>
            </section>

            {job.occasions && job.occasions.length > 0 && (
              <section className="rounded-[16px] bg-gold/10 p-7">
                <h2 className="text-[1.3rem] font-bold mb-1 text-charcoal">
                  Upcoming Occasions
                </h2>
                <p className="text-[0.85rem] text-muted mb-4">
                  Peak mehndi season — lock in your dates early.
                </p>
                <div className="space-y-2.5">
                  {job.occasions.map((occasion) => (
                    <div
                      key={occasion}
                      className="flex items-center gap-3 rounded-full bg-white px-5 py-3 text-[0.95rem] text-charcoal/80"
                    >
                      <span className="text-lg">🎉</span>
                      {occasion}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-[16px] border border-line bg-white p-7">
              <h2 className="text-[1.3rem] font-bold mb-4">Responsibilities</h2>
              <ul className="space-y-3">
                {job.responsibilities.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-charcoal/70 text-[0.95rem]">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald text-white text-[0.7rem] font-bold">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[16px] border border-line bg-white p-7">
              <h2 className="text-[1.3rem] font-bold mb-4">Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-charcoal/70 text-[0.95rem]">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose text-white text-[0.7rem] font-bold">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[16px] border border-line bg-white p-7">
              <h2 className="text-[1.3rem] font-bold mb-4">Perks &amp; Benefits</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {job.perks.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-full bg-rose-blush px-5 py-3 text-[0.9rem] text-charcoal/80"
                  >
                    <span className="text-rose">✦</span> {item}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 space-y-4">
          <div className="card !rounded-[18px] p-6 text-center">
            <p className="text-muted text-[0.9rem]">Salary range</p>
            <p className="mt-1 text-[1.8rem] font-extrabold text-rose">{job.salary}</p>
            <p className="text-[0.8rem] text-muted">{job.salaryUnit} · {job.experience}</p>
            <div className="mt-4 rounded-full bg-gold/15 px-5 py-2.5 text-[0.85rem] text-charcoal/80">
              ⭐ {job.openings} position{job.openings > 1 ? "s" : ""} available
            </div>
            <Link href={`/careers/${job.slug}/apply`} className="btn-primary w-full mt-6" data-testid="apply-now">
              Apply Now
            </Link>
            <button
              onClick={() => toast.success("Job saved to your favourites 💼")}
              className="btn-outline w-full mt-3"
            >
              <Heart className="h-4 w-4" /> Save Job
            </button>
            <p className="mt-4 text-[0.8rem] text-muted">
              Applications close soon — apply today!
            </p>
          </div>
          <div className="rounded-[18px] bg-rose-blush p-6 text-[0.9rem] text-charcoal/80">
            💡 <strong>Tip:</strong> Tailor your cover note to this role and attach
            a recent resume to stand out.
          </div>
        </aside>
      </div>
    </div>
  );
}