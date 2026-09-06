import Link from "next/link";
import { jobs } from "@/lib/data";
import { jobLocation } from "@/lib/utils";

export function JobVacancies() {
  return (
    <section className="section bg-rose-blush" id="jobs" data-testid="jobs-section">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="section-head">
          <p className="eyebrow">Latest Openings</p>
          <h2>Current Beauty Job Vacancies</h2>
          <p>Fresh opportunities from trusted parlours &amp; salons in Lucknow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="job-grid">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="card !rounded-[16px] p-[26px_28px]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="job-type">{job.type}</span>
                  <h3 className="text-[1.2rem] mt-2 mb-1">
                    <Link href={`/careers/${job.slug}`} className="hover:text-rose transition-colors">
                      {job.title}
                    </Link>
                  </h3>
                  <p className="text-muted text-[0.85rem]">🏢 {job.salon}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-muted text-[0.82rem] mt-4 mb-4">
                <span className="flex items-center gap-1.5">📍 {jobLocation(job.location)}</span>
                <span className="flex items-center gap-1.5">💰 {job.salary} {job.salaryUnit}</span>
                <span className="flex items-center gap-1.5">🕒 {job.experience}</span>
              </div>
              <div className="flex gap-2.5">
                <Link
                  href={`/careers/${job.slug}`}
                  className="btn btn-outline !px-5 !py-2.5 !text-[0.85rem]"
                >
                  View Details
                </Link>
                <Link
                  href={`/careers/${job.slug}/apply`}
                  className="btn btn-primary !px-5 !py-2.5 !text-[0.85rem]"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}