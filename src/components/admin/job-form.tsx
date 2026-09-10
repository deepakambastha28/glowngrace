"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAdminJob, fetchAdminJobs, updateAdminJob } from "@/lib/api";

const locations = ["Hazratganj", "Gomti Nagar", "Aliganj", "Indira Nagar", "Alambagh"];
const types = ["Full Time", "Part Time", "Contract"];
const experiences = ["Fresher", "1+ years", "2+ years", "3+ years", "5+ years"];

export function JobForm({ id }: { id?: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [salon, setSalon] = useState("");
  const [location, setLocation] = useState("Hazratganj");
  const [type, setType] = useState("Full Time");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [openings, setOpenings] = useState("1");
  const [experience, setExperience] = useState("2+ years");
  const [desc, setDesc] = useState("");
  const [reqs, setReqs] = useState("");

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    fetchAdminJobs(id)
      .then((res) => {
        if (!active) return;
        const it = res.data?.item;
        if (!it) return;
        setTitle(it.title);
        setSalon(it.salon);
        setLocation(it.location);
        setType(it.type);
        setSalaryMin(String(it.salaryMin));
        setSalaryMax(String(it.salaryMax));
        setOpenings(String(it.openings));
        setExperience(it.experience);
        setDesc(it.description || "");
        setReqs(Array.isArray(it.requirements) ? it.requirements.join("\n") : "");
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const mn = parseInt(salaryMin) || 0;
  const mx = parseInt(salaryMax) || mn;
  const salaryText = mn > 0 ? `₹${(mn / 1000).toFixed(0)}k–${(mx / 1000).toFixed(0)}k` : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, boolean> = {
      title: !title.trim(),
      salon: !salon.trim(),
      salaryMin: mn <= 0,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    const requirements = reqs.split("\n").map((r) => r.trim()).filter(Boolean);
    const payload = {
      title: title.trim(),
      salon: salon.trim(),
      location,
      type,
      salaryMin: mn,
      salaryMax: mx,
      salaryText,
      experience,
      openings: parseInt(openings) || 1,
      description: desc,
      requirements,
    };
    const res = id ? await updateAdminJob(id, payload) : await createAdminJob(payload);
    setSaving(false);

    if (res.ok) {
      toast.success(res.data?.persisted
        ? (id ? "Job updated successfully ✓" : "Job posted successfully ✓")
        : "Job posted (database not configured — demo only)");
      router.push("/admin/jobs");
    } else {
      toast.error("Could not post job");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="text-sm text-muted mb-1">
          Dashboard / Jobs / <span className="text-rose font-semibold">{id ? "Edit Job" : "Add Job"}</span>
        </div>
        <h1 className="text-3xl font-bold">{id ? "Edit Job" : "Post a New Job"}</h1>
        <p className="mt-1 text-muted">{id ? "Update this vacancy." : "Create a beauty-parlour placement vacancy."}</p>
      </div>

      <form onSubmit={submit}>
        <fieldset
          disabled={loading}
          className="grid lg:grid-cols-[1.7fr_1fr] gap-6 items-start border-0 m-0 p-0 min-w-0"
        >
        <div className="space-y-6">
          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">💼 Position Details</h3>
            <div className="space-y-4">
              <div>
                <label className="field-label">
                  Position Title <span className="text-rose">*</span>
                </label>
                <input
                  className={`field-input ${errors.title ? "!border-red" : ""}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Beautician"
                />
                {errors.title && <p className="mt-1 text-sm text-red">Please enter a position title.</p>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">
                    Salon / Parlour <span className="text-rose">*</span>
                  </label>
                  <input
                    className={`field-input ${errors.salon ? "!border-red" : ""}`}
                    value={salon}
                    onChange={(e) => setSalon(e.target.value)}
                    placeholder="e.g. Blush Beauty Lounge"
                  />
                  {errors.salon && <p className="mt-1 text-sm text-red">Please enter a salon name.</p>}
                </div>
                <div>
                  <label className="field-label">Location</label>
                  <select className="field-input" value={location} onChange={(e) => setLocation(e.target.value)}>
                    {locations.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label">Employment Type</label>
                <div className="flex flex-wrap gap-2">
                  {types.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        type === t
                          ? "border-transparent bg-gradient-to-br from-rose to-rose-dark text-white"
                          : "border-line text-muted hover:border-rose-soft"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">💵 Compensation &amp; Experience</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="field-label">
                  Min Salary (₹/mo) <span className="text-rose">*</span>
                </label>
                <input
                  type="number"
                  className={`field-input ${errors.salaryMin ? "!border-red" : ""}`}
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="18000"
                />
                {errors.salaryMin && <p className="mt-1 text-sm text-red">Enter min salary.</p>}
              </div>
              <div>
                <label className="field-label">Max Salary (₹/mo)</label>
                <input type="number" className="field-input" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="25000" />
              </div>
              <div>
                <label className="field-label">Openings</label>
                <input type="number" className="field-input" value={openings} onChange={(e) => setOpenings(e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <label className="field-label">Experience Required</label>
              <select className="field-input" value={experience} onChange={(e) => setExperience(e.target.value)}>
                {experiences.map((ex) => <option key={ex}>{ex}</option>)}
              </select>
            </div>
          </div>

          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Job Description</h3>
            <div className="space-y-4">
              <div>
                <label className="field-label">Role Summary</label>
                <textarea
                  className="field-textarea min-h-[90px]"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Describe the role, responsibilities and expectations..."
                />
              </div>
              <div>
                <label className="field-label">Key Requirements</label>
                <textarea
                  className="field-textarea min-h-[90px]"
                  value={reqs}
                  onChange={(e) => setReqs(e.target.value)}
                  placeholder={"One per line — e.g.\nCertified diploma, salon experience, good communication..."}
                />
                <p className="mt-1 text-xs text-muted">One requirement per line.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Job Preview</h3>
            <div className="rounded-[14px] bg-gradient-to-br from-blush to-[#fbe0ea] p-6">
              <span className="p-pill grey mb-2 inline-block">{type}</span>
              <div className="font-heading text-xl font-semibold">{title || "Position Title"}</div>
              <div className="mt-1 text-sm text-muted">
                🏢 {salon || "Salon"} · {location}
              </div>
              <div className="mt-2 text-xl font-bold text-rose">
                {salaryText || "₹0"}<span className="text-sm font-normal text-muted">/mo</span>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted">Experience</span><b>{experience}</b></div>
              <div className="flex justify-between"><span className="text-muted">Openings</span><b>{openings || 1} position(s)</b></div>
              <div className="flex justify-between"><span className="text-muted">Status</span><b>Open</b></div>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => router.push("/admin")} className="btn-outline flex-1 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
                {saving ? "Saving…" : id ? "Update Job" : "Post Job"}
              </button>
            </div>
          </div>
        </div>
        </fieldset>
      </form>
    </div>
  );
}
