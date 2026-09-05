"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Briefcase, Users, Check } from "lucide-react";
import { jobs } from "@/lib/data";
import { money } from "@/lib/utils";

interface JobDetailPageProps {
  params: { slug: string };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const job = jobs.find((j) => j.slug === params.slug);

  if (!job) {
    notFound();
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
          <p className="mt-2 text-muted">🏢 {job.salon} · {job.location}, Lucknow</p>

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
            <p className="text-[0.8rem] text-muted">per month · {job.experience}</p>
            <div className="mt-4 rounded-full bg-gold/15 px-5 py-2.5 text-[0.85rem] text-charcoal/80">
              ⭐ {job.openings} position{job.openings > 1 ? "s" : ""} available
            </div>
            <Link href={`/careers/${job.slug}/apply`} className="btn-primary w-full mt-6" data-testid="apply-now">
              Apply Now
            </Link>
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