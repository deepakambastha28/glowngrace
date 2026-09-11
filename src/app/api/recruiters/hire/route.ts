import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";

/** POST /api/recruiters/hire — mark a candidate as hired by a recruiter. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, recruiterEmail, candidateName, candidateEmail } = body;

    if (!candidateId || !recruiterEmail || !candidateName || !candidateEmail) {
      return NextResponse.json(
        { hired: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({
        hired: false,
        message: "Database not configured — hire acknowledged without persistence.",
      });
    }

    const existing = await query(
      `SELECT id FROM gg_recruiter_hires
       WHERE recruiter_email = $1 AND candidate_id = $2 LIMIT 1`,
      [recruiterEmail, Number(candidateId)]
    );

    if (existing && existing.length > 0) {
      await query(
        `UPDATE gg_candidates SET status = 'Hired' WHERE id = $1`,
        [Number(candidateId)]
      );
      return NextResponse.json({ hired: true, alreadyHired: true });
    }

    const rows = await query(
      `INSERT INTO gg_recruiter_hires
        (recruiter_email, candidate_id, candidate_name, candidate_email)
       VALUES ($1,$2,$3,$4)
       RETURNING id`,
      [recruiterEmail, Number(candidateId), candidateName, candidateEmail]
    );

    await query(
      `UPDATE gg_candidates SET status = 'Hired' WHERE id = $1`,
      [Number(candidateId)]
    );

    const id = rows?.[0]?.id;
    return NextResponse.json({ hired: true, id });
  } catch (error) {
    console.error("POST /api/recruiters/hire failed", error);
    return NextResponse.json(
      { hired: false, error: "Could not hire candidate" },
      { status: 500 }
    );
  }
}