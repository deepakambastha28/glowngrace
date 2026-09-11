import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { query, isDbConfigured } from "@/lib/db";
import type { Job } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toStorefrontJob(row: Record<string, unknown>): Job {
  const requirements = Array.isArray(row.requirements)
    ? (row.requirements as string[])
    : [];
  return {
    id: `admin-${String(row.id)}`,
    slug: String(row.slug),
    type: String(row.type ?? "Full Time") as "Full Time" | "Part Time",
    title: String(row.title),
    salon: String(row.salon),
    location: String(row.location),
    salary: String(row.salary_text ?? ""),
    salaryUnit: "per month",
    experience: String(row.experience ?? ""),
    openings: Number(row.openings ?? 1),
    description: String(row.description ?? ""),
    responsibilities: [],
    requirements,
    perks: [],
  };
}

/** GET /api/jobs — storefront jobs: admin-created jobs only (newest first). */
export async function GET() {
  noStore();
  let items: Job[] = [];
  if (isDbConfigured()) {
    const rows = await query(
      `SELECT id, slug, title, salon, location, type, salary_min, salary_max,
              salary_text, experience, openings, description, requirements
       FROM gg_admin_jobs WHERE hidden = false AND status = 'Open' ORDER BY created_at DESC`
    );
    items = (rows ?? []).map(toStorefrontJob);
  }

  return NextResponse.json({ items });
}
