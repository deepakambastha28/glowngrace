"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/admin-guard";
import { fetchAdminCandidate, updateAdminCandidate } from "@/lib/api";

const experiences = ["Fresher", "1+ years", "2+ years", "3+ years", "5+ years"];

function CandidateEditForm({ id }: { id: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [experience, setExperience] = useState("Fresher");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [bio, setBio] = useState("");
  const [skillsText, setSkillsText] = useState("");

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    fetchAdminCandidate(id)
      .then((res) => {
        if (!active) return;
        const it = res.data?.item;
        if (!it) return;
        setFullName(it.fullName);
        setPhone(it.phone || "");
        setEmail(it.email || "");
        setCity(it.city || "");
        setExperience(experiences.includes(it.experience) ? it.experience : "Fresher");
        setSpecialization(it.specialization || "");
        setQualification(it.qualification || "");
        setBio(it.bio || "");
        setSkillsText(Array.isArray(it.skills) ? it.skills.join(", ") : "");
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, boolean> = {
      fullName: !fullName.trim(),
      phone: phone.trim().length < 10,
      email: !email.includes("@"),
      city: !city.trim(),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await updateAdminCandidate(id, {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      experience,
      specialization,
      qualification,
      bio: bio.slice(0, 600),
      skills,
    });
    setSaving(false);

    if (res.data?.persisted) {
      toast.success("Candidate updated successfully ✓");
      router.push("/admin/candidates");
    } else {
      toast.error("Could not update candidate");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="text-sm text-muted mb-1">
          Dashboard / Candidates / <span className="text-rose font-semibold">Edit Candidate</span>
        </div>
        <h1 className="text-3xl font-bold">Edit Candidate</h1>
        <p className="mt-1 text-muted">Update this candidate profile.</p>
      </div>

      <form onSubmit={submit}>
        <fieldset disabled={loading} className="space-y-6 border-0 m-0 p-0 min-w-0">
        <div className="card !shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">👤 Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="cd-full-name">
                Full Name <span className="text-rose">*</span>
              </label>
              <input
                id="cd-full-name"
                className={`field-input ${errors.fullName ? "!border-red" : ""}`}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red">Please enter a name.</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label" htmlFor="cd-phone">
                  Phone <span className="text-rose">*</span>
                </label>
                <input
                  id="cd-phone"
                  className={`field-input ${errors.phone ? "!border-red" : ""}`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="cd-email">
                  Email <span className="text-rose">*</span>
                </label>
                <input
                  id="cd-email"
                  type="email"
                  className={`field-input ${errors.email ? "!border-red" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. priya@example.com"
                />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="cd-city">
                City <span className="text-rose">*</span>
              </label>
              <input
                id="cd-city"
                className={`field-input ${errors.city ? "!border-red" : ""}`}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Lucknow"
              />
              {errors.city && <p className="mt-1 text-sm text-red">Please enter a city.</p>}
            </div>
          </div>
        </div>

        <div className="card !shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">💼 Career Details</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label" htmlFor="cd-experience">Experience</label>
                <select
                  id="cd-experience"
                  className="field-input"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                >
                  {experiences.map((ex) => <option key={ex}>{ex}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="cd-specialization">Specialization</label>
                <input
                  id="cd-specialization"
                  className="field-input"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Skincare"
                />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="cd-qualification">Qualification</label>
              <input
                id="cd-qualification"
                className="field-input"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. B.Sc Cosmetology"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="cd-skills">Skills</label>
              <input
                id="cd-skills"
                className="field-input"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Comma separated — e.g. Facial, Waxing, Threading"
              />
            </div>
          </div>
        </div>

        <div className="card !shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📝 Bio</h3>
          <textarea
            className="field-textarea min-h-[110px]"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={"A short introduction..."}
          />
          <p className="mt-1 text-xs text-muted">{bio.length}/600 characters</p>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/admin/candidates")} className="btn-outline flex-1 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={saving || loading} className="btn-primary flex-1 text-sm">
            {saving ? "Saving…" : "Save Candidate"}
          </button>
        </div>
        </fieldset>
      </form>
    </div>
  );
}

export default function EditCandidatePage() {
  const params = useParams();
  const id = String(params.id);
  return (
    <AdminGuard>
      <CandidateEditForm id={id} />
    </AdminGuard>
  );
}